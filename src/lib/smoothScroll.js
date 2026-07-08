/**
 * Eased, cancellable "snap to top" scroll used when a nav tab is clicked while
 * the page is scrolled into the second screen. We scroll the hero back into view
 * first, then the caller switches tabs to play the morph.
 *
 * Design rules (from ui-ux-pro-max + frontend-patterns):
 *  - Smooth, never a hard jump; non-linear easing (easeInOutCubic).
 *  - Snappy, distance-aware duration capped well under ~500ms (Shopify-editions
 *    feel) so the morph isn't kept waiting.
 *  - Respect prefers-reduced-motion (jump instantly, no animation).
 *  - Cancellable: returns a cancel() fn, and bails out if the user grabs scroll.
 */

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SNAP_MIN_MS = 300
const SNAP_MAX_MS = 520
const SNAP_PX_PER_MS = 3.2 // higher = faster

/**
 * Animate window scroll to the very top.
 *
 * @param {{ onDone?: () => void }} [options]
 *   onDone fires once when the top is reached, when the user interrupts the
 *   animation by scrolling, or immediately when no animation is needed — so the
 *   caller's follow-up action (the tab switch) is never lost.
 * @returns {() => void} cancel — stops the animation without firing onDone.
 */
export function smoothScrollToTop({ onDone } = {}) {
  const startY = window.scrollY || window.pageYOffset || 0

  if (startY <= 1 || prefersReducedMotion()) {
    window.scrollTo(0, 0)
    onDone?.()
    return () => {}
  }

  const duration = Math.min(
    SNAP_MAX_MS,
    Math.max(SNAP_MIN_MS, startY / SNAP_PX_PER_MS),
  )

  let rafId = 0
  let startTime = 0
  let settled = false
  let safetyId = 0

  const cleanup = () => {
    cancelAnimationFrame(rafId)
    clearTimeout(safetyId)
    // Programmatic scrollTo fires 'scroll', not 'wheel'/'touchmove', so these
    // only catch genuine user input — no self-cancellation.
    window.removeEventListener('wheel', onUserScroll)
    window.removeEventListener('touchmove', onUserScroll)
  }

  const cancel = () => {
    if (settled) return
    settled = true
    cleanup()
  }

  const finish = () => {
    if (settled) return
    settled = true
    cleanup()
    onDone?.()
  }

  function onUserScroll() {
    // User took over — stop fighting them but keep their tab choice.
    finish()
  }

  const step = (now) => {
    if (settled) return
    if (!startTime) startTime = now
    const t = Math.min(1, (now - startTime) / duration)
    window.scrollTo(0, Math.round(startY * (1 - easeInOutCubic(t))))
    if (t < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      finish()
    }
  }

  window.addEventListener('wheel', onUserScroll, { passive: true })
  window.addEventListener('touchmove', onUserScroll, { passive: true })
  rafId = requestAnimationFrame(step)

  // rAF stalls in hidden/backgrounded tabs; without this the animation never
  // finishes, onDone never fires, and the caller's pending state (App's
  // scrollCancelRef) wedges the nav permanently. Timers still run when
  // hidden, so force-finish at the top a beat after the animation deadline.
  safetyId = setTimeout(() => {
    window.scrollTo(0, 0)
    finish()
  }, duration + 250)

  return cancel
}
