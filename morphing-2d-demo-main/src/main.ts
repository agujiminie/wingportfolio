import "./style.css";
import { EventEmitter } from "events"

export const imagesSequenceEmitter = new EventEmitter()

let loadedImages: HTMLImageElement[] = []

/** Resolve `public/morphing/...` for Vite `base` + current page (file://, subpath, etc.). */
function morphSrc(pathUnderMorph: string): string {
  const base = import.meta.env.BASE_URL
  const relative = `${base}morphing/${pathUnderMorph}`
  return new URL(relative, document.baseURI).href
}

export const loadSequenceImages = () => {
  const tr1_2: string[] = []
  for (let i = 0; i <= 23; i++) {
    tr1_2.push(morphSrc(`1-2/1-2${i.toString().padStart(2, "0")}.png`))
  }
  const tr2_3: string[] = []
  for (let i = 0; i <= 23; i++) {
    tr2_3.push(morphSrc(`2-3/2-3${i.toString().padStart(2, "0")}.png`))
  }
  const tr3_1: string[] = []
  for (let i = 0; i <= 23; i++) {
    tr3_1.push(morphSrc(`3-1/3-1${i.toString().padStart(2, "0")}.png`))
  }

  const urls = [...tr1_2, ...tr2_3, ...tr3_1]

  const imagePromises = urls.map(
    (src) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image()
        img.onload = () => {
          img
            .decode()
            .then(() => resolve(img))
            .catch(() => {
              console.warn("Decode failed (still using):", src)
              resolve(img)
            })
        }
        img.onerror = () => {
          console.error("Failed to load:", src)
          resolve(null)
        }
        img.src = src
      })
  )

  Promise.all(imagePromises).then((imagesLoaded) => {
    loadedImages = imagesLoaded.filter(
      (img): img is HTMLImageElement =>
        img !== null && img.naturalWidth > 0
    )

    if (loadedImages.length === 0) {
      document.body.classList.remove("loading")
      const err = document.getElementById("load-error")
      if (err) err.hidden = false
      console.error("No frames loaded. Expected PNGs under public/morphing/{1-2,2-3,3-1}/.")
      return
    }

    if (loadedImages.length < urls.length) {
      console.warn(
        `Loaded ${loadedImages.length}/${urls.length} frames; scrub range is shortened.`
      )
    }

    imagesSequenceEmitter.emit("sequence-loaded")
  })
}

const removeLoadingClass = () => {
  document.body.classList.remove("loading");
};

let progress = 1

export const normalize = (value: number, min: number, max: number) => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

const canvas = document.querySelector("canvas") as HTMLCanvasElement

const VIEW_SIZE = 720
canvas.width = VIEW_SIZE
canvas.height = VIEW_SIZE
/**
 * Opaque bitmap (`alpha: false`) — transparent pixels on `alpha: true` canvases often composite
 * as black in the browser until something is drawn, which looks black while images are loading.
 */
const ctx = canvas.getContext("2d", { alpha: false })
if (ctx) {
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, VIEW_SIZE, VIEW_SIZE)
}

/** Offscreen buffer for letterboxing + optional black-backdrop removal. */
const compose = document.createElement("canvas")
compose.width = VIEW_SIZE
compose.height = VIEW_SIZE
const composeCtx = compose.getContext("2d", { alpha: false })
if (composeCtx) {
  composeCtx.fillStyle = "#ffffff"
  composeCtx.fillRect(0, 0, VIEW_SIZE, VIEW_SIZE)
}

/**
 * Pixels where R,G,B are all at or below this become white (removes flat black “stage” backdrops).
 * Set to `0` to disable. Raise if traces of black remain; lower if dark clothing/edges get eaten.
 */
const BLACK_FLOOR_KEY = 22

imagesSequenceEmitter.on("sequence-loaded", () => {
  removeLoadingClass();
  requestAnimationFrame(render)
})

loadSequenceImages()

let currentIndex = -1

function drawFrameWhiteBackdrop(img: HTMLImageElement) {
  if (!ctx || !composeCtx) return

  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return

  // White stage (no black letterboxing from the canvas itself)
  composeCtx.fillStyle = "#ffffff"
  composeCtx.fillRect(0, 0, VIEW_SIZE, VIEW_SIZE)

  const scale = Math.min(VIEW_SIZE / iw, VIEW_SIZE / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (VIEW_SIZE - dw) / 2
  const dy = (VIEW_SIZE - dh) / 2
  composeCtx.drawImage(img, dx, dy, dw, dh)

  if (BLACK_FLOOR_KEY > 0) {
    const id = composeCtx.getImageData(0, 0, VIEW_SIZE, VIEW_SIZE)
    const d = id.data
    const T = BLACK_FLOOR_KEY
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]!
      const g = d[i + 1]!
      const b = d[i + 2]!
      if (r <= T && g <= T && b <= T) {
        d[i] = 255
        d[i + 1] = 255
        d[i + 2] = 255
      }
    }
    composeCtx.putImageData(id, 0, 0)
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(compose, 0, 0)
}

function render() {
  if (loadedImages.length === 0) return

  // States 1–3 map across the full frame sequence; upper bound 4 matches the original “N+1” trick.
  const max = loadedImages.length - 1
  let index = Math.round(normalize(progress, 1, 4) * max)
  index = Math.max(0, Math.min(max, index))

  if (index !== currentIndex) {
    currentIndex = index
    if (!ctx || !canvas) return

    const frame = loadedImages[index]
    if (!frame?.naturalWidth) {
      requestAnimationFrame(render)
      return
    }

    drawFrameWhiteBackdrop(frame)
  }

  requestAnimationFrame(render)
}

