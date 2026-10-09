import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { createGazeFrameCache, nearbyFrames } from '../../src/components/cat/gazeFrameCache.js'
import { advanceGaze, atlasIndex } from '../../src/components/cat/gazeMotion.js'

const flush = () => setImmediate()
const frames = Array.from({ length: 841 }, (_, index) => String(index))

test('dense grid reaches every direction and preserves the 25 anchor coordinates', () => {
  const visited = new Set()
  for (let row = 0; row < 29; row++) for (let col = 0; col < 29; col++) {
    visited.add(atlasIndex({ x: col / 14 - 1, y: row / 14 - 1 }, 29))
  }
  assert.equal(visited.size, 841)
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    assert.equal(atlasIndex({ x: col / 2 - 1, y: row / 2 - 1 }, 29), row * 7 * 29 + col * 7)
  }
  assert.equal(atlasIndex({ x: 8, y: -8 }, 29), 28)
})

test('damping converges at different refresh rates and immediately accepts a reversal', () => {
  for (const dt of [8, 16, 32]) {
    let p = { x: -1, y: -1 }
    for (let time = 0; time < 900; time += dt) {
      const next = advanceGaze(p, { x: 1, y: 1 }, dt, 0.006)
      assert.ok(next.x >= p.x && next.x <= 1)
      p = next
    }
    assert.deepEqual(p, { x: 1, y: 1 })
    assert.ok(advanceGaze(p, { x: -1, y: -1 }, dt, 0.006).x < p.x)
  }
})

test('prefetch never wraps rows or escapes the grid', () => {
  for (let i = 0; i < frames.length; i++) {
    const nearby = nearbyFrames(i, Math.max(0, i - 1), 29)
    assert.equal(nearby[0], i)
    assert.equal(nearby.length, new Set(nearby).size)
    assert.ok(nearby.length <= 64)
    assert.ok(nearby.every(n => n >= 0 && n < 841 && Math.abs(n % 29 - i % 29) <= 5))
  }
})

test('stale completions cannot repaint, even when a decoder ignores cancellation', async () => {
  const requests = new Map()
  const drawn = []
  const closed = []
  const cache = createGazeFrameCache({ frames, side: 29, concurrency: 1,
    load: url => new Promise(resolve => requests.set(url, resolve)),
    onFrame: index => drawn.push(index),
  })
  cache.aim(0)
  await flush()
  cache.aim(840)
  requests.get('0')({ close: () => closed.push(0) })
  await flush()
  assert.deepEqual(drawn, [])
  assert.deepEqual(closed, [0])
  requests.get('840')({ close: () => closed.push(840) })
  await flush()
  assert.deepEqual(drawn, [840])
  cache.dispose()
  assert.ok(closed.includes(840))
})

test('decoded memory and concurrent work are bounded; dispose closes every bitmap', async () => {
  let created = 0, closed = 0
  const cache = createGazeFrameCache({ frames, side: 29, capacity: 36, concurrency: 4,
    load: async () => { created++; return { close: () => { closed++ } } },
  })
  for (const index of [420, 0, 840, 28, 812, 406, 434, 420]) {
    cache.aim(index)
    assert.ok(cache.pending <= 4)
    await flush()
    assert.ok(cache.size <= 36)
    assert.equal(created - closed, cache.size)
  }
  cache.dispose()
  await flush()
  assert.equal(closed, created)
  assert.equal(cache.size, 0)
})

test('failed requests do not retry in a loop or prevent another direction from loading', async () => {
  let attempts = 0
  const drawn = []
  const cache = createGazeFrameCache({ frames, side: 29,
    load: async url => {
      if (url === '420') { attempts++; throw new Error('offline') }
      return { close() {} }
    }, onFrame: index => drawn.push(index),
  })
  cache.aim(420)
  await flush()
  cache.aim(420)
  cache.aim(421)
  await flush()
  assert.equal(attempts, 1)
  assert.equal(drawn.at(-1), 421)
  cache.dispose()
})

test('paused cache starts no new work and resumes at the latest target', async () => {
  const loaded = []
  const cache = createGazeFrameCache({ frames, side: 29,
    load: async url => { loaded.push(url); return { close() {} } },
  })
  cache.setPaused(true)
  cache.aim(0)
  cache.aim(840)
  await flush()
  assert.deepEqual(loaded, [])
  cache.setPaused(false)
  await flush()
  assert.equal(loaded[0], '840')
  cache.dispose()
})

test('responsive tracking reaches a large turn quickly without overshoot', () => {
  for (const dt of [8, 16, 32]) {
    let position={x:-1,y:-1}; let atTarget=0
    for(let time=0;time<500;time+=dt){
      position=advanceGaze(position,{x:1,y:1},dt,0.018,30)
      assert.ok(position.x<=1&&position.y<=1)
      if(atlasIndex(position,29)===840){atTarget=time+dt;break}
    }
    assert.ok(atTarget>0&&atTarget<=200, `target reached in ${atTarget}ms at dt=${dt}`)
    assert.ok(advanceGaze(position,{x:-1,y:-1},dt,0.018,30).x<position.x)
  }
})

