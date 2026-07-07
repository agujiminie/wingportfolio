/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './playground-frames.css'

gsap.registerPlugin(ScrollTrigger)

// The record on the cover art, measured from ai-playlist.png (1024×1024):
// ellipse centre (474, 709), rx 338, ry 74 → a circle squashed to ry/rx.
const DISC = { cx: 46.3, cy: 69.2, width: 66, squash: 0.219 }

// Palette lifted from the artwork so the drawn vinyl sits in the same world.
const INK = '#02272b'
const GROOVES = ['#04434f', '#01333a', '#033b45', '#002c30']
const GLINT = '#0d5f6b'
const LABEL = '#f65764'
const LABEL_RING = '#d9404f'
const SPINDLE = '#f11b7f'
const TICK = '#ffd9a8'

/**
 * AI Playlist frame — the pixel-art turntable starts playing when scrolled
 * into view. A vector vinyl (same palette, drawn as a circle and squashed
 * into the artwork's perspective) spins over the painted one with a stepped
 * ease for a stop-motion, retro feel; faint glitch bands shimmer across the
 * cover. Everything pauses off-screen; reduced motion keeps the still.
 */
export default function VinylPlayer({ item }) {
  const rootRef = useRef(null)
  const discRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      // 2.2s per revolution in 48 chunky steps — 33⅓rpm by way of pixel art.
      const spin = gsap.to(discRef.current, {
        rotation: 360,
        duration: 2.2,
        ease: 'steps(48)',
        repeat: -1,
        paused: true,
      })
      spin.timeScale(0)

      const bands = gsap.utils.toArray('.vinyl__glitch')
      const shimmer = gsap.timeline({ repeat: -1, repeatRefresh: true, paused: true })
      shimmer.to(bands, {
        x: () => gsap.utils.random(-30, 30),
        opacity: () => gsap.utils.random(0.03, 0.14),
        duration: 0.22,
        ease: 'steps(2)',
        stagger: 0.07,
      })

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 82%',
        end: 'bottom 12%',
        onToggle: (self) => {
          if (self.isActive) {
            spin.play()
            // Needle drop: ramp up to speed instead of snapping.
            gsap.to(spin, { timeScale: 1, duration: 1.4, ease: 'power2.in', overwrite: true })
            shimmer.play()
          } else {
            gsap.to(spin, {
              timeScale: 0,
              duration: 0.6,
              ease: 'power2.out',
              overwrite: true,
              onComplete: () => spin.pause(),
            })
            shimmer.pause()
          }
        },
      })
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <div className="vinyl" ref={rootRef}>
      <img
        className="vinyl__still"
        src={item.cover}
        alt={`${item.name} — album artwork`}
        loading="lazy"
        decoding="async"
      />

      <div
        className="vinyl__disc-wrap"
        aria-hidden="true"
        style={{
          left: `${DISC.cx}%`,
          top: `${DISC.cy}%`,
          width: `${DISC.width}%`,
          transform: `translate(-50%, -50%) scaleY(${DISC.squash})`,
        }}
      >
        <svg className="vinyl__disc" ref={discRef} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="99" fill={INK} />
          {/* Grooves: concentric rings cycling through the artwork's teals. */}
          {Array.from({ length: 11 }, (_, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={92 - i * 5.5}
              fill="none"
              stroke={GROOVES[i % GROOVES.length]}
              strokeWidth="2.6"
            />
          ))}
          {/* Two glints riding the grooves — rotation makes them sweep. */}
          <path
            d="M 100 22 A 78 78 0 0 1 155 45"
            fill="none"
            stroke={GLINT}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 100 178 A 78 78 0 0 1 45 155"
            fill="none"
            stroke={GLINT}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* Label — coral like the art, with an off-centre tick so the spin reads. */}
          <circle cx="100" cy="100" r="28" fill={LABEL} />
          <circle cx="100" cy="100" r="23" fill="none" stroke={LABEL_RING} strokeWidth="2" />
          <rect x="114" y="97.5" width="9" height="5" rx="1" fill={TICK} />
          <rect x="88" y="82" width="5" height="5" rx="1" fill={LABEL_RING} />
          <circle cx="100" cy="100" r="4.5" fill={SPINDLE} />
        </svg>
      </div>

      {/* Drifting scanline glitches — heights/positions echo the artwork's bands. */}
      <div className="vinyl__glitch" style={{ top: '22%', height: '3px' }} aria-hidden="true" />
      <div className="vinyl__glitch vinyl__glitch--cyan" style={{ top: '49%', height: '2px' }} aria-hidden="true" />
      <div className="vinyl__glitch" style={{ top: '78%', height: '4px' }} aria-hidden="true" />
    </div>
  )
}
