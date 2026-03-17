/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function lerp(from, to, progress) {
  return from + (to - from) * progress
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function buildOrganicPath(ctx, width, height, progress, time) {
  const centerX = width * 0.5 + Math.sin(time * 0.0013) * width * 0.018
  const centerY = height * 0.6 + Math.cos(time * 0.0011) * height * 0.02
  const baseRadius = Math.max(width, height) * (0.08 + progress * 0.84)
  const points = 84

  ctx.beginPath()

  for (let index = 0; index <= points; index += 1) {
    const angle = (Math.PI * 2 * index) / points
    const modulation =
      Math.sin(angle * 2.7 + time * 0.0014) * 0.14 +
      Math.cos(angle * 4.3 - time * 0.0011) * 0.06
    const radius = baseRadius * (1 + modulation * (1 - progress * 0.35))
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    if (index === 0) {
      ctx.moveTo(x, y)
      continue
    }

    ctx.lineTo(x, y)
  }

  ctx.closePath()
}

function drawSceneImage(ctx, image, size, scene, options = {}) {
  const {
    alpha = 1,
    blur = 0,
    rotation = scene.imageRotation ?? 0,
    scale = 1,
    widthRatio = scene.imageWidth,
    offsetX = scene.imageOffsetX,
    offsetY = scene.imageOffsetY,
  } = options

  const drawWidth = size.width * widthRatio * scale
  const drawHeight = image.height * (drawWidth / image.width)
  const x = size.width * 0.5 - drawWidth / 2 + size.width * offsetX
  const y = size.height - drawHeight + size.height * offsetY

  ctx.save()
  ctx.translate(x + drawWidth / 2, y + drawHeight / 2)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.filter = blur ? `blur(${blur}px)` : 'none'
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()
}

function drawSequenceFrame(ctx, image, size, fromScene, toScene, progress, alpha) {
  const widthRatio = lerp(fromScene.imageWidth, toScene.imageWidth, progress)
  const offsetX = lerp(fromScene.imageOffsetX, toScene.imageOffsetX, progress)
  const offsetY = lerp(fromScene.imageOffsetY, toScene.imageOffsetY, progress)
  const rotation = lerp(fromScene.imageRotation, toScene.imageRotation, progress)

  drawSceneImage(ctx, image, size, fromScene, {
    alpha,
    widthRatio,
    offsetX,
    offsetY,
    rotation,
  })
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setReducedMotion(query.matches)
    }

    handleChange()
    query.addEventListener('change', handleChange)

    return () => {
      query.removeEventListener('change', handleChange)
    }
  }, [])

  return reducedMotion
}

export default function MorphStage({ activeId, states, morphFrames }) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(0)
  const imagesRef = useRef(new Map())
  const currentIdRef = useRef(activeId)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [ready, setReady] = useState(false)
  const reducedMotion = useReducedMotion()

  const stateMap = useMemo(() => new Map(states.map((state) => [state.id, state])), [states])

  useEffect(() => {
    const uniqueSources = [...new Set([...states.map((state) => state.scene), ...morphFrames])]
    let mounted = true

    Promise.all(uniqueSources.map((src) => loadImage(src)))
      .then((images) => {
        if (!mounted) {
          return
        }

        const nextMap = new Map()

        images.forEach((image, index) => {
          nextMap.set(uniqueSources[index], image)
        })

        imagesRef.current = nextMap
        setReady(true)
      })
      .catch(() => {
        if (mounted) {
          setReady(false)
        }
      })

    return () => {
      mounted = false
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [morphFrames, states])

  useEffect(() => {
    if (!wrapperRef.current) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setSize({
        width: entry?.contentRect.width ?? 0,
        height: entry?.contentRect.height ?? 0,
      })
    })

    observer.observe(wrapperRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!ready || !canvasRef.current || !size.width || !size.height) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size.width * dpr)
    canvas.height = Math.round(size.height * dpr)
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.width, size.height)

    const renderStatic = (stateId) => {
      const scene = stateMap.get(stateId)
      const image = imagesRef.current.get(scene?.scene)

      if (!scene || !image) {
        return
      }

      ctx.clearRect(0, 0, size.width, size.height)
      drawSceneImage(ctx, image, size, scene)
    }

    if (reducedMotion) {
      currentIdRef.current = activeId
      renderStatic(activeId)
      return
    }

    const previousId = currentIdRef.current

    if (previousId === activeId) {
      renderStatic(activeId)
      return
    }

    cancelAnimationFrame(animationFrameRef.current)

    const fromScene = stateMap.get(previousId)
    const toScene = stateMap.get(activeId)
    const fromImage = imagesRef.current.get(fromScene?.scene)
    const toImage = imagesRef.current.get(toScene?.scene)

    if (!fromScene || !toScene || !fromImage || !toImage) {
      currentIdRef.current = activeId
      renderStatic(activeId)
      return
    }

    const isWorkPlaygroundSwap =
      (previousId === 'work' && activeId === 'playground') ||
      (previousId === 'playground' && activeId === 'work')

    const sequence = isWorkPlaygroundSwap
      ? previousId === 'work'
        ? [fromImage, ...morphFrames.map((frame) => imagesRef.current.get(frame)), toImage]
        : [fromImage, ...[...morphFrames].reverse().map((frame) => imagesRef.current.get(frame)), toImage]
      : []

    const start = performance.now()
    const duration = isWorkPlaygroundSwap ? 880 : 980

    const animate = (time) => {
      const progress = clamp((time - start) / duration, 0, 1)
      const eased = easeInOutCubic(progress)

      ctx.clearRect(0, 0, size.width, size.height)

      if (isWorkPlaygroundSwap && sequence.every(Boolean)) {
        const segments = sequence.length - 1
        const stepped = clamp(progress * segments, 0, segments)
        const index = Math.min(Math.floor(stepped), segments - 1)
        const localProgress = stepped - index
        const localEased = easeInOutCubic(localProgress)

        drawSequenceFrame(ctx, sequence[index], size, fromScene, toScene, progress, 1 - localEased)
        drawSequenceFrame(ctx, sequence[index + 1], size, fromScene, toScene, progress, localEased)
      } else {
        drawSceneImage(ctx, fromImage, size, fromScene, {
          alpha: 1 - eased * 0.24,
          blur: progress * 8,
          scale: 1 + eased * 0.03,
          rotation: lerp(fromScene.imageRotation, toScene.imageRotation, eased * 0.3),
        })

        ctx.save()
        buildOrganicPath(ctx, size.width, size.height, eased, time)
        ctx.clip()
        drawSceneImage(ctx, toImage, size, toScene, {
          alpha: 0.98,
          blur: (1 - progress) * 12,
          scale: 1.04 - eased * 0.04,
        })
        ctx.restore()

        if (progress > 0.42) {
          drawSceneImage(ctx, toImage, size, toScene, {
            alpha: clamp((progress - 0.42) / 0.58, 0, 1),
          })
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      currentIdRef.current = activeId
      renderStatic(activeId)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [activeId, morphFrames, ready, reducedMotion, size, stateMap])

  return (
    <div ref={wrapperRef} className="morph-stage">
      <canvas
        ref={canvasRef}
        className={`morph-stage__canvas${ready ? ' is-ready' : ''}`}
        role="img"
        aria-label={`${stateMap.get(activeId)?.label ?? 'Selected'} artwork`}
      />
    </div>
  )
}
