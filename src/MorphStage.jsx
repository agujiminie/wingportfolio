/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from 'react'

/** Same order as concatenated transition clips (1-2, 2-3, 3-1). */
const STATE_ORDER = ['work', 'playground', 'analogue']

const VIEW_SIZE = 720
const BLACK_FLOOR_KEY = 22
const ANIMATION_MS = 1000
const CANVAS_IMAGE_SCALE = 0.8

function normalize(value, min, max) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

function idToProgress(id) {
  const i = STATE_ORDER.indexOf(id)
  return i >= 0 ? i + 1 : 1
}

/** Shortest delta on a ring of 3 states (1, 2, 3) — matches morphing-2d-demo. */
function calculateShortestPath(start, end) {
  const n = 3
  const directDiff = end - start
  const throughTopDiff = end + n - start
  const throughBottomDiff = end - (start + n)
  const diffs = [directDiff, throughTopDiff, throughBottomDiff]
  const absDiffs = diffs.map(Math.abs)
  const minDiff = Math.min(...absDiffs)
  return diffs[absDiffs.indexOf(minDiff)]
}

function buildFlatFrameUrls(transitionImages) {
  const urls = []
  for (const t of transitionImages) {
    for (const src of t.frames) {
      urls.push(new URL(src, document.baseURI).href)
    }
  }
  return urls
}

function loadAllFrames(urls) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            img
              .decode()
              .then(() => resolve(img))
              .catch(() => resolve(img))
          }
          img.onerror = () => {
            console.error('Failed to load:', src)
            resolve(null)
          }
          img.src = src
        }),
    ),
  ).then((imgs) => imgs.filter((img) => img && img.naturalWidth > 0))
}

function drawFrame(ctx, composeCanvas, img) {
  const composeCtx = composeCanvas.getContext('2d', { alpha: true })
  if (!composeCtx) return

  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return

  composeCtx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE)

  const scale = Math.min(VIEW_SIZE / iw, VIEW_SIZE / ih) * CANVAS_IMAGE_SCALE
  const dw = iw * scale
  const dh = ih * scale
  const dx = (VIEW_SIZE - dw) / 2
  const dy = (VIEW_SIZE - dh) / 2
  composeCtx.drawImage(img, dx, dy, dw, dh)

  if (BLACK_FLOOR_KEY > 0) {
    const id = composeCtx.getImageData(0, 0, VIEW_SIZE, VIEW_SIZE)
    const d = id.data
    const T = BLACK_FLOOR_KEY
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] <= T && d[i + 1] <= T && d[i + 2] <= T) {
        d[i + 3] = 0
      }
    }
    composeCtx.putImageData(id, 0, 0)
  }

  ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE)
  ctx.drawImage(composeCanvas, 0, 0)
}

/**
 * Morph canvas under nav: scrub driven by top category pills, full frame strip, 1s ring animation.
 */
export default function MorphStage({ activeId, contentTopPx, transitionImages }) {
  const canvasRef = useRef(null)
  const composeRef = useRef(null)
  const imagesRef = useRef([])
  const progressRef = useRef(idToProgress(activeId))
  const lastDrawnIndexRef = useRef(-1)
  const animRef = useRef(null)
  const animStartRef = useRef(null)
  const animFromRef = useRef(1)
  const animToRef = useRef(1)

  const [imagesLoaded, setImagesLoaded] = useState(false)

  const startProgressAnimation = useCallback((targetValue) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    animStartRef.current = null
    animFromRef.current = progressRef.current
    animToRef.current = targetValue

    const step = (timestamp) => {
      if (animStartRef.current === null) {
        animStartRef.current = timestamp
      }
      const elapsed = timestamp - animStartRef.current
      const t = Math.min(elapsed / ANIMATION_MS, 1)
      const diff = calculateShortestPath(animFromRef.current, animToRef.current)
      let newValue = animFromRef.current + diff * t
      if (newValue > 3) newValue -= 3
      if (newValue < 1) newValue += 3
      progressRef.current = t < 1 ? newValue : animToRef.current

      if (t < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        progressRef.current = animToRef.current
        animRef.current = null
        animStartRef.current = null
      }
    }

    animRef.current = requestAnimationFrame(step)
  }, [])

  // Keep scrub target in sync when parent changes category (nav pills / URL).
  useEffect(() => {
    const target = idToProgress(activeId)
    const cur = progressRef.current
    if (Math.abs(cur - target) < 0.001) {
      return
    }
    startProgressAnimation(target)
  }, [activeId, startProgressAnimation])

  useEffect(() => {
    const urls = buildFlatFrameUrls(transitionImages)
    let cancelled = false

    loadAllFrames(urls).then((imgs) => {
      if (cancelled) return
      imagesRef.current = imgs
      setImagesLoaded(imgs.length > 0)
      if (imgs.length < urls.length) {
        console.warn(`Morph: loaded ${imgs.length}/${urls.length} frames`)
      }
    })

    return () => {
      cancelled = true
    }
  }, [transitionImages])

  // Init canvases + continuous render loop (same idea as demo requestAnimationFrame(render)).
  useEffect(() => {
    if (!imagesLoaded) return

    const canvas = canvasRef.current
    if (!canvas) return

    let compose = composeRef.current
    if (!compose) {
      compose = document.createElement('canvas')
      compose.width = VIEW_SIZE
      compose.height = VIEW_SIZE
      composeRef.current = compose
    }

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    canvas.width = VIEW_SIZE
    canvas.height = VIEW_SIZE
    ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE)

    let raf = 0
    const render = () => {
      const imgs = imagesRef.current
      if (imgs.length === 0) {
        raf = requestAnimationFrame(render)
        return
      }

      const max = imgs.length - 1
      let index = Math.round(normalize(progressRef.current, 1, 4) * max)
      index = Math.max(0, Math.min(max, index))

      if (index !== lastDrawnIndexRef.current) {
        lastDrawnIndexRef.current = index
        const frame = imgs[index]
        if (frame?.naturalWidth) {
          drawFrame(ctx, compose, frame)
        }
      }

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [imagesLoaded])

  return (
    <div
      className="morph-stage"
      style={{ '--morph-content-top': `${contentTopPx}px` }}
      role="presentation"
    >
      {!imagesLoaded ? (
        <div className="morph-demo__loading" aria-live="polite">
          Loading frames…
        </div>
      ) : null}

      <div className="morph-demo__column">
        <div className="morph-demo__canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={VIEW_SIZE}
            height={VIEW_SIZE}
            className="morph-demo__canvas"

            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
