import { useEffect, useRef, useState } from 'react'
import { CENTER, GRID } from './catFrames'

const IDLE_DELAY_MS = 2500 // no input for this long → cat starts looking around
const LEAVE_DELAY_MS = 400 // pointer left the document → idle almost at once
const IDLE_STEP_MIN_MS = 1200
const IDLE_STEP_MAX_MS = 3000
const IDLE_RETURN_TO_CENTER = 0.35 // chance an idle step goes back to the lens
const HYSTERESIS = 0.08 // cells; dead zone around each boundary (no flicker)

const CENTER_CELL = { row: CENTER, col: CENTER }

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Where the drawn image actually sits inside a stage that uses
 * `object-fit: contain` — so the face anchor is measured against the photo,
 * not the letterboxed box around it.
 */
function containedRect(rect, aspect) {
  if (!aspect || !rect.width || !rect.height) return rect
  const stageAspect = rect.width / rect.height
  if (stageAspect > aspect) {
    const width = rect.height * aspect
    return { left: rect.left + (rect.width - width) / 2, top: rect.top, width, height: rect.height }
  }
  const height = rect.width / aspect
  return { left: rect.left, top: rect.top + (rect.height - height) / 2, width: rect.width, height }
}

/** Default reach: gaze saturates ~85% of the way to the farthest viewport edge. */
function defaultReach(anchorX, anchorY) {
  return {
    x: Math.max(anchorX, window.innerWidth - anchorX) * 0.85,
    y: Math.max(anchorY, window.innerHeight - anchorY) * 0.85,
  }
}

/**
 * Pointer → grid cell. Returns the cell the cat should show and the mode it is
 * in ('follow' | 'idle'). Fine pointers follow the cursor anywhere on the page;
 * touch follows a finger dragging on the stage. After a quiet spell (or when
 * the cursor leaves the document) the cat wanders on its own until the next
 * input. Reduced motion → no wandering, just a return to centre.
 *
 * @param {React.RefObject<HTMLElement>} stageRef  the element the frames fill
 * @param {object} options
 * @param {{x:number,y:number}} options.faceAnchor  face position as fractions of the image
 * @param {number|null} options.aspect  natural width / height of the frames
 * @param {{x:number,y:number}|((anchor:{x:number,y:number})=>{x:number,y:number})} [options.reach]
 * @param {boolean} options.idle  allow the idle wander
 * @param {boolean} options.enabled  false while frames are still loading
 */
export function useGazeCell(stageRef, { faceAnchor, aspect, reach, idle, enabled }) {
  const [cell, setCell] = useState(CENTER_CELL)
  const [mode, setMode] = useState('follow')
  const cellRef = useRef(CENTER_CELL)
  const pointerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const stage = stageRef.current
    if (!stage) return undefined

    const reduced = prefersReducedMotion()
    let frame = 0
    let idleTimer = 0
    let stepTimer = 0
    let idling = false
    let touchId = null // the finger currently steering the cat, if any

    const commit = (next) => {
      const current = cellRef.current
      if (next.row === current.row && next.col === current.col) return
      cellRef.current = next
      setCell(next)
    }

    // --- pointer → cell ---------------------------------------------------
    const resolve = () => {
      frame = 0
      const point = pointerRef.current
      if (!point) return

      const image = containedRect(stage.getBoundingClientRect(), aspect)
      const anchorX = image.left + image.width * faceAnchor.x
      const anchorY = image.top + image.height * faceAnchor.y
      const range =
        typeof reach === 'function'
          ? reach({ x: anchorX, y: anchorY })
          : (reach ?? defaultReach(anchorX, anchorY))

      const nx = clamp((point.x - anchorX) / range.x, -1, 1)
      const ny = clamp((point.y - anchorY) / range.y, -1, 1)
      // Continuous grid coordinates, 0 … GRID-1.
      const u = ((nx + 1) / 2) * (GRID - 1)
      const v = ((ny + 1) / 2) * (GRID - 1)

      const current = cellRef.current
      const pick = (value, held) =>
        Math.abs(value - held) > 0.5 + HYSTERESIS ? clamp(Math.round(value), 0, GRID - 1) : held
      commit({ row: pick(v, current.row), col: pick(u, current.col) })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(resolve)
    }

    // --- idle wander --------------------------------------------------------
    const clearIdle = () => {
      clearTimeout(idleTimer)
      clearTimeout(stepTimer)
      idleTimer = 0
      stepTimer = 0
      if (idling) {
        idling = false
        setMode('follow')
      }
    }

    const idleStep = () => {
      const current = cellRef.current
      const atCenter = current.row === CENTER && current.col === CENTER
      let next
      if (!atCenter && Math.random() < IDLE_RETURN_TO_CENTER) {
        next = CENTER_CELL
      } else {
        let dr = 0
        let dc = 0
        while (dr === 0 && dc === 0) {
          dr = Math.floor(Math.random() * 3) - 1
          dc = Math.floor(Math.random() * 3) - 1
        }
        next = {
          row: clamp(current.row + dr, 0, GRID - 1),
          col: clamp(current.col + dc, 0, GRID - 1),
        }
      }
      commit(next)
      stepTimer = setTimeout(
        idleStep,
        IDLE_STEP_MIN_MS + Math.random() * (IDLE_STEP_MAX_MS - IDLE_STEP_MIN_MS),
      )
    }

    const startIdle = () => {
      if (idling) return
      idling = true
      setMode('idle')
      if (!idle || reduced) {
        commit(CENTER_CELL)
        return
      }
      stepTimer = setTimeout(idleStep, IDLE_STEP_MIN_MS)
    }

    const armIdle = (delay) => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(startIdle, delay)
    }

    // --- events ---------------------------------------------------------------
    const onPointerMove = (event) => {
      // Touch only follows a finger that started on the stage (see onPointerDown);
      // anything else would fight page scrolling.
      if (event.pointerType !== 'mouse' && event.pointerId !== touchId) return
      pointerRef.current = { x: event.clientX, y: event.clientY }
      clearIdle()
      armIdle(IDLE_DELAY_MS)
      schedule()
    }

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse') return
      touchId = event.pointerId
      // Keep receiving moves once the finger slides off the stage.
      try {
        stage.setPointerCapture(event.pointerId)
      } catch {
        /* synthetic or already-released pointer — moves still arrive via window */
      }
      pointerRef.current = { x: event.clientX, y: event.clientY }
      clearIdle()
      armIdle(IDLE_DELAY_MS)
      schedule()
    }

    const onPointerUp = (event) => {
      if (event.pointerId !== touchId) return
      touchId = null
      try {
        stage.releasePointerCapture(event.pointerId)
      } catch {
        /* never captured */
      }
      clearIdle()
      armIdle(IDLE_DELAY_MS)
    }

    const onLeave = (event) => {
      // `relatedTarget` null = the cursor left the window, not just an element.
      if (event.relatedTarget) return
      pointerRef.current = null
      armIdle(LEAVE_DELAY_MS)
    }

    const onVisibility = () => {
      if (document.hidden) {
        clearIdle()
      } else {
        armIdle(IDLE_DELAY_MS)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)
    document.addEventListener('pointerout', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    // Nobody has moved yet: start looking around after the usual delay.
    armIdle(IDLE_DELAY_MS)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerUp)
      document.removeEventListener('pointerout', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(frame)
      clearTimeout(idleTimer)
      clearTimeout(stepTimer)
    }
  }, [stageRef, faceAnchor, aspect, reach, idle, enabled])

  return { cell, mode }
}
