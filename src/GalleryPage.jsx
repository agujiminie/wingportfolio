import { useEffect } from 'react'
import { ArrowLeft, ArrowUp, Feather, Linkedin, Mail } from 'lucide-react'
import { BRAND, CTAS } from './frameContent'
import GalleryContent from './GalleryContent'
import './gallery-page.css'

const CTA_ICONS = { linkedin: Linkedin, mail: Mail }

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Standalone #/gallery page — wraps the shared GalleryContent body with the
 * project-page bar + footer chrome. The same body is embedded in the landing's
 * Analog tab (see SecondScreen), so content added there shows in both places.
 */
export default function GalleryPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `Gallery · ${BRAND.name}`
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <main className="gallery-page">
      <header className="gp-bar">
        <a className="gp-bar__brand" href="#/" aria-label="Back to home">
          <span className="gp-bar__brand-mark" aria-hidden="true">
            <Feather size={22} strokeWidth={1.6} />
          </span>
          <span className="gp-bar__brand-name">{BRAND.name}</span>
        </a>
        <nav className="gp-bar__nav" aria-label="Gallery">
          <a className="gp-bar__back" href="#/">
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span>Home</span>
          </a>
        </nav>
        <div className="gp-bar__cta">
          {CTAS.map((cta) => {
            const Icon = CTA_ICONS[cta.icon]
            return (
              <a
                key={cta.id}
                href={cta.href}
                className="gp-bar__cta-btn"
                aria-label={cta.label}
                target={cta.external ? '_blank' : undefined}
                rel={cta.external ? 'noopener noreferrer' : undefined}
              >
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
              </a>
            )
          })}
        </div>
      </header>

      <GalleryContent />

      <footer className="gp-footer">
        <div className="gp-footer__row">
          <a className="gp-footer__primary" href="#/">
            <ArrowLeft className="gp-footer__arrow" size={26} strokeWidth={2} aria-hidden="true" />
            <span>Back to home</span>
          </a>
          <button
            type="button"
            className="gp-footer__top"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
            }
          >
            <span>Top</span>
            <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </main>
  )
}
