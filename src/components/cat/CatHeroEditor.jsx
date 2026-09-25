import { memo, useEffect, useId, useRef, useState } from 'react'
import CatGazeAtlas from './CatGazeAtlas'

const STORAGE_KEY = 'cat-hero-placement-v1'
const DEFAULT = { scale: 85, x: 0, y: 0 }
const MIN_SCALE = 20
const MAX_SCALE = 200
const HeroCat = memo(CatGazeAtlas)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function readPlacement() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (saved && ['scale', 'x', 'y'].every(key => Number.isFinite(saved[key]))) {
      return { ...saved, scale: clamp(saved.scale, MIN_SCALE, MAX_SCALE) }
    }
  } catch { /* Storage can be disabled; editing still works for this mount. */ }
  return DEFAULT
}

export default function CatHeroEditor() {
  const [placement, setPlacement] = useState(readPlacement)
  const [scaleInput, setScaleInput] = useState(() => String(placement.scale))
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(null)
  const frameRef = useRef(0)
  const inputId = useId()

  useEffect(() => {
    if (dragging) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(placement)) } catch { /* Optional persistence. */ }
  }, [placement, dragging])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const startDrag = event => {
    if (!event.isPrimary || event.button !== 0) return
    // Capture before the gaze component so touch dragging moves the whole
    // canvas, without also capturing the pointer to turn the cat's head.
    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: placement.x, y: placement.y, nextX: placement.x, nextY: placement.y,
      rect: event.currentTarget.getBoundingClientRect(),
    }
    setDragging(true)
  }

  const moveDrag = event => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.id) return
    event.stopPropagation()
    // Leave a grab-able part on screen even when the user drags to an edge.
    drag.nextX = drag.x + clamp(event.clientX - drag.startX, 48 - drag.rect.right, innerWidth - 48 - drag.rect.left)
    drag.nextY = drag.y + clamp(event.clientY - drag.startY, 48 - drag.rect.bottom, innerHeight - 48 - drag.rect.top)
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      setPlacement(previous => ({ ...previous, x: drag.nextX, y: drag.nextY }))
    })
  }

  const finishDrag = event => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.id) return
    event.stopPropagation()
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    setPlacement(previous => ({ ...previous, x: drag.nextX, y: drag.nextY }))
    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const moveWithKeyboard = event => {
    if (event.target !== event.currentTarget) return
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    const step = event.shiftKey ? 10 : 1
    setPlacement(previous => ({ ...previous, x: previous.x + direction[0] * step, y: previous.y + direction[1] * step }))
  }

  const changeScale = event => {
    const value = event.target.value
    setScaleInput(value)
    const scale = Number(value)
    if (value.trim() && Number.isFinite(scale) && scale >= MIN_SCALE && scale <= MAX_SCALE) {
      setPlacement(previous => ({ ...previous, scale }))
    }
  }

  const commitScale = () => {
    const value = Number(scaleInput)
    const scale = scaleInput.trim() && Number.isFinite(value)
      ? clamp(value, MIN_SCALE, MAX_SCALE) : placement.scale
    setScaleInput(String(scale))
    setPlacement(previous => ({ ...previous, scale }))
  }

  const reset = () => {
    setPlacement(DEFAULT)
    setScaleInput(String(DEFAULT.scale))
  }

  return (
    <div className="landing__cat-stage" style={{
      '--cat-scale': placement.scale / 100,
      '--cat-offset-x': `${placement.x}px`,
      '--cat-offset-y': `${placement.y}px`,
    }}>
      <div
        className={`cat-hero-editor__canvas${dragging ? ' is-dragging' : ''}`}
        role="group" aria-label="Cat position. Drag or use arrow keys to move; Shift moves 10 pixels."
        tabIndex={0}
        onPointerDownCapture={startDrag}
        onPointerMoveCapture={moveDrag}
        onPointerUpCapture={finishDrag}
        onPointerCancelCapture={finishDrag}
        onLostPointerCapture={finishDrag}
        onKeyDown={moveWithKeyboard}
      >
        <HeroCat idle={false} />
      </div>
      <div className="cat-hero-editor__controls" role="group" aria-label="Cat placement controls">
        <div className="cat-hero-editor__row">
          <label htmlFor={inputId}>Scale</label>
          <div className="cat-hero-editor__percentage">
            <input
              id={inputId} aria-label="Cat scale" type="number" inputMode="decimal"
              min={MIN_SCALE} max={MAX_SCALE} step="any" value={scaleInput}
              onChange={changeScale} onBlur={commitScale}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
            />
            <span aria-hidden="true">%</span>
          </div>
          <button type="button" onClick={reset}>Reset</button>
        </div>
        <span className="cat-hero-editor__hint">Drag cat to move</span>
      </div>
    </div>
  )
}
