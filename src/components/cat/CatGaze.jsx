/* eslint-disable react/prop-types */
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import useGazeCell from './useGazeCell'
import { CAT_FRAMES, PLACEHOLDER_FRAMES, fillMissingFrames } from './catFrames'
import './cat-gaze.css'

const DEFAULT_ANCHOR = { x: 0.5, y: 0.42 }

export default function CatGaze({
  frames = CAT_FRAMES,
  faceAnchor = DEFAULT_ANCHOR,
  reach,
  idle = true,
  className = '',
  aspectRatio = 1,
  smooth = false,
  sequence,
}) {
  const stageRef = useRef(null)
  const helpId = useId()
  const horizontalFrames = sequence?.length > 1 ? sequence.length : 0
  const sourceFrames = useMemo(() => horizontalFrames ? sequence : fillMissingFrames(frames).flat(), [frames, sequence, horizontalFrames])
  const [decoded, setDecoded] = useState(null)
  const ready = decoded?.source === sourceFrames
  const displayFrames = ready ? decoded.frames : sourceFrames
  const { row, col, frameIndex, mode } = useGazeCell(stageRef, {
    enabled: ready, faceAnchor, reach, idle, smooth, horizontalFrames,
  })
  const activeIndex = horizontalFrames ? frameIndex : row * 5 + col
  const centerIndex = horizontalFrames ? Math.floor(horizontalFrames / 2) : 12

  useEffect(() => {
    let cancelled = false
    // Decode the actual stacked image elements, including initially hidden ones.
    const images = [...stageRef.current.querySelectorAll('img')]
    Promise.all(images.map(async (img) => {
      try { await img.decode() } catch { /* Failed directions use a decoded neighbor. */ }
      return img.complete && img.naturalWidth > 0 ? img.getAttribute('src') : null
    })).then((sources) => {
      if (cancelled) return
      let loaded
      if (horizontalFrames) {
        const available = sources.map((src, index) => ({ src, index })).filter(frame => frame.src)
        loaded = sources.map((src, index) => src || (available.length
          ? available.reduce((a, b) => Math.abs(a.index - index) <= Math.abs(b.index - index) ? a : b).src
          : PLACEHOLDER_FRAMES[2][Math.round(index / (horizontalFrames - 1) * 4)]))
      } else {
        const grid = Array.from({ length: 5 }, (_, index) => sources.slice(index * 5, index * 5 + 5))
        loaded = fillMissingFrames(grid).flat()
      }
      setDecoded({ source: sourceFrames, frames: loaded })
    })
    return () => { cancelled = true }
  }, [sourceFrames, horizontalFrames])

  return (
    <div
      ref={stageRef}
      className={`cat-gaze ${className}`.trim()}
      style={{ aspectRatio }}
      role="img"
      aria-label="Margo, an orange and white cat, looking toward your pointer"
      aria-describedby={helpId}
      aria-busy={!ready}
      tabIndex={0}
      data-cell={`r${row}-c${col}`}
      data-mode={mode}
      data-ready={ready}
      data-frame={activeIndex}
      data-rendering={horizontalFrames ? 'interpolated' : smooth ? 'smooth' : 'original'}
    >
      {displayFrames.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          aria-hidden="true"
          draggable="false"
          decoding="async"
          loading="eager"
          fetchPriority={index === centerIndex ? 'high' : 'low'}
          className="cat-gaze__frame"
          style={{ visibility: activeIndex === index ? 'visible' : 'hidden' }}
        />
      ))}
      <span className="cat-gaze__help" id={helpId}>
        Move your pointer or drag across Margo to look around. You can also use the arrow keys. Home looks straight ahead.
      </span>
    </div>
  )
}
