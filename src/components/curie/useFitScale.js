import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Size the demo like the frames on cursor.com/get-started, with the app
 * interface locked to a 16:9 ratio:
 *
 *  - The INTERFACE (the app region below the macOS title bar) is always the
 *    largest 16:9 box that fits inside the cutout frame minus a fixed 56px
 *    gap; the 32px title bar rides on top. The frame's flex centering keeps
 *    the leftover space equal on all sides.
 *  - Body text targets 13px on screen (stage scale 13/14); the STAGE reflows
 *    to fill the box, clamped to [1024, 1440]. At the clamps the scale
 *    drifts slightly instead, so the interface itself never leaves 16:9.
 *  - Below the 1024px stage floor the cutout frame carries a matching
 *    min-width (in CSS), so both stop responding and hold the minimum.
 *
 * @returns {{ ref: React.RefObject<HTMLElement>, scale: number,
 *   width: number, height: number, stageWidth: number, stageHeight: number }}
 */
const RATIO = 16 / 9 // the app region below the title bar stays 16:9
const TITLEBAR = 32 // macOS title bar height, in stage px
const FIXED_SCALE = 13 / 14 // 14px stage type → 13px on screen
const GAP = 56 // constant breathing room to the frame edge
const MIN_STAGE_WIDTH = 1024 // interface floor; frame min-width mirrors this
const MAX_STAGE_WIDTH = 1440 // Figma desktop width — don't reflow wider

export function useFitScale() {
  const ref = useRef(null)
  const [box, setBox] = useState({
    scale: FIXED_SCALE,
    width: 0,
    height: 0,
    stageWidth: MIN_STAGE_WIDTH,
    stageHeight: MIN_STAGE_WIDTH / RATIO + TITLEBAR,
  })

  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent || typeof ResizeObserver === 'undefined') return undefined

    const measure = () => {
      const availWidth = parent.clientWidth - GAP * 2
      const availHeight = parent.clientHeight - GAP * 2
      if (availWidth <= 0 || availHeight <= 0) return
      // Widest stage whose 16:9 app area + title bar fits at the locked
      // scale, clamped to [1024, 1440].
      let stageWidth = Math.min(
        availWidth / FIXED_SCALE,
        (availHeight / FIXED_SCALE - TITLEBAR) * RATIO,
      )
      if (stageWidth < MIN_STAGE_WIDTH) stageWidth = MIN_STAGE_WIDTH
      else if (stageWidth > MAX_STAGE_WIDTH) stageWidth = MAX_STAGE_WIDTH
      const stageHeight = stageWidth / RATIO + TITLEBAR
      // Equals FIXED_SCALE in the normal band; only the clamps make it
      // drift, so the window keeps fitting the frame and the ratio holds.
      const scale = Math.min(availWidth / stageWidth, availHeight / stageHeight)
      setBox({
        scale,
        width: stageWidth * scale,
        height: stageHeight * scale,
        stageWidth,
        stageHeight,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return { ref, ...box }
}
