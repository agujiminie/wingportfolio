function loadSequenceImage(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const finish = (error) => {
      image.onload = image.onerror = null
      signal.removeEventListener('abort', abort)
      if (error) reject(error)
      else resolve(image)
    }
    const abort = () => {
      image.removeAttribute('src')
      finish(new DOMException('Image load aborted', 'AbortError'))
    }
    if (signal.aborted) { abort(); return }
    signal.addEventListener('abort', abort, { once: true })
    image.decoding = 'async'
    image.fetchPriority = 'low'
    image.onload = () => image.decode().catch(() => {}).then(() => {
      if (!signal.aborted) finish()
    })
    image.onerror = () => finish(new Error(`Could not load ${url}`))
    image.src = url
  })
}

// Keep completed frames across theme switches, but stop competing with the
// visible cat for bandwidth and decoding when Retro is covered.
export function createImageSequenceLoader({ urls, concurrency = 4, load = loadSequenceImage, onComplete }) {
  const images = new Map()
  const failures = new Set()
  const active = new Map()
  let paused = true, disposed = false, completed = false

  const pump = () => {
    if (paused || disposed || completed) return
    if (images.size + failures.size === urls.length) {
      completed = true
      onComplete(urls.map((_, index) => images.get(index)).filter(Boolean))
      return
    }
    while (active.size < concurrency) {
      const index = urls.findIndex((_, i) => !images.has(i) && !failures.has(i) && !active.has(i))
      if (index < 0) break
      const controller = new AbortController()
      active.set(index, controller)
      Promise.resolve().then(() => load(urls[index], controller.signal)).then(image => {
        if (!disposed && !controller.signal.aborted) images.set(index, image)
      }).catch(() => {
        if (!disposed && !controller.signal.aborted) failures.add(index)
      }).finally(() => {
        active.delete(index)
        pump()
      })
    }
  }

  return {
    setPaused(value) {
      paused = value
      if (paused) for (const controller of active.values()) controller.abort()
      else pump()
    },
    get pending() { return active.size },
    dispose() {
      disposed = true
      for (const controller of active.values()) controller.abort()
      images.clear()
    },
  }
}
