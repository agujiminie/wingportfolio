import { startTransition, useEffect, useState } from 'react'
import LandingBackground from './LandingBackground'
import MorphStage from './MorphStage'
import { STATE_BY_ID, TRANSITION_IMAGES, getBreakpointId } from './content'

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

function getViewportState() {
  if (typeof window === 'undefined') {
    return {
      breakpointId: 'desktop',
      height: 1080,
      width: 1280,
    }
  }

  return {
    breakpointId: getBreakpointId(window.innerWidth),
    height: window.innerHeight,
    width: window.innerWidth,
  }
}

function getSurfaceMetrics(viewport, frame) {
  const scale = Math.max(
    (viewport.width + 4) / frame.width,
    (viewport.height + 4) / frame.height,
  )
  const width = frame.width * scale
  const height = frame.height * scale

  return {
    height,
    left: (viewport.width - width) / 2,
    scale,
    top: height > viewport.height ? 0 : (viewport.height - height) / 2,
    width,
  }
}

export default function App() {
  const [activeId, setActiveId] = useState(() => getInitialStateId())
  const [viewport, setViewport] = useState(() => getViewportState())

  const activeState = STATE_BY_ID[activeId]
  const activeLayout = activeState.layouts[viewport.breakpointId]
  const surface = getSurfaceMetrics(viewport, activeLayout.frame)
  const morphContentTopPx = activeLayout.nav.top + 79 + 24

  useEffect(() => {
    const handleResize = () => setViewport(getViewportState())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const shellStyle = {
    height: `${surface.height}px`,
    left: `${surface.left}px`,
    top: `${surface.top}px`,
    width: `${surface.width}px`,
  }

  const surfaceStyle = {
    height: `${activeLayout.frame.height}px`,
    transform: `scale(${surface.scale})`,
    width: `${activeLayout.frame.width}px`,
  }

  return (
    <main className="landing">
      <LandingBackground activeId={activeId} />

      {/* Layer 2 — morph canvas, static */}
      <div className="landing__surface-shell" style={shellStyle}>
        <div className="landing__surface" style={surfaceStyle}>
          <MorphStage
            activeId={activeId}
            contentTopPx={morphContentTopPx}
            transitionImages={TRANSITION_IMAGES}
          />
        </div>
      </div>

      {/* Layer 3 — text + nav, completely static */}
      <div className="landing__surface-shell landing__ui-shell" style={shellStyle}>
        <div className="landing__surface" style={surfaceStyle}>
          <header
            className={`landing__header${activeLayout.header.variant === 'mobile' ? ' is-mobile' : ''}`}
            style={{
              top: `${activeLayout.header.top}px`,
              width: `${activeLayout.header.width}px`,
            }}
          >
            <h1>Wing Zeng</h1>
            <p>8+yoe AI Product Designer</p>
          </header>

          <nav
            className={`landing__switcher${activeLayout.header.variant === 'mobile' ? ' is-mobile' : ''}`}
            aria-label="Category switcher"
            style={{
              gap: `${activeLayout.nav.gap}px`,
              top: `${activeLayout.nav.top}px`,
            }}
          >
            {activeLayout.nav.buttons.map((buttonLayout) => {
              const state = STATE_BY_ID[buttonLayout.id]
              const isActive = buttonLayout.id === activeId

              return (
                <button
                  key={buttonLayout.id}
                  type="button"
                  aria-label={state.navLabel}
                  aria-pressed={isActive}
                  className={`landing__pill${isActive ? ' is-active' : ''}${buttonLayout.showLabel ? '' : ' is-icon-only'}`}
                  style={{
                    background: isActive ? activeState.activeFill : undefined,
                    border: isActive ? activeState.activeBorder : undefined,
                    color: isActive ? activeState.activeText : undefined,
                    width: `${buttonLayout.width}px`,
                  }}
                  onClick={() => {
                    if (buttonLayout.id === activeId) return
                    startTransition(() => setActiveId(buttonLayout.id))
                  }}
                >
                  {buttonLayout.showLabel
                    ? <span className="landing__pill-label">{state.navLabel}</span>
                    : null}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </main>
  )
}
