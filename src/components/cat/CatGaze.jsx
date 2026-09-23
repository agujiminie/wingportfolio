/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { CENTER, GRID } from './catFrames'
import { useGazeCell } from './useGazeCell'
import './cat-gaze.css'

const DEFAULT_ANCHOR = { x: 0.5, y: 0.42 }

/** Preload + decode every frame so a cell switch is a pure hard cut. */
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
            console.error('CatGaze: failed to load', src)
            resolve(null)
          }
          img.src = src
        }),
    ),
  )
}

/**
 * A cat that looks at the cursor. `frames` is a GRID×GRID table of image URLs
 * ([row][col], see catFrames.js); the cell nearest the pointer's direction from
 * the cat's face is shown, swapped as a hard cut like the reference video.
 * Fills its container (object-fit: contain), so it works full-viewport on
 * #/cat and inside any landing-page section alike.
 *
 * Props:
 *  - frames      GRID×GRID array of URLs (required)
 *  - faceAnchor  {x, y} fractions of the image where the face sits
 *  - reach       {x, y} px (or fn) — how far the pointer must go for a full turn
 *  - idle        let the cat look around when nobody is moving (default true)
 *  - label       accessible description of the image
 */
export default function CatGaze({
  frames,
  faceAnchor = DEFAULT_ANCHOR,
  reach,
  idle = true,
  label = 'A cat that follows your cursor',
  className = '',
}) {
  const stageRef = useRef(null)
  // { urls, aspect } of the last fully decoded frame set; ready = it matches
  // the current `urls` (so a frames swap re-enters the loading state).
  const [loaded, setLoaded] = useState(null)

  const urls = useMemo(() => frames.flat(), [frames])
  const ready = loaded?.urls === urls
  const aspect = ready ? loaded.aspect : null

  useEffect(() => {
    let cancelled = false
    loadAllFrames(urls).then((imgs) => {
      if (cancelled) return
      const first = imgs.find((img) => img && img.naturalWidth > 0)
      const missing = imgs.filter((img) => !img).length
      if (missing) console.warn(`CatGaze: ${missing}/${urls.length} frames failed to load`)
      setLoaded({ urls, aspect: first ? first.naturalWidth / first.naturalHeight : null })
    })
    return () => {
      cancelled = true
    }
  }, [urls])

  const { cell, mode } = useGazeCell(stageRef, {
    faceAnchor,
    aspect,
    reach,
    idle,
    enabled: ready,
  })

  return (
    <div
      ref={stageRef}
      className={`cat-gaze ${className}`.trim()}
      role="img"
      aria-label={label}
      data-cell={`${cell.row},${cell.col}`}
      data-mode={ready ? mode : 'loading'}
    >
      {frames.map((rowFrames, row) =>
        rowFrames.map((src, col) => {
          // Before decode finishes, only the centre frame is shown.
          const active = ready ? row === cell.row && col === cell.col : row === CENTER && col === CENTER
          return (
            <img
              key={`${row}-${col}`}
              className="cat-gaze__frame"
              src={src}
              alt=""
              aria-hidden="true"
              draggable="false"
              data-active={active ? 'true' : 'false'}
              data-cell={`${row},${col}`}
            />
          )
        }),
      )}
      {frames.length !== GRID && (
        <span className="sr-only">CatGaze expects a {GRID}×{GRID} frame table</span>
      )}
    </div>
  )
}
