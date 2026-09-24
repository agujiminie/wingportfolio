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

export function drawAlignedHeadNeck(context, bitmap, neckLayer, index, side, resolution, drawNeck) {
  const scale = neckLayer ? headNeckScale(index, side) : 1
  const offset = neckLayer ? headNeckOffset(index, side) : { x: 0, y: 0 }
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
  if (neckLayer) drawNeck(context, neckLayer)
  context.restore()
  return scale
}
