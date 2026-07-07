/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import previewVideo from '../../assets/projects/roblox-preview.mp4'
import './playground-frames.css'

gsap.registerPlugin(ScrollTrigger)

// Where the video player sits inside the ai-game.png screenshot (1440×1038),
// measured from the pixels — the live <video> is laid exactly over it.
const VIDEO_RECT = { left: 2.29, top: 2.79, width: 63.47, height: 49.42 }

/**
 * Roblox frame — the game-page screenshot with its video region brought to
 * life. Scrolling the row into view fades the muted preview video in over the
 * baked-in still and plays it; scrolling away pauses it. Reduced motion keeps
 * the plain screenshot.
 */
export default function RobloxLive({ item }) {
  const rootRef = useRef(null)
  const videoRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const video = videoRef.current
    let revealed = false

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top 82%',
      end: 'bottom 12%',
      onToggle: (self) => {
        if (self.isActive) {
          // Muted + playsInline satisfies every autoplay policy; a rejected
          // play() (e.g. data-saver) just leaves the still visible.
          video.play().then(() => {
            if (!revealed) {
              revealed = true
              gsap.to(video, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
            }
          }).catch(() => {})
        } else {
          video.pause()
        }
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <div className="roblox-live" ref={rootRef}>
      <img
        className="roblox-live__still"
        src={item.cover}
        alt={`${item.name} — Roblox game page`}
        loading="lazy"
        decoding="async"
      />
      <video
        className="roblox-live__video"
        ref={videoRef}
        src={previewVideo}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        style={{
          left: `${VIDEO_RECT.left}%`,
          top: `${VIDEO_RECT.top}%`,
          width: `${VIDEO_RECT.width}%`,
          height: `${VIDEO_RECT.height}%`,
        }}
      />
    </div>
  )
}
