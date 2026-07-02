import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Fit a fixed-size design canvas into a fluid container.
 *
 * The Curie demo is authored at a fixed 1120×640 "stage" (1:1 with the Figma
 * frame) so every pixel value matches the design. This hook watches the outer
 * wrapper's width and returns the scale factor needed to shrink that stage to
 * fit — applied via `transform: scale()` on the stage. Text stays real DOM text
 * (accessible, zoomable); only the visual size is transformed.
 *
 * @param {number} baseWidth - The stage's authored width in px (default 1120).
 * @returns {{ ref: React.RefObject<HTMLElement>, scale: number }}
 */
export function useFitScale(baseWidth = 1120) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined

    const measure = () => {
      const width = el.clientWidth
      if (width > 0) setScale(width / baseWidth)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [baseWidth])

  return { ref, scale }
}
