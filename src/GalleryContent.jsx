/* eslint-disable react/prop-types */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import {
  GALLERY_CATEGORIES,
  GALLERY_CLOSING,
  galleryItemsFor,
  scatterCardsFor,
} from './projects/gallery'
import './gallery-page.css'

gsap.registerPlugin(ScrollTrigger)

const TABS = [{ id: 'all', label: 'All' }, ...GALLERY_CATEGORIES]

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Gallery body — scatter hero (Claude-startups idiom: artwork cards ring the
 * headline, bleed off the edges, drift at different parallax speeds), category
 * tabs in the hero center, a masonry grid that refilters with the active tab,
 * and a closing quote. Used two ways:
 *  • standalone #/gallery page (GalleryPage wraps it with bar + footer)
 *  • embedded in the landing's Analog tab (SecondScreen renders it as the
 *    scroll-revealed panel content — `embedded` drops the page-bar offset)
 * All entrance animations are ScrollTrigger-gated so they fire when the hero
 * is revealed, wherever it lives in the page.
 */
export default function GalleryContent({ embedded = false }) {
  const [category, setCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const heroRef = useRef(null)
  const gridRef = useRef(null)
  const dialogRef = useRef(null)
  // Distinguishes the mount animation from tab-switch animations.
  const mountedRef = useRef(false)

  const scatterCards = scatterCardsFor(category)
  const gridItems = galleryItemsFor(category)
  const activeCategory = GALLERY_CATEGORIES.find((cat) => cat.id === category)

  // Entrance + parallax. Scoped to the hero; rebuilt only on reduced-motion
  // change (never on tab switch — slots keep their triggers, images swap).
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.gp-card')

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 48, scale: 0.9, rotation: 0 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotation: (index) => cards[index].dataset.rotation,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: heroRef.current, start: 'top 75%', once: true },
        },
      )

      gsap.fromTo(
        '.gp-hero__center > *',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.2,
          scrollTrigger: { trigger: heroRef.current, start: 'top 75%', once: true },
        },
      )

      // Per-card parallax: slower cards (speed < 1) lag the scroll, faster
      // ones overshoot — same trick as the Claude startups hero.
      for (const card of cards) {
        gsap.to(card, {
          y: () => (1 - Number(card.dataset.speed)) * 220,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, heroRef)

    return () => context.revert()
  }, [])

  // Tab switch: swap scatter images + grid with a short out/in stagger.
  const switchCategory = useCallback((nextCategory) => {
    setCategory((current) => (current === nextCategory ? current : nextCategory))
  }, [])

  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (prefersReducedMotion()) return

    gsap.fromTo(
      '.gp-card__art',
      { autoAlpha: 0, scale: 0.92 },
      { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out', stagger: 0.045 },
    )
    gsap.fromTo(
      '.gp-grid__item',
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.025 },
    )
  }, [category])

  // Grid reveal on first scroll into view (batched, one-shot).
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      ScrollTrigger.batch('.gp-grid__item', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 },
          ),
      })
    }, gridRef)

    return () => context.revert()
    // Re-batch when the item set changes so new nodes get triggers.
  }, [category])

  // Closing frame: drift in once when scrolled into view.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined

    const context = gsap.context(() => {
      gsap.fromTo(
        '.gp-closing__figure',
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.gp-closing', start: 'top 80%', once: true },
        },
      )
    })

    return () => context.revert()
  }, [])

  // ── Lightbox ────────────────────────────────────────────────────────────
  const openLightbox = useCallback((index) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  const stepLightbox = useCallback(
    (delta) => {
      setLightboxIndex((current) => {
        if (current === null) return current
        return (current + delta + gridItems.length) % gridItems.length
      })
    },
    [gridItems.length],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (lightboxIndex !== null && !dialog.open) dialog.showModal()

    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') stepLightbox(1)
      if (event.key === 'ArrowLeft') stepLightbox(-1)
    }
    dialog.addEventListener('keydown', onKeyDown)
    return () => dialog.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, stepLightbox])

  const lightboxItem = lightboxIndex === null ? null : gridItems[lightboxIndex]

  return (
    <div className={`gallery-content${embedded ? ' gallery-content--embedded' : ''}`}>
      <section className="gp-hero" ref={heroRef} aria-label="Gallery highlights">
        <div className="gp-scatter" aria-hidden="true">
          {scatterCards.map(({ item, slot }, index) => (
            <button
              key={slot.x + '-' + slot.y}
              type="button"
              className={`gp-card${slot.mobile ? '' : ' gp-card--desktop'}`}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                '--card-w': slot.w,
                '--card-r': `${slot.r}deg`,
              }}
              data-rotation={slot.r}
              data-speed={slot.speed}
              tabIndex={-1}
              onClick={() => openLightbox(gridItems.findIndex((it) => it.id === item.id))}
            >
              <img
                className="gp-card__art"
                src={item.thumb}
                alt=""
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
                style={{ aspectRatio: item.ratio }}
              />
            </button>
          ))}
        </div>

        <div className="gp-hero__center">
          <p className="gp-hero__eyebrow">Analog · Gallery</p>
          <h1 className="gp-hero__title">
            Made by hand,
            <br />
            away from the screen
          </h1>
          <p className="gp-hero__desc">
            {activeCategory?.blurb ??
              'Drawings, icon systems, type experiments and illustrations — the analog side of my practice.'}
          </p>
          <div className="gp-tabs" role="tablist" aria-label="Artwork categories">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === category}
                className={`gp-tab${tab.id === category ? ' is-active' : ''}`}
                onClick={() => switchCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="gp-grid-wrap" ref={gridRef} aria-label="All artworks">
        <div className="gp-grid">
          {gridItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="gp-grid__item"
              onClick={() => openLightbox(index)}
            >
              <img
                src={item.thumb}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: item.ratio }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Closing frame — plain window, no caption (same photo as the old
          "In Real Life" collection card). */}
      <section className="gp-closing" aria-label="In real life">
        <figure className="gp-closing__figure">
          <img
            src={GALLERY_CLOSING.src}
            alt={GALLERY_CLOSING.alt}
            loading="lazy"
            decoding="async"
            style={{ aspectRatio: GALLERY_CLOSING.aspect }}
          />
        </figure>
      </section>

      {/* Native <dialog> gives focus trapping + Esc for free. */}
      <dialog
        className="gp-lightbox"
        ref={dialogRef}
        onClose={() => setLightboxIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeLightbox()
        }}
      >
        {lightboxItem && (
          <figure className="gp-lightbox__figure">
            <img
              src={lightboxItem.full}
              alt={lightboxItem.alt}
              decoding="async"
              style={{ aspectRatio: lightboxItem.ratio }}
            />
            <figcaption className="gp-lightbox__caption">{lightboxItem.alt}</figcaption>
          </figure>
        )}
        <button
          type="button"
          className="gp-lightbox__btn gp-lightbox__btn--prev"
          aria-label="Previous artwork"
          onClick={() => stepLightbox(-1)}
        >
          <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="gp-lightbox__btn gp-lightbox__btn--next"
          aria-label="Next artwork"
          onClick={() => stepLightbox(1)}
        >
          <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="gp-lightbox__btn gp-lightbox__btn--close"
          aria-label="Close"
          onClick={closeLightbox}
        >
          <X size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </dialog>
    </div>
  )
}
