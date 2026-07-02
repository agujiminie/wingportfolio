import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import LandingBackground from './LandingBackground'
import MorphStage from './MorphStage'
import FrameOverlay from './FrameOverlay'
import SecondScreen from './SecondScreen'
import { STATE_BY_ID, TRANSITION_IMAGES } from './content'
import { smoothScrollToTop } from './lib/smoothScroll'

function getInitialStateId() {
  if (typeof window === 'undefined') {
    return 'work'
  }

  const candidate = new URLSearchParams(window.location.search).get('state')

  if (candidate && STATE_BY_ID[candidate]) {
    return candidate
  }

  return 'work'
}

// The hero (morph canvas + headline) fades to 0 by the time the second screen's
// top edge has risen to this fraction of the viewport height — i.e. once the
// panel covers the bottom (1 - VANISH_AT) of the screen. Tune this single number.
const VANISH_AT = 0.4

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// The hero headline dismisses as soon as scrolling starts: past this tiny
// offset (px) it fades out (the CSS opacity transition makes the snap a fade).
const TITLE_FADE_AT = 8

// Below this scroll offset (px) the hero is effectively in view, so a tab click
// can morph immediately instead of first snapping to the top.
const TOP_EPSILON = 2

export default function App() {
  const [activeId, setActiveId] = useState(() => getInitialStateId())
  const [scrolled, setScrolled] = useState(false)
  const panelRef = useRef(null)
  // In-flight "snap to top" cancel fn + the tab to switch to once it lands.
  const scrollCancelRef = useRef(null)
  const pendingTargetRef = useRef(null)

  // Scroll-driven hero fade (Method B). Writes a single --fade custom property
  // on :root; CSS maps it onto the morph stage opacity and the headline opacity.
  useEffect(() => {
    const root = document.documentElement
    // Stable for the app's lifetime; its height is re-read each frame to stay
    // correct across viewport resizes.
    const bar = document.querySelector('.frame__topbar')
    let ticking = false

    const update = () => {
      ticking = false
      const panel = panelRef.current
      if (!panel) return
      const vh = window.innerHeight
      const top = panel.getBoundingClientRect().top
      // 1 when the panel enters at the bottom (top = vh); 0 at top = VANISH_AT*vh.
      const fade = clamp((top - VANISH_AT * vh) / (vh - VANISH_AT * vh), 0, 1)
      root.style.setProperty('--fade', fade.toFixed(3))
      // Headline dismisses immediately on scroll (independent of the morph fade).
      root.style.setProperty('--title-fade', window.scrollY > TITLE_FADE_AT ? '0' : '1')
      // Nav background activates only once the solid second-screen panel has
      // risen up to meet the bar (its top edge reaches the bar's bottom) — so the
      // bar stays transparent over the hero and only tints over the solid panel.
      // setState bails out when unchanged, so this re-renders only on crossing.
      const barBottom = bar ? bar.getBoundingClientRect().bottom : 0
      setScrolled(top <= barBottom)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      root.style.removeProperty('--fade')
      root.style.removeProperty('--title-fade')
    }
  }, [])

  // Cancel any in-flight snap-to-top if the component unmounts mid-animation.
  useEffect(() => () => scrollCancelRef.current?.(), [])

  // Tab click. If the hero is already in view, switch immediately (the morph
  // plays as usual). Otherwise snap the hero back to the top first, then switch
  // so the morph happens where it's actually visible. Re-clicking mid-snap just
  // retargets the pending tab without restarting the scroll.
  const handleSelect = useCallback(
    (id) => {
      if (id === activeId) return
      pendingTargetRef.current = id

      if (scrollCancelRef.current) return // snap already running → just retarget

      if (window.scrollY <= TOP_EPSILON) {
        startTransition(() => setActiveId(id))
        return
      }

      scrollCancelRef.current = smoothScrollToTop({
        onDone: () => {
          scrollCancelRef.current = null
          const target = pendingTargetRef.current
          if (target != null) startTransition(() => setActiveId(target))
        },
      })
    },
    [activeId],
  )

  return (
    <main className="landing">
      {/* Layer 0 — persistent background (image + Dither): revealed through the cutout */}
      <LandingBackground activeId={activeId} />

      {/* Layer 2 — morph canvas, centered via CSS; fades out on scroll (--fade) */}
      <div className="landing__stage">
        <MorphStage activeId={activeId} transitionImages={TRANSITION_IMAGES} />
      </div>

      {/* Layer 4 — viewport-framing overlay (nav/brand stay; headline fades with --fade) */}
      <FrameOverlay activeId={activeId} onSelect={handleSelect} scrolled={scrolled} />

      {/* In-flow scroll content: one hero viewport, then the solid second screen */}
      <div className="landing__spacer" aria-hidden="true" />
      <SecondScreen panelRef={panelRef} activeId={activeId} />
    </main>
  )
}
