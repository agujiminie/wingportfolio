const SIZE = 5

function placeholder(row, col) {
  const x = (col - 2) * 8
  const y = (row - 2) * 6
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
    <rect width="500" height="500" fill="white"/>
    <path d="M130 500 Q130 290 250 290 Q370 290 370 500" fill="#d4a36b"/>
    <g transform="translate(${x / 2} ${y / 2})">
      <path d="M142 207 L135 80 L210 138 Q250 126 290 138 L365 80 L358 207 Q362 312 250 323 Q138 312 142 207" fill="#e3b682"/>
      <path d="M164 151 L154 113 L194 146 M306 146 L346 113 L336 151" fill="#e4b0a1"/>
      <ellipse cx="250" cy="266" rx="59" ry="42" fill="#fff8ee"/>
      <g fill="#d6d1a8"><ellipse cx="204" cy="213" rx="26" ry="19"/><ellipse cx="296" cy="213" rx="26" ry="19"/></g>
      <g fill="#34342c"><ellipse cx="${204 + x}" cy="${213 + y}" rx="7" ry="13"/><ellipse cx="${296 + x}" cy="${213 + y}" rx="7" ry="13"/></g>
      <path d="M240 253 L260 253 L250 264Z" fill="#c87c7e"/>
      <path d="M250 264v9m-12 0q12 10 24 0" fill="none" stroke="#97735a" stroke-width="2"/>
    </g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const PLACEHOLDER_FRAMES = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => placeholder(row, col)),
)

// Missing cells borrow the closest available direction, deterministically.
export function fillMissingFrames(frames) {
  const available = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (frames?.[row]?.[col]) available.push({ row, col, src: frames[row][col] })
    }
  }
  if (!available.length) return PLACEHOLDER_FRAMES
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => available.reduce((closest, frame) =>
      (frame.row - row) ** 2 + (frame.col - col) ** 2 <
      (closest.row - row) ** 2 + (closest.col - col) ** 2 ? frame : closest,
    ).src),
  )
}

const photos = import.meta.glob('../../assets/cat/r*-c*.webp', {
  eager: true,
  import: 'default',
})
const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
for (const [path, src] of Object.entries(photos)) {
  const match = path.match(/r([0-4])-c([0-4])\.webp$/)
  if (match) grid[Number(match[1])][Number(match[2])] = src
}

export const CAT_FRAMES = fillMissingFrames(grid)
