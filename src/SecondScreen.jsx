/* eslint-disable react/prop-types */
import { ArrowUpRight } from 'lucide-react'
import { CURRENT_WORK, EXPERIENCE, COLLECTIONS } from './frameContent'
import CurieDemo from './components/curie/CurieDemo'
import GalleryContent from './GalleryContent'
import MusionTilt from './components/playground/MusionTilt'
import RobloxLive from './components/playground/RobloxLive'
import RetroPlayer from './components/playground/RetroPlayer'

// Items that carry a `media` key swap the plain cover <img> for a living
// component (scroll-triggered animation) — AI Playground frames.
const FEATURE_MEDIA = {
  musion: MusionTilt,
  roblox: RobloxLive,
  player: RetroPlayer,
}

/**
 * Second screen — a SOLID panel that scrolls up over the fixed hero layers.
 *
 * Content is per-tab (driven by `activeId`):
 *  • work        → Current Work (one big cutout) + Previous Work (feature rows)
 *  • playground  → three side-project feature rows
 *  • analogue    → three collection feature rows
 *
 * Method B cutout: a panel paints its solid colour with a giant box-shadow
 * around a transparent "window". Through that window you see straight down the
 * z-stack to the *persistent* layer (LandingBackground + Dither, z0), which is
 * continuous with the hero since both are fixed. Each feature row sets
 * `overflow:hidden` so its box-shadow is clipped to that row and can't paint
 * over a neighbouring row's hole.
 *
 * The forwarded ref is read by App's scroll handler to drive the hero fade.
 */
export default function SecondScreen({ panelRef, activeId }) {
  // Analog reveals the gallery itself — the same body as the #/gallery page,
  // so future analog content is added once in GalleryContent/gallery.js.
  if (activeId === 'analogue') {
    return (
      <section
        ref={panelRef}
        className="second-screen second-screen--gallery"
        aria-label="Analog · Gallery"
      >
        <GalleryContent embedded />
      </section>
    )
  }

  const collection = COLLECTIONS[activeId]

  return (
    <section
      ref={panelRef}
      className={`second-screen${collection ? ' second-screen--collection' : ''}`}
      aria-label={collection ? collection.label : 'Work'}
    >
      {collection ? <CollectionContent data={collection} /> : <WorkContent />}
    </section>
  )
}

/* Alternating "zigzag" feature rows — shared by the collection tabs and the
   Work tab's Previous Work. Each item is a 镂空 cutout (media) on one side and
   a caption (tag / name / blurb / link) on the other, flipping each row. */
function FeatureList({ items }) {
  return (
    <ul className="second-screen__features">
      {items.map((item) => (
        <li
          key={item.name}
          className={`second-screen__feature${item.imageOnly ? ' second-screen__feature--solo' : ''}${
            item.wide ? ' second-screen__feature--finale' : ''
          }`}
        >
          <div
            className={`second-screen__window second-screen__window--feature${
              (item.frames ?? 1) > 1 ? ' second-screen__window--split' : ''
            }${item.imageOnly ? ' second-screen__window--solo' : ''}${
              item.wide ? ' second-screen__window--wide' : ''
            }`}
            style={item.coverAspect ? { aspectRatio: item.coverAspect } : undefined}
          >
            {item.media && FEATURE_MEDIA[item.media] ? (
              (() => {
                const Media = FEATURE_MEDIA[item.media]
                return <Media item={item} />
              })()
            ) : item.cover ? (
              <img
                className="second-screen__media second-screen__media--feature"
                src={item.cover}
                alt={`${item.name} — project cover`}
                style={item.coverStyle}
                loading="lazy"
                decoding="async"
              />
            ) : (
              Array.from({ length: item.frames ?? 1 }).map((_, i) => (
                <div key={i} className="second-screen__placeholder">
                  <span>{item.name}</span>
                </div>
              ))
            )}
          </div>

          {!item.imageOnly && (
            <div className="second-screen__feature-caption">
              {item.tag && <p className="second-screen__feature-tag">{item.tag}</p>}
              <h3 className="second-screen__feature-name">{item.name}</h3>
              <p className="second-screen__feature-blurb">{item.blurb}</p>
              {/* Either one CTA (cta/href) or a vertical stack of named links
                  (links: [{label, href}]) when a banner holds several case
                  studies — e.g. NovoEd's Video Practice + Mobile App. */}
              {item.links ? (
                <div className="second-screen__feature-links">
                  {item.links.map((link) => (
                    <a key={link.href} className="second-screen__feature-link" href={link.href}>
                      <span>{link.label}</span>
                      <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                item.cta && (
                  <a
                    className="second-screen__feature-link"
                    href={item.href || '#'}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <span>{item.cta}</span>
                    <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                )
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ── Work tab ─────────────────────────────────────────────────────────── */
function WorkContent() {
  return (
    <>
      {/* Current work — unchanged bespoke layout (intro + big cutout) */}
      <div className="second-screen__current">
        <header className="second-screen__intro">
          <p className="second-screen__label">{CURRENT_WORK.label}</p>
          <div className="second-screen__intro-row">
            <h2 className="second-screen__title">{CURRENT_WORK.title}</h2>
            <p className="second-screen__desc">{CURRENT_WORK.description}</p>
          </div>
        </header>

        <div className="second-screen__window">
          <CurieDemo />
        </div>
      </div>

      {/* Previous work — same alternating feature rows as the collection tabs */}
      <div className="second-screen__previous-intro">
        <p className="second-screen__label">Previous Work</p>
      </div>
      <FeatureList items={EXPERIENCE} />
    </>
  )
}

/* ── Collection tabs (AI Playground / Analog) ─────────────────────────── */
function CollectionContent({ data }) {
  return (
    <>
      <header className="second-screen__collection-intro">
        <p className="second-screen__label">{data.label}</p>
        <div className="second-screen__intro-row">
          <h2 className="second-screen__title">{data.title}</h2>
          <p className="second-screen__desc">{data.description}</p>
        </div>
      </header>

      <FeatureList items={data.items} />
    </>
  )
}
