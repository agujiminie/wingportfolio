/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Feather, Linkedin, Mail } from 'lucide-react'
import { BRAND, CTAS } from './frameContent'
import { getNextProject, projectHref } from './projects'
import './project-page.css'

const CTA_ICONS = { linkedin: Linkedin, mail: Mail }

/**
 * Project case-study page — extends the landing frame's design language
 * (same bar metrics, Kode Mono display type, Geist body, #edf0ee panel) so
 * "View project" reads as going deeper into the same site.
 *
 * Editorial layout: text holds a ~70ch reading measure while media breaks
 * out to a wider column; the hero demo sits in a macOS window frame that
 * echoes the landing's Curie demo. Data-driven: renders any project from
 * src/projects/ (sections → blocks, see oracle.js for the variant schema).
 */
export default function ProjectPage({ project }) {
  const activeSection = useScrollSpy(project.sections)
  const nextProject = getNextProject(project.slug)
  const backTo = project.backTo ?? { label: 'Work', href: '#/' }

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${project.name} · ${BRAND.name}`
    return () => {
      document.title = previousTitle
    }
  }, [project])

  useReveal()

  return (
    <main className="project-page">
      {/* Reading progress — CSS scroll-driven animation (no JS, no scroll listener) */}
      <div className="pp-progress" aria-hidden="true" />

      <header className="pp-bar">
        <a className="pp-bar__brand" href="#/" aria-label="Back to home">
          <span className="pp-bar__brand-mark" aria-hidden="true">
            <Feather size={22} strokeWidth={1.6} />
          </span>
          <span className="pp-bar__brand-name">{BRAND.name}</span>
        </a>

        <nav className="pp-bar__nav" aria-label="Case study sections">
          <a className="pp-bar__back" href={backTo.href}>
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span>{backTo.label}</span>
          </a>
          {project.sections.map((section) => (
            <a
              key={section.id}
              className={`pp-bar__nav-item${section.id === activeSection ? ' is-active' : ''}`}
              href={`#/project/${project.slug}`}
              aria-current={section.id === activeSection ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(section.id)?.scrollIntoView({ behavior: scrollBehavior() })
              }}
            >
              {section.nav ?? section.label}
            </a>
          ))}
        </nav>

        <div className="pp-bar__cta">
          {CTAS.map((cta) => {
            const Icon = CTA_ICONS[cta.icon]
            return (
              <a
                key={cta.id}
                href={cta.href}
                className="pp-bar__cta-btn"
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

      <section className="pp-hero">
        <p className="pp-hero__tag">
          {project.name} · {project.tag}
        </p>
        <h1 className="pp-hero__title">{project.title}</h1>
        {project.subtitle && <p className="pp-hero__subtitle">{project.subtitle}</p>}

        {project.meta && (
          <dl className="pp-meta">
            {project.meta.map((item) => (
              <div key={item.label} className="pp-meta__item">
                <dt className="pp-meta__label">{item.label}</dt>
                <dd className="pp-meta__value">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {project.hero && (
          <div className="pp-hero__media pp-reveal">
            {/* windowTitle opts into macOS chrome — skip it when the asset
                already carries its own window/browser chrome. */}
            {project.hero.windowTitle ? (
              <WindowFrame title={project.hero.windowTitle}>
                <img src={project.hero.src} alt={project.hero.alt} decoding="async" />
              </WindowFrame>
            ) : (
              <figure className="pp-figure pp-figure--hero">
                <img
                  src={project.hero.src}
                  alt={project.hero.alt}
                  decoding="async"
                  style={heroCropStyle(project.hero)}
                />
              </figure>
            )}
          </div>
        )}
      </section>

      {project.sections.map((section) => (
        <section key={section.id} id={section.id} className="pp-section" aria-label={section.label}>
          <h2 className="pp-section__title">{section.label}</h2>
          {section.blocks.map((block, index) => (
            <Block key={block.heading ?? index} block={block} />
          ))}
        </section>
      ))}

      {/* One hairline, one line: primary navigation left (arrow matches the
          direction of travel), quiet scroll-to-top right. */}
      <footer className="pp-footer">
        <div className="pp-footer__row">
          {nextProject ? (
            <a className="pp-footer__primary" href={projectHref(nextProject.slug)}>
              <span>Next: {nextProject.name}</span>
              <ArrowRight className="pp-footer__arrow" size={26} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <a className="pp-footer__primary" href="#/">
              <ArrowLeft className="pp-footer__arrow" size={26} strokeWidth={2} aria-hidden="true" />
              <span>Back to all work</span>
            </a>
          )}
          <button
            type="button"
            className="pp-footer__top"
            onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
          >
            <span>Top</span>
            <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </main>
  )
}

/* macOS window chrome — same idiom as the landing's Curie demo titlebar. */
function WindowFrame({ title, children }) {
  return (
    <figure className="pp-window">
      <div className="pp-window__bar">
        <span className="pp-window__lights" aria-hidden="true">
          <i className="pp-window__light pp-window__light--close" />
          <i className="pp-window__light pp-window__light--min" />
          <i className="pp-window__light pp-window__light--max" />
        </span>
        <figcaption className="pp-window__title">{title}</figcaption>
      </div>
      <div className="pp-window__body">{children}</div>
    </figure>
  )
}

/* One content block, dispatched on `variant` (see oracle.js schema). */
function Block({ block }) {
  if (block.variant === 'lead') {
    return (
      <div className="pp-block pp-block--lead pp-reveal">
        {block.heading && <h3 className="pp-block__lead-heading">{block.heading}</h3>}
        {block.paragraphs?.map((text) => (
          <p key={text.slice(0, 40)} className="pp-block__lead-text">
            {text}
          </p>
        ))}
        <BlockCta cta={block.cta} />
      </div>
    )
  }

  if (block.variant === 'quote') {
    return (
      <div className="pp-block pp-block--quote pp-reveal">
        <blockquote className="pp-quote">
          <p className="pp-quote__text">{block.quote}</p>
          {block.attribution && <cite className="pp-quote__cite">{block.attribution}</cite>}
        </blockquote>
        {block.paragraphs?.map((text) => (
          <p key={text.slice(0, 40)} className="pp-block__text">
            {text}
          </p>
        ))}
      </div>
    )
  }

  if (block.variant === 'video') {
    return (
      <div className="pp-block pp-reveal">
        {block.heading && <h3 className="pp-block__heading">{block.heading}</h3>}
        {/* Privacy-enhanced host; the iframe only loads as it nears the viewport. */}
        <div className="pp-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
            title={block.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {block.note && <p className="pp-block__note">{block.note}</p>}
      </div>
    )
  }

  if (block.variant === 'split' || block.variant === 'split-reverse') {
    return (
      <div
        className={`pp-block pp-block--split${
          block.variant === 'split-reverse' ? ' pp-block--split-reverse' : ''
        } pp-reveal`}
      >
        <h3 className="pp-block__statement">{block.heading}</h3>
        <Media media={block.media} />
      </div>
    )
  }

  if (block.variant === 'grid-2') {
    return (
      <div className="pp-block pp-reveal">
        {block.heading && <h3 className="pp-block__heading">{block.heading}</h3>}
        {block.paragraphs?.map((text) => (
          <p key={text.slice(0, 40)} className="pp-block__text">
            {text}
          </p>
        ))}
        {block.list && (
          <ul className="pp-block__list">
            {block.list.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ul>
        )}
        <div className="pp-block__grid">
          <Media media={block.media} />
        </div>
        {block.note && <p className="pp-block__note">{block.note}</p>}
      </div>
    )
  }

  if (block.variant === 'feature-grid') {
    return (
      <div className="pp-block">
        <div className="pp-block__features">
          {block.items.map((item) => (
            <article key={item.heading} className="pp-feature pp-reveal">
              <Media media={item.media} />
              <h3 className="pp-feature__heading">{item.heading}</h3>
              {item.paragraphs?.map((text) => (
                <p key={text.slice(0, 40)} className="pp-feature__text">
                  {text}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pp-block pp-reveal">
      {block.heading && <h3 className="pp-block__heading">{block.heading}</h3>}
      {block.paragraphs?.map((text) => (
        <p key={text.slice(0, 40)} className="pp-block__text">
          {text}
        </p>
      ))}
      {block.list && (
        <ul className="pp-block__list">
          {block.list.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ul>
      )}
      <Media media={block.media} />
      <BlockCta cta={block.cta} />
      {block.note && <p className="pp-block__note">{block.note}</p>}
    </div>
  )
}

/* Square cover art opts into a wide editorial band via hero.aspect
   (e.g. '2 / 1'); hero.position steers the crop. Product screenshots pass
   no aspect and keep their intrinsic ratio. */
function heroCropStyle(hero) {
  if (!hero.aspect) return undefined
  return { aspectRatio: hero.aspect, objectFit: 'cover', objectPosition: hero.position }
}

/* Optional block-level external link ({ label, href }) — external proof
   (press releases, live products) opens in a new tab. */
function BlockCta({ cta }) {
  if (!cta) return null
  return (
    <a className="pp-block__cta" href={cta.href} target="_blank" rel="noreferrer">
      <span>{cta.label}</span>
      <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
    </a>
  )
}

function Media({ media }) {
  if (!media?.length) return null
  // `flush` opts out of the hairline border for assets that already render
  // as a self-contained card (their own rounded corners and background) —
  // the border would otherwise double-frame them.
  return media.map((item) => (
    <figure key={item.src} className={`pp-figure${item.flush ? ' pp-figure--flush' : ''}`}>
      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
      {item.caption && <figcaption className="pp-figure__caption">{item.caption}</figcaption>}
    </figure>
  ))
}

/* Smooth scrolling unless the user prefers reduced motion. */
function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/* Tracks the section whose band currently crosses the upper third of the
   viewport. IntersectionObserver only — no scroll listeners. */
function useScrollSpy(sections) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null)

  useEffect(() => {
    // Recompute from all section rects whenever any section crosses the
    // active band; falls back to the first section above the fold.
    const compute = () => {
      const threshold = window.innerHeight / 3
      const current = sections.reduce((acc, section) => {
        const el = document.getElementById(section.id)
        if (!el) return acc
        return el.getBoundingClientRect().top <= threshold ? section.id : acc
      }, sections[0]?.id ?? null)
      setActiveId(current)
    }

    const observer = new IntersectionObserver(compute, {
      // Active band: a horizontal slice from 25% to 45% of the viewport.
      rootMargin: '-25% 0px -55% 0px',
    })
    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })
    compute()
    return () => observer.disconnect()
  }, [sections])

  return activeId
}

/* Scroll-reveal: .pp-reveal elements get .is-in as they enter the viewport.
   CSS gates the transition behind prefers-reduced-motion. */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.pp-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