test('a ready neighbor avoids freezing while the requested frame decodes', async () => {
  const pending = new Map(); const drawn=[]
  const cache=createGazeFrameCache({frames,side:29,concurrency:4,
    load:(url,signal)=>new Promise((resolve,reject)=>{
      pending.set(url,resolve)
      signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true})
    }),onFrame:i=>drawn.push(i)})
  cache.aim(420);await flush()
  pending.get('420')({close(){}});await flush()
  // First-ring frame is in flight. It can represent a missing immediate neighbor.
  const adjacent=[...pending.keys()].map(Number).find(i=>i!==420&&Math.abs(i%29-14)<=1&&Math.abs(Math.floor(i/29)-14)<=1)
  pending.get(String(adjacent))({close(){}});await flush()
  const destination=adjacent-29
  cache.aim(destination);await flush()
  assert.equal(drawn.at(-1),adjacent)
  pending.get(String(destination))({close(){}});await flush()
  assert.equal(drawn.at(-1),destination)
  cache.dispose()
})

test('small retargets keep useful pending downloads alive', async () => {
 const pending=new Map()
 const cache=createGazeFrameCache({frames,side:29,concurrency:4,
  load:(url,signal)=>new Promise(resolve=>pending.set(url,{resolve,signal}))})
 cache.aim(420);await flush()
 const first=pending.get('420')
 cache.aim(421);await flush()
 assert.equal(first.signal.aborted,false)
 cache.dispose()
})

test('a target can load immediately without cancelling useful speculative requests', async () => {
  const pending = new Map()
  const cache = createGazeFrameCache({frames, side: 29, concurrency: 4,
    load: (url, signal) => new Promise(resolve => pending.set(url, {resolve, signal})),
  })
  cache.aim(420)
  await flush()
  const existing = [...pending.values()]
  cache.aim(424)
  await flush()
  assert.ok(pending.has('424'), 'new direction has its own available download slot')
  assert.ok(existing.every(request => !request.signal.aborted))
  assert.ok(cache.pending <= 4)
  cache.dispose()
  for (const request of pending.values()) request.resolve({close(){}})
  await flush()
})

test('continuous turns keep advancing with 90ms network latency', async () => {
  let now = 0, displayed = 420, lastPaint = 0, maxHold = 0, error = 0, samples = 0
  let created = 0, closed = 0
  const pending = [], downloaded = new Set()
  const cache = createGazeFrameCache({frames, side: 29,
    load: (url, signal) => new Promise((resolve, reject) => {
      const job = {at: now + (downloaded.has(url) ? 6 : 90), url, resolve, done: false}
      pending.push(job)
      signal.addEventListener('abort', () => {
        if (!job.done) { job.done = true; reject(new Error('aborted')) }
      }, {once:true})
    }),
    onFrame: index => {
      displayed = index
      if (now >= 608) maxHold = Math.max(maxHold, now - lastPaint)
      lastPaint = now
    },
  })
  const tick = async () => {
    for (const job of pending) if (!job.done && job.at <= now) {
      job.done = true
      downloaded.add(job.url)
      created++
      job.resolve({close(){closed++}})
    }
    await flush()
    assert.ok(cache.size <= 64)
    assert.ok(cache.pending <= 8)
  }
  cache.aim(420)
  for (now = 0; now < 608; now += 16) await tick()
  lastPaint = now
  for (; now < 6608; now += 16) {
    const angle = (now - 608) / 2400 * Math.PI * 2
    const row = Math.round(14 + 11 * Math.sin(angle))
    const col = Math.round(14 + 11 * Math.cos(angle))
    cache.aim(row * 29 + col)
    await tick()
    error += Math.hypot(row - Math.floor(displayed / 29), col - displayed % 29)
    samples++
  }
  assert.ok(maxHold <= 200, `moving pose held for ${maxHold}ms`)
  assert.ok(error / samples < 1.5, `average direction lag ${error / samples} cells`)
  cache.dispose()
  await flush()
  assert.equal(created, closed)
})

test('first wide turns can use preloaded poses without waiting for more downloads', async () => {
  const drawn = []
  let initialWarmup = true
  const cache = createGazeFrameCache({frames, side:29,
    load: (url, signal) => initialWarmup ? Promise.resolve({close(){}}) : new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true})
      if (signal.aborted) reject(new Error('aborted'))
    }),
    onFrame: index => drawn.push(index),
  })
  cache.aim(420)
  await flush()
  initialWarmup = false
  // No further network request can finish: all 25 source directions should
  // already be available, including those far from the starting center pose.
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    const index = row * 7 * 29 + col * 7
    cache.aim(index)
    assert.equal(drawn.at(-1), index)
  }
  assert.ok(cache.size <= 64)
  cache.dispose()
  await flush()
})
