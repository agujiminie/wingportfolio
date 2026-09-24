import manifest from '../../assets/cat/atlas/manifest.json'

const images = import.meta.glob('../../assets/cat/atlas/r*-c*.webp', { eager: true, import: 'default' })
export const ATLAS_SIDE = manifest.gridSize
export const ATLAS_RESOLUTION = manifest.frameSize
export const GAZE_ATLAS = Array.from({ length: ATLAS_SIDE * ATLAS_SIDE }, (_, index) => {
  const row = String(Math.floor(index / ATLAS_SIDE)).padStart(2, '0')
  const col = String(index % ATLAS_SIDE).padStart(2, '0')
  return images[`../../assets/cat/atlas/r${row}-c${col}.webp`]
})
