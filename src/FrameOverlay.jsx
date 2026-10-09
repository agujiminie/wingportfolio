/* eslint-disable react/prop-types */
import { Linkedin, Mail } from 'lucide-react'
import HeroHeadline from './HeroHeadline'
import {
  BRAND,
  CTAS,
  NAV_ITEMS,
} from './frameContent'
import { STATE_BY_ID } from './content'

const CTA_ICONS = { linkedin: Linkedin, mail: Mail }

/**
 * Viewport-framing overlay: modular panels pinned to the corners and edges so the
 * morph canvas reads as the central focal element. The left-edge nav drives the
 * active morph state, themed by the active section's accent color.
 */
export default function FrameOverlay({ activeId, onSelect, onGoHome, scrolled = false, heroStyle, onChangeStyle }) {
  const activeState = STATE_BY_ID[activeId]

  const handleSelect = (id) => {
    if (id === activeId) return
    // App decides whether to snap-to-top first, then drives the morph.
    onSelect(id)
  }

  return (
    <div className="frame">
      {/* Top bar — translucent background that fades in only once the page has
          scrolled, keeping the nav legible over content (transparent at the top).
          Sits behind the brand / nav / CTA panels. */}
      <div
        className={`frame__topbar${scrolled ? ' is-scrolled' : ''}`}
        aria-hidden="true"
      />

      {/* Brand and contact stay together in both visual styles. */}
      <div className="frame__panel frame__identity">
        <button
          type="button"
          className="frame__brand"
          onClick={onGoHome}
          aria-label="Go to homepage"
        >
          <span className="frame__brand-name">{BRAND.name}</span>
        </button>
        {CTAS.map((cta) => {
          const Icon = CTA_ICONS[cta.icon]
          return (
            <a
              key={cta.id}
              href={cta.href}
              className="frame__cta-btn"
              aria-label={cta.label}
              target={cta.external ? '_blank' : undefined}
              rel={cta.external ? 'noopener noreferrer' : undefined}
            >
              <Icon size={cta.id === 'linkedin' ? 17.6 : 22} strokeWidth={1.6} aria-hidden="true" />
            </a>
          )
        })}
      </div>

      {/* Bottom-left — hero headline (per-tab; re-mounts on switch to replay the fade) */}
      <HeroHeadline activeId={activeId} />

      {/* Global style switch: independent of the selected content tab. */}
      <div className="frame__panel frame__cta">
        <button
          type="button"
          className="frame__style-btn"
          onClick={onChangeStyle}
          aria-pressed={heroStyle === 'cat'}
          title={heroStyle === 'cat' ? 'Cat Style → Retro' : 'Retro → Cat Style'}
        >
          Change Theme
        </button>
      </div>

      {/* Left edge — section nav */}
      <div className="frame__panel frame__nav-panel">
        <nav className="frame__nav" aria-label="Section switcher">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                className={`frame__nav-item${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                style={
                  isActive
                    ? {
                        background: activeState.activeFill,
                        border: activeState.activeBorder,
                        color: activeState.activeText,
                      }
                    : undefined
                }
                onClick={() => handleSelect(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
