import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as flush } from 'node:timers/promises'
import { createImageSequenceLoader } from '../src/lib/imageSequenceLoader.js'

test('Retro downloads pause for Cat and resume without repeating completed frames', async () => {
  const urls = ['a', 'b', 'c', 'd', 'e', 'f']
  const requested = [], pending = new Map()
  let completed
  const loader = createImageSequenceLoader({ urls, concurrency:2,
    load: (url, signal) => new Promise((resolve, reject) => {
      requested.push(url)
      pending.set(url, {resolve, signal})
      signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true})
    }), onComplete: images => { completed = images },
  })
  await flush()
  assert.deepEqual(requested, [])
  loader.setPaused(false)
  await flush()
  assert.equal(requested.length, 2)
  pending.get('a').resolve('image-a')
  await flush()
  loader.setPaused(true)
  const countAtPause = requested.length
  assert.ok(pending.get('b').signal.aborted)
  await flush()
  assert.equal(loader.pending, 0)
  assert.equal(requested.length, countAtPause)
  assert.equal(completed, undefined)
  loader.setPaused(false)
  await flush()
  for (let i = 0; i < urls.length; i++) {
    for (const [url, request] of pending) if (!request.signal.aborted) request.resolve(`image-${url}`)
    await flush()
    assert.ok(loader.pending <= 2)
  }
  assert.equal(requested.filter(url => url === 'a').length, 1)
  assert.deepEqual(completed, urls.map(url => `image-${url}`))
  loader.dispose()
})

test('disposing ignores late downloads, including a decoder that ignores abort', async () => {
  let resolve, completed = false
  const loader = createImageSequenceLoader({urls:['a'],
    load: () => new Promise(done => { resolve = done }),
    onComplete: () => { completed = true },
  })
  loader.setPaused(false)
  await flush()
  loader.dispose()
  resolve('old image')
  await flush()
  assert.equal(completed, false)
})

test('failed images do not prevent the rest of the Retro sequence from completing', async () => {
  let completed
  const loader = createImageSequenceLoader({urls:['a','bad','b'],
    load: async url => { if (url === 'bad') throw new Error('404'); return url },
    onComplete: images => { completed = images },
  })
  loader.setPaused(false)
  await flush()
  assert.deepEqual(completed, ['a', 'b'])
  loader.dispose()
})
