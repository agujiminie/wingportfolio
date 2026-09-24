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

export function drawAlignedHeadNeck(context, bitmap, neckLayer, index, side, resolution, drawNeck) {
  const scale = neckLayer ? headNeckScale(index, side) : 1
  // Pivot at the base of the jaw: the face and neck enlarge together, keeping
  // the chin near its existing height instead of lifting the whole cat.
  context.save()
  context.translate(resolution * 0.5, resolution * (512 / 768))
  context.scale(scale, scale)
  context.translate(-resolution * 0.5, -resolution * (512 / 768))
  context.drawImage(bitmap, 0, 0, resolution, resolution)
  if (neckLayer) drawNeck(context, neckLayer)
  context.restore()
  return scale
}
