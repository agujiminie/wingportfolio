import { useEffect, useState } from 'react'
import { advanceGaze, atlasIndex, interpolatedIndex } from './gazeMotion'

const CENTER = { row: 2, col: 2 }
const IDLE_DELAY = 2500
const DEAD_ZONE = 0.06
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function gazeIndex(normalized, previous, hysteresis = DEAD_ZONE) {
  const value = clamp(normalized, -1, 1)
  if (previous !== undefined) {
    const center = previous / 2 - 1
    if (value >= center - 0.25 - hysteresis && value <= center + 0.25 + hysteresis) {
      return previous
    }
  }
  return Math.round((value + 1) * 2)
}

export function neighboringCell(cell, random = Math.random) {
  const candidates = []
  const distance = Math.abs(cell.row - 2) + Math.abs(cell.col - 2)
  for (let row = Math.max(0, cell.row - 1); row <= Math.min(4, cell.row + 1); row++) {
    for (let col = Math.max(0, cell.col - 1); col <= Math.min(4, cell.col + 1); col++) {
      if (row === cell.row && col === cell.col) continue
      const weight = Math.abs(row - 2) + Math.abs(col - 2) < distance ? 3 : 1
      candidates.push({ row, col, weight })
    }
  }
  let pick = random() * candidates.reduce((sum, item) => sum + item.weight, 0)
  const selected = candidates.find((item) => (pick -= item.weight) < 0) || candidates.at(-1)
  return { row: selected.row, col: selected.col }
}

