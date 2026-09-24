import manifest from '../../assets/cat/atlas-stable/manifest.json'
import torso from '../../assets/cat/atlas-stable/torso.webp'

const images = import.meta.glob('../../assets/cat/atlas-stable/r*-c*.webp', { eager: true, import: 'default' })
export const STABLE_ATLAS_SIDE = manifest.gridSize
export const STABLE_ATLAS_RESOLUTION = manifest.frameSize
export const STABLE_TORSO = { url: torso, top: 624 / 768 }
export const STABLE_GAZE_ATLAS = Array.from({ length: STABLE_ATLAS_SIDE ** 2 }, (_, index) => {
  const row = String(Math.floor(index / STABLE_ATLAS_SIDE)).padStart(2, '0')
  const col = String(index % STABLE_ATLAS_SIDE).padStart(2, '0')
  return images[`../../assets/cat/atlas-stable/r${row}-c${col}.webp`]
})
