import { startTransition, useState } from 'react'
import MorphStage from './MorphStage'
import {
  METRICS,
  MORPH_FRAMES,
  NAV_LINKS,
  ORDER_BY_ACTIVE,
  PRINCIPLES,
  PROCESS_STEPS,
  STACK,
  STATE_BY_ID,
  STATES,
} from './content'

const SLOT_STYLES = [
  {
    left: '0',
    width: 'var(--side-pill-width)',
  },
  {
    left: 'calc(var(--side-pill-width) + var(--pill-gap))',
    width: 'var(--active-pill-width)',
  },
  {
    left: 'calc(var(--side-pill-width) + var(--pill-gap) + var(--active-pill-width) + var(--pill-gap))',
    width: 'var(--side-pill-width)',
  },
]

export default function App() {
  const [activeId, setActiveId] = useState(STATES[0].id)
  const [pillMotion, setPillMotion] = useState({
    direction: 'right',
    tick: 0,
    targetId: STATES[0].id,
  })

  const activeState = STATE_BY_ID[activeId]
  const orderedStates = ORDER_BY_ACTIVE[activeId].map((id) => STATE_BY_ID[id])

  const selectState = (nextId, slot) => {
    if (nextId === activeId) {
      return
    }

    if (typeof slot === 'number' && slot !== 1) {
      setPillMotion((current) => ({
        direction: slot === 0 ? 'right' : 'left',
        tick: current.tick + 1,
        targetId: nextId,
      }))
    }

    startTransition(() => {
      setActiveId(nextId)
    })
  }

  return (
    <main
      className="site-shell"
      style={{
        '--gradient-bottom': activeState.gradientBottom,
        '--active-fill': activeState.activeFill,
        '--active-text': activeState.activeText,
      }}
    >
      <div className="site-shell__grain" aria-hidden="true" />

      <header className="site-header">
        <a className="site-header__brand" href="#overview">
          Wing Zeng
        </a>

        <nav aria-label="Primary" className="site-header__nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero" id="overview">
        <div className="hero__copy">
          <p className="eyebrow">AI product design, interface systems, motion narratives</p>
          <h1>Designing AI experiences that feel authored, legible, and ready to ship.</h1>
          <p className="hero__lede">
            I turn product concepts into interface systems that can survive real engineering
            constraints without losing their point of view.
          </p>

          <div className="hero__actions">
            <a className="button button--primary" href="#tracks">
              Explore the work
            </a>
            <a className="button button--secondary" href="#workflow">
              See the workflow
            </a>
          </div>
        </div>

        <aside className="hero__aside" aria-label="Portfolio summary">
          <ul className="hero__metrics">
            {METRICS.map((metric) => (
              <li key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>

          <div className="hero__note">
            <p className="eyebrow">Current focus</p>
            <p>
              Building AI-native products, prototyping interaction behavior, and sharpening digital
              work with analog references so the end result feels less templated.
            </p>
          </div>
        </aside>
      </section>

      <section className="spotlight" aria-labelledby="spotlight-title">
        <div className="spotlight__panel">
          <p className="eyebrow">Selected lane</p>
          <h2 id="spotlight-title">{activeState.title}</h2>
          <p className="spotlight__description">{activeState.description}</p>

          <ul className="spotlight__deliverables" aria-label={`${activeState.label} deliverables`}>
            {activeState.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="spotlight__focus">{activeState.focus}</p>
        </div>

        <div className="spotlight__media">
          <section className="landing__switcher" aria-label="Category switcher">
            {orderedStates.map((state, slot) => {
              const isActive = state.id === activeId
              const showSlidingLabel =
                !isActive && pillMotion.tick > 0 && pillMotion.targetId === activeId

              return (
                <button
                  key={state.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`landing__pill${isActive ? ' is-active' : ''}`}
                  style={SLOT_STYLES[slot]}
                  onClick={() => selectState(state.id, slot)}
                >
                  <span className="landing__pillInner">
                    <span
                      key={
                        showSlidingLabel
                          ? `${state.id}-${pillMotion.tick}-${pillMotion.direction}`
                          : `${state.id}-static`
                      }
                      className={`landing__pillLabel${
                        showSlidingLabel
                          ? ` is-sliding is-sliding--${pillMotion.direction}`
                          : ''
                      }`}
                    >
                      {state.pillLabel}
                    </span>
                  </span>
                </button>
              )
            })}
          </section>

          <div
            className={`landing__scene landing__scene--${activeState.id}`}
            style={{
              '--blob-color': activeState.blobColor,
              '--blob-transform': activeState.blobTransform,
              '--blob-width': activeState.blobWidth,
              '--blob-height': activeState.blobHeight,
              '--shadow-color': activeState.shadowColor,
              '--shadow-transform': activeState.shadowTransform,
              '--shadow-width': activeState.shadowWidth,
              '--shadow-height': activeState.shadowHeight,
            }}
          >
            <div className="landing__shadow" aria-hidden="true" />
            <div className="landing__blob" aria-hidden="true" />
            <MorphStage activeId={activeId} states={STATES} morphFrames={MORPH_FRAMES} />
          </div>
        </div>
      </section>

      <section className="tracks" id="tracks" aria-labelledby="tracks-title">
        <div className="section-heading">
          <p className="eyebrow">Practice areas</p>
          <h2 id="tracks-title">Three lanes that keep the portfolio from feeling one-note.</h2>
        </div>

        <div className="tracks__grid">
          {STATES.map((state) => {
            const isActive = state.id === activeId

            return (
              <article
                key={state.id}
                className={`track-card${isActive ? ' is-active' : ''}`}
                style={{ '--card-texture': `url(${state.texture})` }}
              >
                <div className="track-card__content">
                  <p className="track-card__kicker">{state.kicker}</p>
                  <h3>{state.label}</h3>
                  <p>{state.description}</p>
                </div>

                <button
                  type="button"
                  className="track-card__action"
                  aria-pressed={isActive}
                  onClick={() => selectState(state.id)}
                >
                  {isActive ? 'Active lane' : 'Preview lane'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="workflow" id="workflow" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">Web workflow</p>
          <h2 id="workflow-title">A disciplined page-development process beats a pretty mockup every time.</h2>
        </div>

        <div className="workflow__grid">
          {PROCESS_STEPS.map((item) => (
            <article key={item.step} className="workflow-card">
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system" aria-labelledby="system-title">
        <div className="section-heading">
          <p className="eyebrow">Build principles</p>
          <h2 id="system-title">The portfolio is designed like a product surface, not a static gallery.</h2>
        </div>

        <div className="system__grid">
          <div className="system__column">
            {PRINCIPLES.map((principle) => (
              <article key={principle.title} className="principle-card">
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>

          <aside className="stack-card">
            <p className="eyebrow">Current build stack</p>
            <ul>
              {STACK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <footer className="footer" id="contact">
        <p className="eyebrow">Open for collaboration</p>
        <h2>Available for AI product design, prototyping, and interface direction.</h2>
        <p>
          If the work needs a stronger point of view and a cleaner path from concept to implementation,
          this portfolio is built to show exactly how I approach that.
        </p>

        <div className="footer__actions">
          <a className="button button--primary" href="#overview">
            Back to top
          </a>
          <a className="button button--secondary" href="#tracks">
            Revisit the work
          </a>
        </div>
      </footer>
    </main>
  )
}