export default function useGazeCell(stageRef, {
  enabled = true, faceAnchor = { x: 0.5, y: 0.42 }, reach, idle = true,
  smooth = false, horizontalFrames = 0, gridSize = 0, onFrame, sensitivity = 1, responsive = true,
} = {}) {
  const centerIndex = gridSize ? atlasIndex({ x: 0, y: 0 }, gridSize) : Math.floor(horizontalFrames / 2)
  const [state, setState] = useState({ ...CENTER, frameIndex: centerIndex, mode: 'still' })
  const { x: anchorX, y: anchorY } = faceAnchor

  useEffect(() => {
    const stage = stageRef.current
    if (!enabled || !stage) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)')
    let current = { ...CENTER, frameIndex: centerIndex, mode: 'still' }
    let idleTimer = 0
    let frameRequest = 0
    let pendingPointer = null
    let lastPointer = null
    let activePointer = null
    let position = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }
    let intent = 'still'
    let lastTime = 0

    const commit = (cell, mode) => {
      if (cell.row === current.row && cell.col === current.col &&
          cell.frameIndex === current.frameIndex && mode === current.mode) return
      current = { ...cell, mode }
      onFrame?.(cell.frameIndex)
      setState(current)
    }

    const samplePosition = () => {
      const tracking = current.mode === 'tracking' && intent === 'tracking'
      commit({
        row: horizontalFrames ? 2 : gazeIndex(position.y, tracking ? current.row : undefined),
        col: gazeIndex(position.x, tracking && !horizontalFrames ? current.col : undefined),
        frameIndex: gridSize ? atlasIndex(position, gridSize) : horizontalFrames ? interpolatedIndex(position.x, horizontalFrames) : 0,
      }, intent)
    }
    const animate = (time) => {
      frameRequest = 0
      if (pendingPointer) {
        const rect = stage.getBoundingClientRect()
        const radius = Math.max(1, reach ?? Math.min(window.innerWidth, window.innerHeight) * 0.45 / Math.max(0.1, sensitivity))
        const limit = horizontalFrames ? 0.5 : 1
        target = {
          x: clamp((pendingPointer.x - rect.left - rect.width * anchorX) / radius, -limit, limit),
          y: horizontalFrames ? 0 : clamp((pendingPointer.y - rect.top - rect.height * anchorY) / radius, -1, 1),
        }
        pendingPointer = null
      }
      const dt = lastTime ? time - lastTime : 16
      lastTime = time
      const fastTracking = responsive && gridSize && intent === 'tracking'
      position = smooth && !reducedMotion.matches
        ? advanceGaze(position, target, dt, fastTracking ? 0.018 : gridSize ? 0.006 : 0.012, fastTracking ? 30 : 65)
        : { ...target }
      samplePosition()
      if (position.x !== target.x || position.y !== target.y) frameRequest = requestAnimationFrame(animate)
      else lastTime = 0
    }
    const startAnimation = () => {
      if (!frameRequest) frameRequest = requestAnimationFrame(animate)
    }
    const aimAt = (point, mode) => {
      target = point
      intent = mode
      if (!smooth || reducedMotion.matches) {
        position = { ...target }
        samplePosition()
      } else startAnimation()
    }

    const clearIdle = () => window.clearTimeout(idleTimer)
    const canIdle = () => idle && !reducedMotion.matches && !document.hidden && activePointer === null
    const wander = () => {
      clearIdle()
      if (!canIdle()) return
      const next = horizontalFrames
        ? { row: 2, col: current.col === 2 ? (Math.random() < 0.5 ? 1 : 3) : 2 }
        : neighboringCell(current)
      aimAt({ x: next.col / 2 - 1, y: next.row / 2 - 1 }, 'idle')
      idleTimer = window.setTimeout(wander, 1200 + Math.random() * 1800)
    }
    const scheduleIdle = () => {
      clearIdle()
      if (canIdle()) idleTimer = window.setTimeout(wander, IDLE_DELAY)
    }

    const queuePointer = (point) => {
      lastPointer = point
      pendingPointer = point
      intent = 'tracking'
      startAnimation()
    }
    const onMove = (event) => {
      if (event.isPrimary === false) return
      if (activePointer !== null ? event.pointerId !== activePointer :
        event.pointerType === 'touch' || !finePointer.matches) return
      scheduleIdle()
      queuePointer({ x: event.clientX, y: event.clientY })
    }
    const onDown = (event) => {
      if (event.isPrimary === false || activePointer !== null || event.button !== 0) return
      if (event.pointerType !== 'mouse') {
        activePointer = event.pointerId
        stage.setPointerCapture(event.pointerId)
      }
      scheduleIdle()
      queuePointer({ x: event.clientX, y: event.clientY })
    }
    const onUp = (event) => {
      if (event.pointerId !== activePointer) return
      activePointer = null
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
      scheduleIdle()
    }
    const stopPending = () => {
      cancelAnimationFrame(frameRequest)
      frameRequest = 0
      pendingPointer = null
      lastTime = 0
      target = { ...position }
    }
    const onLeave = () => {
      if (activePointer !== null) return
      stopPending()
      wander()
    }
    const onBlur = () => {
      if (activePointer !== null && stage.hasPointerCapture(activePointer)) {
        stage.releasePointerCapture(activePointer)
      }
      activePointer = null
      onLeave()
    }
    const onVisibility = () => {
      clearIdle()
      if (document.hidden) stopPending()
      else scheduleIdle()
    }
    const onMotionChange = () => {
      clearIdle()
      if (reducedMotion.matches) {
        stopPending()
        commit(current, 'still')
      }
      else scheduleIdle()
    }
    const onGeometryChange = () => {
      if (lastPointer && current.mode === 'tracking') queuePointer(lastPointer)
    }
    const onKeyDown = (event) => {
      const directions = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
      if (!directions[event.key] && event.key !== 'Home') return
      event.preventDefault()
      stopPending()
      lastPointer = null
      const delta = directions[event.key]
      const next = delta ? {
        row: horizontalFrames ? 2 : clamp(current.row + delta[0], 0, 4),
        col: clamp(current.col + delta[1], horizontalFrames ? 1 : 0, horizontalFrames ? 3 : 4),
      } : CENTER
      aimAt({ x: next.col / 2 - 1, y: next.row / 2 - 1 }, 'tracking')
      scheduleIdle()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    stage.addEventListener('lostpointercapture', onUp)
    stage.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onGeometryChange)
    window.addEventListener('scroll', onGeometryChange, { passive: true, capture: true })
    reducedMotion.addEventListener('change', onMotionChange)
    scheduleIdle()

    return () => {
      clearIdle()
      stopPending()
      window.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('lostpointercapture', onUp)
      stage.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onGeometryChange)
      window.removeEventListener('scroll', onGeometryChange, true)
      reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [stageRef, enabled, anchorX, anchorY, reach, idle, smooth, horizontalFrames, gridSize, centerIndex, onFrame, sensitivity, responsive])

  return enabled ? state : { ...CENTER, frameIndex: centerIndex, mode: 'loading' }
}
