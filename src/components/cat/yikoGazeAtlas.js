import manifest from '../../assets/yiko/atlas/manifest.json'
import torso from '../../assets/yiko/atlas/torso.webp'
import poster from '../../assets/yiko/frames/r2-c2.webp'

const images = import.meta.glob('../../assets/yiko/atlas/r*-c*.webp', { eager: true, import: 'default' })
const revisions = new Map(manifest.frames.map(frame => [frame.file, frame.sha256.slice(0, 12)]))
const torsoUrl = import.meta.env.DEV ? `${torso}?v=${manifest.torso.sha256.slice(0, 12)}` : torso
const side = manifest.gridSize
const frames = Array.from({ length: side ** 2 }, (_, index) => {
  const row = String(Math.floor(index / side)).padStart(2, '0')
  const col = String(index % side).padStart(2, '0')
  const file = `r${row}-c${col}.webp`
  const url = images[`../../assets/yiko/atlas/${file}`]
  // The renderer caches downloads. Local atlas edits need fresh URLs too;
  // production asset URLs already contain Vite's content hash.
  return import.meta.env.DEV && url ? `${url}?v=${revisions.get(file)}` : url
})

// Stable objects keep the shared renderer/cache alive between ordinary renders.
export const YIKO_GAZE = {
  frames,
  gridSize: side,
  resolution: manifest.frameSize,
  fixedTorso: { url: torsoUrl, top: manifest.torso.top / manifest.frameSize },
  poster,
  characterName: 'Yiko',
  characterDescription: 'a silver tabby cat holding a teal fish toy',
  // Compensate for the hero's 1.17 scale / 0.179 downward framing so the
  // pointer origin stays level with Magu: (0.42 - 1 + 1.17 - 0.179) / 1.17.
  faceAnchor: { x: 0.5, y: 0.3512820512820513 },
}
