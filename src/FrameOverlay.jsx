/* eslint-disable react/prop-types */
import { Feather, Linkedin, Mail } from 'lucide-react'
import {
  BRAND,
  CTAS,
  HEADLINES,
  NAV_ITEMS,
} from './frameContent'
import { STATE_BY_ID } from './content'

const CTA_ICONS = { linkedin: Linkedin, mail: Mail }

/**
 * Viewport-framing overlay: modular panels pinned to the corners and edges so the
 * morph canvas reads as the central focal element. The left-edge nav drives the
 * active morph state, themed by the active section's accent color.
 */
export default function FrameOverlay({ activeId, onSelect, scrolled = false }) {
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

      {/* Top-left — brand */}
      <div className="frame__panel frame__brand">
        <span className="frame__brand-mark" aria-hidden="true">
          <Feather size={22} strokeWidth={1.6} />
        </span>
        <span className="frame__brand-name">{BRAND.name}</span>
      </div>

      {/* Bottom-left — hero headline (per-tab; re-mounts on switch to replay the fade) */}
      <div className="frame__panel frame__headline-panel">
        <h1 className="frame__headline" key={activeId}>
          {(HEADLINES[activeId] ?? HEADLINES.work).map((line, i) => (
            <span key={i} className="frame__headline-line">
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* Top-right — icon buttons */}
      <div className="frame__panel frame__cta">
        {CTAS.map((cta) => {
          const Icon = CTA_ICONS[cta.icon]
          return (
            <a key={cta.id} href={cta.href} className="frame__cta-btn" aria-label={cta.label}>
              <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
            </a>
          )
        })}
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
