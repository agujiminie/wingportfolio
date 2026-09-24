/* eslint-disable react/prop-types */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import useGazeCell from './useGazeCell'
import { CAT_FRAMES, PLACEHOLDER_FRAMES } from './catFrames'
import { createGazeFrameCache, loadGazeBitmap } from './gazeFrameCache'
import { STABLE_GAZE_ATLAS, STABLE_ATLAS_SIDE, STABLE_ATLAS_RESOLUTION, STABLE_TORSO } from './stableGazeAtlas'
import { createNeckLockLayer, drawNeckLockLayer } from './neckLock'
import './cat-gaze.css'

const DEFAULT_ANCHOR = { x: 0.5, y: 0.42 }

export default function CatGazeAtlas({
  frames = STABLE_GAZE_ATLAS, gridSize = STABLE_ATLAS_SIDE, resolution = STABLE_ATLAS_RESOLUTION,
  faceAnchor = DEFAULT_ANCHOR, reach, idle = true, className = '', sensitivity = 1.25, responsive = true,
  fixedTorso = frames === STABLE_GAZE_ATLAS ? STABLE_TORSO : null,
  fixedNeck = frames === STABLE_GAZE_ATLAS,
}) {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const cacheRef = useRef(null)
  const helpId = useId()
  const [loadedSource, setLoadedSource] = useState(null)
  const ready = loadedSource === frames
  // Paint within the pointer's rAF; a React commit is not a prerequisite to draw.
  const renderFrame = useCallback(index => cacheRef.current?.aim(index), [])
  const { row, col, frameIndex, mode } = useGazeCell(stageRef, {
    enabled: ready, faceAnchor, reach, idle, smooth: true, gridSize, onFrame: renderFrame, sensitivity, responsive,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return undefined
    const center = Math.floor(gridSize / 2) * gridSize + Math.floor(gridSize / 2)
    canvas.style.visibility = 'hidden'
    let torsoBitmap = null
    let neckLayer = null
    let disposed = false
    let compositorReady = !fixedNeck
    let pendingTarget = center
    const torsoController = new AbortController()
    const neckController = new AbortController()
    const drawTorso = () => {
      if (!torsoBitmap) return
      const top = fixedTorso.top * resolution
      context.drawImage(torsoBitmap, 0, top, resolution, resolution - top)
    }
    stage.dataset.fixedBody = 'false'
    stage.dataset.fixedNeck = 'false'
    if (fixedTorso) loadGazeBitmap(fixedTorso.url, torsoController.signal).then(bitmap => {
      if (disposed) { bitmap.close?.(); return }
      torsoBitmap = bitmap
      drawTorso()
      stage.dataset.fixedBody = 'true'
    }).catch(() => { /* Frames already contain the stabilized torso as fallback. */ })
    const cache = createGazeFrameCache({
      frames, side: gridSize,
      onFrame(index, bitmap) {
        context.drawImage(bitmap, 0, 0, resolution, resolution)
        if (neckLayer) drawNeckLockLayer(context, neckLayer)
        // A single shared patch also removes lossy-codec shimmer in static fur.
        drawTorso()
        canvas.style.visibility = 'visible'
        stage.dataset.displayedFrame = String(index)
        stage.dataset.cachedFrames = String(cache.size)
        setLoadedSource(frames)
      },
      onError(index) {
        // Keep the last complete image (or center poster) on a failed request.
        // Other directions remain usable, including if the first frame fails.
        if (index === center) setLoadedSource(frames)
      },
    })
    cacheRef.current = {
      aim(index) {
        pendingTarget = index
        if (compositorReady) cache.aim(index)
      },
    }
    const onVisibility = () => cache.setPaused(document.hidden)
    const start = () => {
      if (disposed) return
      compositorReady = true
      cache.aim(pendingTarget)
    }
    if (fixedNeck) {
      // Prepare the shared neck before enabling pointer input. A fast neighbor
      // decode must never show an uncorrected pose during the initial load.
      const prepareNeck = async () => {
        let reference
        try {
          reference = await loadGazeBitmap(frames[center], neckController.signal)
        } catch {
          if (disposed) return
          // The approved center photo is also the atlas's neck reference.
          reference = await loadGazeBitmap(CAT_FRAMES[2][2], neckController.signal)
        }
        if (disposed) { reference.close?.(); return }
        try { neckLayer = createNeckLockLayer(reference, resolution) }
        finally { reference.close?.() }
        if (!neckLayer) return
        stage.dataset.fixedNeck = 'true'
        start()
      }
      prepareNeck().catch(() => {
        // Keep the center poster if both references fail; never expose a
        // changing neck just because its shared layer has not loaded.
      })
    } else start()
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      disposed = true
      torsoController.abort()
      neckController.abort()
      torsoBitmap?.close?.()
      if (neckLayer) neckLayer.width = neckLayer.height = 0
      cache.dispose()
      cacheRef.current = null
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [frames, gridSize, resolution, fixedTorso, fixedNeck])

  return (
    <div
      ref={stageRef}
      className={`cat-gaze ${className}`.trim()}
      style={{ aspectRatio: 1 }}
      role="img"
      aria-label="Margo, an orange and white cat, looking toward your pointer"
      aria-describedby={helpId}
      aria-busy={!ready}
      tabIndex={0}
      data-cell={`r${row}-c${col}`}
      data-mode={mode}
      data-ready={ready}
      data-frame={frameIndex}
      data-grid-size={gridSize}
      data-sensitivity={sensitivity}
      data-rendering="interpolated"
    >
      <img
        src={CAT_FRAMES[2][2]} alt="" aria-hidden="true" draggable="false"
        className="cat-gaze__frame" fetchPriority="high"
        onError={event => { event.currentTarget.src = PLACEHOLDER_FRAMES[2][2] }}
      />
      <canvas ref={canvasRef} width={resolution} height={resolution} className="cat-gaze__frame" aria-hidden="true" />
      <span className="cat-gaze__help" id={helpId}>
        Move your pointer or drag across Margo to look around. You can also use the arrow keys. Home looks straight ahead.
      </span>
    </div>
  )
}
