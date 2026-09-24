// Only decoded images near the current pose stay in memory. The HTTP cache
// retains previously visited WebPs; we never decode the entire 29 × 29 atlas.
export async function loadGazeBitmap(url, signal) {
  const response = await fetch(url, { signal, cache: 'force-cache' })
  if (!response.ok) throw new Error(`Cat frame: ${response.status}`)
  const blob = await response.blob()
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)

  const objectUrl = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()
    return image
  } finally { URL.revokeObjectURL(objectUrl) }
}

export function nearbyFrames(index, previous, side) {
  const row = Math.floor(index / side)
  const col = index % side
  const dr = previous == null ? 0 : Math.sign(row - Math.floor(previous / side))
  const dc = previous == null ? 0 : Math.sign(col - previous % side)
  const indices = new Set([index])
  const add = (r, c) => {
    if (r >= 0 && r < side && c >= 0 && c < side) indices.add(r * side + c)
  }
  // Prepare the next visible poses before spending slots behind the pointer.
  for (let step = 1; step <= 5; step++) add(row + dr * step, col + dc * step)
  for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) add(row + r, col + c)
  for (let radius = 2; radius <= 3; radius++) {
    for (let r = -radius; r <= radius; r++) {
      for (let c = -radius; c <= radius; c++) {
        if (Math.abs(r) + Math.abs(c) === radius) add(row + r, col + c)
      }
    }
  }
  return [...indices]
}

export function createGazeFrameCache({
  frames, side, capacity = 36, concurrency = 4, load = loadGazeBitmap,
  onFrame = () => {}, onError = () => {},
}) {
  const decoded = new Map()
  const active = new Map()
  const failed = new Set()
  let priority = []
  let target = null
  let disposed = false
  let paused = false
  let displayed = null
  const close = bitmap => bitmap.close?.()
  const distance = (a, b) => (Math.floor(a / side) - Math.floor(b / side)) ** 2 + (a % side - b % side) ** 2

  const touch = index => {
    const bitmap = decoded.get(index)
    if (bitmap) {
      decoded.delete(index)
      decoded.set(index, bitmap)
    }
    return bitmap
  }
  const trim = () => {
    while (decoded.size > capacity) {
      // Preserve nearby poses during a turn, even if a stale request finishes.
      const evict = [...decoded.keys()].find(index => !priority.includes(index)) ?? decoded.keys().next().value
      close(decoded.get(evict))
      decoded.delete(evict)
    }
  }
  const paint = () => {
    // At most one neighboring angle can stand in while the exact frame loads.
    // Judge late completions against the latest target, never their old request.
    let nearest = decoded.has(target) ? target : null
    if (nearest === null) for (const index of decoded.keys()) {
      if (distance(index, target) <= 2 && (nearest === null || distance(index, target) < distance(nearest, target))) nearest = index
    }
    if (nearest === null || nearest === displayed) return
    if (displayed !== null && distance(displayed, target) <= distance(nearest, target)) return
    displayed = nearest
    onFrame(nearest, touch(nearest))
  }
  const pump = () => {
    if (disposed || paused) return
    while (active.size < concurrency) {
      const index = priority.find(i => !decoded.has(i) && !active.has(i) && !failed.has(i))
      if (index === undefined) break
      const controller = new AbortController()
      active.set(index, controller)
      Promise.resolve().then(() => load(frames[index], controller.signal)).then(bitmap => {
        if (disposed || controller.signal.aborted) { close(bitmap); return }
        decoded.set(index, bitmap)
        trim()
        // Old requests may warm the cache, but never repaint an obsolete pose.
        paint()
      }).catch(error => {
        if (!disposed && !controller.signal.aborted) {
          failed.add(index)
          onError(index, error)
        }
      }).finally(() => {
        active.delete(index)
        pump()
      })
    }
  }

  return {
    aim(index) {
      if (disposed || !Number.isInteger(index) || index < 0 || index >= frames.length) return
      if (index !== target) priority = nearbyFrames(index, target, side).slice(0, capacity)
      target = index
      // Nearby work survives small pointer changes, so requests can finish.
      // A distant reversal still cancels stale work immediately.
      for (const [i, controller] of active) if (distance(i, index) > 64) controller.abort()
      if (!decoded.has(index) && !active.has(index) && active.size >= concurrency) {
        const expendable = [...active.keys()].filter(i => i !== index)
          .sort((a, b) => distance(b, index) - distance(a, index))[0]
        active.get(expendable)?.abort()
      }
      paint()
      if (failed.has(index)) onError(index, new Error('Cat frame unavailable'))
      pump()
    },
    setPaused(value) {
      paused = value
      if (paused) for (const controller of active.values()) controller.abort()
      else pump()
    },
    get size() { return decoded.size },
    get pending() { return active.size },
    dispose() {
      disposed = true
      for (const controller of active.values()) controller.abort()
      for (const bitmap of decoded.values()) close(bitmap)
      decoded.clear()
      priority = []
    },
  }
}
