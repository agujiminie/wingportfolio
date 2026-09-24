const smoothstep = value => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

// Correct the undersized down-left pose as one rigid head/upper-neck image.
// Ease the correction across neighboring directions, not across time.
export function headNeckScale(index, side) {
  if (side < 2) return 1
  const x = (index % side) / (side - 1) * 2 - 1
  const y = Math.floor(index / side) / (side - 1)
  const left = smoothstep(-x / 0.9)
  const down = smoothstep((y - 0.35) / 0.55)
  return 1 + 0.075 * left * down
}

export function headNeckOffset(index, side) {
  if (side < 2) return { x: 0, y: 0 }
  const x = (index % side) / (side - 1) * 2 - 1
  const y = Math.floor(index / side) / (side - 1)
  const weight = smoothstep(-x / 0.9) * smoothstep((0.6 - y) / 0.4)
  if (!weight) return { x: 0, y: 0 }
  return { x: -10 * weight, y: -8 * weight }
}

export function neckGeometry(sourceY, scale, offset) {
  // Match the full head transform at the jaw and the original body at y=624.
  // Both endpoints have zero slope change, so neither can form a shelf.
  const weight = 1 - smoothstep((sourceY - 512) / 112)
  if (!weight) return { y: sourceY, scale: 1, x: 0 }
  return {
    y: sourceY + weight * ((sourceY - 512) * (scale - 1) + offset.y),
    scale: 1 + weight * (scale - 1),
    x: weight * (384 * (1 - scale) + offset.x),
  }
}

function sourceRow(destinationY, scale, offset) {
  let low = 0, high = 768
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2
    if (neckGeometry(middle, scale, offset).y < destinationY) low = middle
    else high = middle
  }
  return (low + high) / 2
}

export function drawAlignedHeadNeck(context, bitmap, enabled, index, side, resolution) {
  const scale = enabled ? headNeckScale(index, side) : 1
  const offset = enabled ? headNeckOffset(index, side) : { x: 0, y: 0 }
  // Pivot at the base of the jaw: the face and neck enlarge together, keeping
  // the chin near its existing height instead of lifting the whole cat.
  context.save()
  // A translated frame exposes strips on the right/bottom. Clear those strips
  // instead of retaining pixels from the previously displayed pose.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, resolution, resolution)
  context.translate(offset.x * resolution / 768, offset.y * resolution / 768)
  context.translate(resolution * 0.5, resolution * (512 / 768))
  context.scale(scale, scale)
  context.translate(-resolution * 0.5, -resolution * (512 / 768))
  context.drawImage(bitmap, 0, 0, resolution, resolution)
  context.restore()
  if (scale === 1 && offset.x === 0 && offset.y === 0) return scale

  // Sample one continuous source surface. Integer destination rows avoid
  // fractional strip gaps; there is no second neck image to protrude or ghost.
  const unit = resolution / 768
  const start = Math.floor(neckGeometry(512, scale, offset).y * unit)
  const end = 624 * unit
  const sourceWidth = bitmap.width || bitmap.naturalWidth
  const sourceHeight = bitmap.height || bitmap.naturalHeight
  let first = sourceRow(start / unit, scale, offset)
  for (let y = start; y < Math.ceil(end); y++) {
    const next = sourceRow((y + 1) / unit, scale, offset)
    const geometry = neckGeometry((first + next) / 2, scale, offset)
    context.drawImage(bitmap, 0, first / 768 * sourceHeight, sourceWidth, (next - first) / 768 * sourceHeight,
      geometry.x * unit, y, resolution * geometry.scale, 1)
    first = next
  }
  context.drawImage(bitmap, 0, 624 / 768 * sourceHeight, sourceWidth, 144 / 768 * sourceHeight,
    0, end, resolution, resolution - end)
  return scale
}
