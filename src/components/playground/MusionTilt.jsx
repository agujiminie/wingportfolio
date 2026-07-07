/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import wordmark from '../../assets/projects/musion-layers/wordmark.webp'
import phone1 from '../../assets/projects/musion-layers/phone-1.webp'
import phone2 from '../../assets/projects/musion-layers/phone-2.webp'
import phone3 from '../../assets/projects/musion-layers/phone-3.webp'
import './playground-frames.css'

gsap.registerPlugin(ScrollTrigger)

// The original musion.png sliced into registration-safe layers: every slice
// keeps the full 1440×912 canvas, so identical <img> styling stacks them
// pixel-perfectly. z = translateZ depth under the tilt (bigger = closer).
const LAYERS = [
  { src: wordmark, z: 14, phone: false },
  { src: phone1, z: 34, phone: true },
  { src: phone2, z: 56, phone: true },
  { src: phone3, z: 78, phone: true },
]

const MAX_TILT_X = 7 // deg, mouse up/down
const MAX_TILT_Y = 10 // deg, mouse left/right

/**
 * Musion frame — the flat cover art, alive. Entrance: phones rise in a
 * stagger once the row scrolls into view. Then (fine pointers only) the whole
 * composition tilts toward the cursor in 3D; per-layer translateZ makes the
 * phones parallax against the wordmark. Reduced motion → static stack,
 * visually identical to the original single image.
 */
export default function MusionTilt({ item }) {
  const rootRef = useRef(null)
  const groupRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const root = rootRef.current
    const group = groupRef.current

    const context = gsap.context(() => {
      gsap.fromTo(
        '.musion-tilt__layer--phone',
        { autoAlpha: 0, y: 56 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root, start: 'top 78%', once: true },
        },
      )
      gsap.fromTo(
        '.musion-tilt__layer--wordmark',
        { autoAlpha: 0, x: -28 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: root, start: 'top 78%', once: true },
        },
      )
    }, root)

    // Mouse tilt — only where hover + a fine pointer exist (no touch screens).
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return () => context.revert()
    }

    const toRotX = gsap.quickTo(group, 'rotationX', { duration: 0.55, ease: 'power2.out' })
    const toRotY = gsap.quickTo(group, 'rotationY', { duration: 0.55, ease: 'power2.out' })

    const onMove = (event) => {
      const rect = root.getBoundingClientRect()
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
      toRotX(-ny * MAX_TILT_X)
      toRotY(nx * MAX_TILT_Y)
    }
    const onLeave = () => {
      // Settle back with a soft overshoot instead of the tracking ease.
      gsap.to(group, {
        rotationX: 0,
        rotationY: 0,
        duration: 1.1,
        ease: 'elastic.out(1, 0.65)',
        overwrite: 'auto',
      })
    }

    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
      context.revert()
    }
  }, [])

  return (
    <div className="musion-tilt" ref={rootRef}>
      <div className="musion-tilt__group" ref={groupRef}>
        {LAYERS.map((layer) => (
          <img
            key={layer.src}
            className={`musion-tilt__layer musion-tilt__layer--${layer.phone ? 'phone' : 'wordmark'}`}
            src={layer.src}
            alt=""
            style={{ transform: `translateZ(${layer.z}px)` }}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      {/* Layers are decorative slices; the composite is described once. */}
      <span className="sr-only">{item.name} — project cover</span>
    </div>
  )
}
