/* eslint-disable react/prop-types */
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import playerVideo from '../../assets/projects/ai-player.mp4'
import playerPoster from '../../assets/projects/ai-player-poster.webp'
import playerTrack from '../../assets/projects/ai-playlist-track.mp3'
import './playground-frames.css'

gsap.registerPlugin(ScrollTrigger)

// Self-hosted Suno track (suno.com/s/Yi8279prGED0Q9Wz, 59s) — the artwork
// video loops beneath it and everything resets when the song ends.
const AUDIO_SRC = playerTrack
const TRACK_TITLE = 'Chrismas Love City pop ver. — by WING & SUNO'
const IDLE_TEXT = 'Click PLAY if you want some AI music...'

// Where the artwork's D-pad sits (the button our PLAY key replaces), as % of
// the 864×432 frame — the overlay covers it completely.
const BTN_RECT = { left: 5.2, top: 62.5, width: 10.4, height: 21 }
// The screen's baked-in glitch-text lines; our OSD bar covers that strip.
const OSD_RECT = { left: 40.5, top: 10, width: 52.5, height: 19 }

/**
 * AI Playlist frame — a pixel-art player that actually plays. Idle: the
 * video's first frame, a drawn pixel PLAY key over the artwork's D-pad
 * (wiggling for attention, the pixel-game "press me" idiom), and an OSD
 * prompt. Press PLAY: the artwork runs (plus the Suno track once wired),
 * the OSD marquees the track title like an old deck. One run, then back to
 * idle; press again to replay, press mid-run to stop.
 */
export default function RetroPlayer({ item }) {
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const btnRef = useRef(null)
  const wiggleRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      // Pixel-game attention wiggle: chunky stepped twists with a long idle
      // pause between bursts.
      const wiggle = gsap.timeline({ repeat: -1, repeatDelay: 2.2, paused: true })
      wiggle
        .to(btnRef.current, { rotation: -7, duration: 0.09, ease: 'steps(1)' })
        .to(btnRef.current, { rotation: 6, duration: 0.09, ease: 'steps(1)' })
        .to(btnRef.current, { rotation: -4, duration: 0.09, ease: 'steps(1)' })
        .to(btnRef.current, { rotation: 3, duration: 0.09, ease: 'steps(1)' })
        .to(btnRef.current, { rotation: 0, scale: 1.06, duration: 0.09, ease: 'steps(1)' })
        .to(btnRef.current, { scale: 1, duration: 0.12, ease: 'steps(1)' })
      wiggleRef.current = wiggle

      // The player is the page's last row — a generous start keeps the wiggle
      // reachable even when short viewports can't scroll it far up the screen.
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 90%',
        end: 'bottom 5%',
        onToggle: (self) => {
          if (self.isActive) {
            wiggle.play()
          } else {
            wiggle.pause(0)
          }
        },
      })
    }, rootRef)

    return () => {
      wiggleRef.current = null
      context.revert()
    }
  }, [])

  const stop = useCallback(() => {
    const video = videoRef.current
    const audio = audioRef.current
    video.pause()
    video.currentTime = 0
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    wiggleRef.current?.play(0)
  }, [])

  const start = useCallback(() => {
    const video = videoRef.current
    const audio = audioRef.current
    wiggleRef.current?.pause(0)
    setPlaying(true)
    video.currentTime = 0
    // With a track the artwork loops for the song's length; without, its
    // single run is the whole show.
    video.loop = Boolean(audio)
    video.play().catch(() => setPlaying(false))
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }, [])

  const toggle = useCallback(() => {
    if (playing) {
      stop()
    } else {
      start()
    }
  }, [playing, start, stop])

  return (
    // The whole artwork is the hit area (click anywhere = press PLAY); the
    // button element inside remains the keyboard/AT affordance.
    <div className="retro-player" ref={rootRef} onClick={toggle}>
      <img
        className="retro-player__still"
        src={playerPoster}
        alt={`${item.name} — pixel-art music player`}
        loading="lazy"
        decoding="async"
      />
      <video
        className="retro-player__video"
        ref={videoRef}
        src={playerVideo}
        muted={!AUDIO_SRC /* artwork video is silent either way */}
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        style={{ opacity: playing ? 1 : 0 }}
        onEnded={stop}
      />
      {AUDIO_SRC && (
        <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" onEnded={stop} />
      )}

      {/* OSD strip over the screen's baked glitch-text lines. */}
      <div
        className="retro-player__osd"
        style={{
          left: `${OSD_RECT.left}%`,
          top: `${OSD_RECT.top}%`,
          width: `${OSD_RECT.width}%`,
          height: `${OSD_RECT.height}%`,
        }}
        aria-live="polite"
      >
        {playing ? (
          <span className="retro-player__marquee">
            <span>{TRACK_TITLE}</span>
            <span aria-hidden="true">{TRACK_TITLE}</span>
          </span>
        ) : (
          <span className="retro-player__prompt">
            {IDLE_TEXT}
            <span className="retro-player__cursor" aria-hidden="true">
              ▮
            </span>
          </span>
        )}
      </div>

      {/* Pixel PLAY key drawn over the artwork's D-pad, same palette. */}
      <button
        type="button"
        className="retro-player__btn"
        ref={btnRef}
        style={{
          left: `${BTN_RECT.left}%`,
          top: `${BTN_RECT.top}%`,
          width: `${BTN_RECT.width}%`,
          height: `${BTN_RECT.height}%`,
        }}
        aria-label={playing ? 'Stop the music' : 'Play AI music'}
        aria-pressed={playing}
        onClick={(event) => {
          event.stopPropagation() // the root handles pointer clicks
          toggle()
        }}
      >
        <svg viewBox="0 0 36 36" shapeRendering="crispEdges" aria-hidden="true">
          {/* drop shadow */}
          <rect x="4" y="6" width="30" height="28" fill="#1c3460" />
          {/* key body + bevel */}
          <rect x="2" y="2" width="30" height="28" fill="#cc6a86" />
          <rect x="2" y="2" width="28" height="26" fill="#e68181" />
          <rect x="4" y="4" width="24" height="4" fill="#f2a29b" />
          <rect x="4" y="4" width="4" height="22" fill="#f2a29b" />
          {/* play triangle, staircase pixels */}
          <g fill={playing ? '#f24a7c' : '#1c3460'}>
            <rect x="12" y="8" width="4" height="16" />
            <rect x="16" y="10" width="4" height="12" />
            <rect x="20" y="13" width="4" height="6" />
          </g>
          {/* teal spark, like the artwork's accents */}
          <rect x="24" y="6" width="3" height="3" fill="#4caca9" />
        </svg>
      </button>
    </div>
  )
}
