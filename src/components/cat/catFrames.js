/**
 * Frame table for CatGaze: a GRID×GRID array of image URLs, indexed
 * [row][col]. Row 0 = cat looking UP, row GRID-1 = looking DOWN;
 * col 0 = looking to the VIEWER'S LEFT, col GRID-1 = viewer's right.
 * The centre cell is the cat looking straight into the lens.
 *
 * Real photos live in src/assets/cat/ as `r{row}-c{col}.webp` (see the README
 * there for the shooting guide). Until they exist, PLACEHOLDER_FRAMES (a
 * procedurally drawn cat, 25 SVG data URIs) keeps the page fully functional.
 */

export const GRID = 5
export const CENTER = (GRID - 1) / 2

const photoModules = import.meta.glob('../../assets/cat/r*-c*.{webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

/** Build a [row][col] table from the glob; missing cells borrow the nearest
 *  available neighbour so a failed shot never leaves a hole. */
function buildPhotoFrames() {
  const found = new Map()
  for (const [path, url] of Object.entries(photoModules)) {
    const match = /r(\d+)-c(\d+)\.\w+$/.exec(path)
    if (!match) continue
    const row = Number(match[1])
    const col = Number(match[2])
    if (row < GRID && col < GRID) found.set(`${row},${col}`, url)
  }
  if (found.size === 0) return null

  const nearest = (row, col) => {
    let best = null
    let bestDist = Infinity
    for (const [key, url] of found) {
      const [r, c] = key.split(',').map(Number)
      const dist = (r - row) ** 2 + (c - col) ** 2
      if (dist < bestDist) {
        bestDist = dist
        best = url
      }
    }
    return best
  }

  return Array.from({ length: GRID }, (_, row) =>
    Array.from({ length: GRID }, (_, col) => found.get(`${row},${col}`) ?? nearest(row, col)),
  )
}

// ---------------------------------------------------------------------------
// Placeholder: a hand-drawn tabby whose head and pupils shift per cell.
// Portrait 4:5 canvas, similar framing to the reference video.
// ---------------------------------------------------------------------------

const PH_W = 800
const PH_H = 1000

function placeholderSvg(row, col) {
  const dx = (col - CENTER) / CENTER // -1 (left) … 1 (right)
  const dy = (row - CENTER) / CENTER // -1 (up) … 1 (down)

  const headX = PH_W / 2 + dx * 46
  const headY = 430 + dy * 34
  const headR = 190
  const pupilX = dx * 15
  const pupilY = dy * 11
  const eyeGap = 82
  const eyeY = headY - 10 + dy * 6
  const earLift = -dy * 10
  const noseY = headY + 58
  const fur = '#b9a58a'
  const furDark = '#7d6a52'
  const ink = '#2c2620'
  const cream = '#efe6d6'

  const ear = (side) => {
    const x = headX + side * 128
    const y = headY - 150
    return `
      <path d="M ${x - side * 52} ${y + 40} L ${x + side * 30} ${y - 105 + earLift} L ${x + side * 50} ${y + 70} Z" fill="${fur}" stroke="${furDark}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M ${x - side * 32} ${y + 42} L ${x + side * 24} ${y - 62 + earLift} L ${x + side * 36} ${y + 62} Z" fill="#dfb9b2"/>`
  }

  const eye = (side) => {
    const cx = headX + side * eyeGap
    return `
      <ellipse cx="${cx}" cy="${eyeY}" rx="34" ry="30" fill="${cream}" stroke="${furDark}" stroke-width="5"/>
      <ellipse cx="${cx + pupilX}" cy="${eyeY + pupilY}" rx="18" ry="24" fill="#5f8a3d"/>
      <ellipse cx="${cx + pupilX}" cy="${eyeY + pupilY}" rx="6" ry="20" fill="${ink}"/>
      <circle cx="${cx + pupilX - 6}" cy="${eyeY + pupilY - 9}" r="4.5" fill="#fff"/>`
  }

  const whiskers = (side) => {
    const x0 = headX + side * 70
    const y0 = noseY + 6
    return [-1, 0, 1]
      .map(
        (k) =>
          `<path d="M ${x0} ${y0 + k * 12} Q ${x0 + side * 120} ${y0 + k * 22 - 6} ${x0 + side * 230} ${y0 + k * 34 + dy * 10}" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>`,
      )
      .join('')
  }

  const stripes = [-3, -2, -1, 0, 1, 2, 3]
    .map((k) => {
      const x = headX + k * 28
      const y = headY - headR + 24
      return `<path d="M ${x} ${y} q ${k * 4} 50 ${k * 6} 84" stroke="${furDark}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.8"/>`
    })
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PH_W} ${PH_H}" width="${PH_W}" height="${PH_H}">
    <rect width="${PH_W}" height="${PH_H}" fill="#ffffff"/>
    <ellipse cx="${PH_W / 2 + dx * 12}" cy="${PH_H + 60}" rx="330" ry="470" fill="${fur}" stroke="${furDark}" stroke-width="6"/>
    <ellipse cx="${PH_W / 2 + dx * 12}" cy="${PH_H + 90}" rx="150" ry="360" fill="${cream}"/>
    ${ear(-1)}${ear(1)}
    <circle cx="${headX}" cy="${headY}" r="${headR}" fill="${fur}" stroke="${furDark}" stroke-width="6"/>
    ${stripes}
    <ellipse cx="${headX}" cy="${headY + 90}" rx="120" ry="80" fill="${cream}"/>
    ${eye(-1)}${eye(1)}
    <path d="M ${headX - 16} ${noseY - 8} L ${headX + 16} ${noseY - 8} L ${headX} ${noseY + 12} Z" fill="#d9958f"/>
    <path d="M ${headX} ${noseY + 12} v 16 M ${headX} ${noseY + 28} q -22 24 -44 6 M ${headX} ${noseY + 28} q 22 24 44 6" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${whiskers(-1)}${whiskers(1)}
    <text x="${PH_W - 24}" y="${PH_H - 24}" text-anchor="end" font-family="ui-monospace, monospace" font-size="22" fill="#b5b5b5">placeholder r${row} c${col}</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`
}

export const PLACEHOLDER_FRAMES = Array.from({ length: GRID }, (_, row) =>
  Array.from({ length: GRID }, (_, col) => placeholderSvg(row, col)),
)

const photoFrames = buildPhotoFrames()

/** True when real photos are wired in (vs. the drawn placeholder). */
export const HAS_CAT_PHOTOS = photoFrames !== null

/** The frame table the site should render right now. */
export const CAT_FRAMES = photoFrames ?? PLACEHOLDER_FRAMES
