const smoothstep = (start, end, value) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

// A spatial mask, never a transition between poses. Keep the outside neck
// and shoulders from one reference while leaving the moving muzzle exposed.
export function neckLockAlpha(x, y) {
  const sides = Math.max(1 - smoothstep(204, 248, x), smoothstep(528, 572, x))
  const neck = smoothstep(416, 480, y) * sides
  const chest = smoothstep(584, 624, y)
  return Math.max(neck, chest)
}

export function createNeckLockLayer(reference, resolution) {
  const layer = document.createElement('canvas')
  layer.width = layer.height = resolution
  const context = layer.getContext('2d')
  if (!context) return null
  context.drawImage(reference, 0, 0, resolution, resolution)
  const pixels = context.getImageData(0, 0, resolution, resolution)
  const scale = 768 / resolution
  for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
    pixels.data[(y * resolution + x) * 4 + 3] = Math.round(255 * neckLockAlpha(x * scale, y * scale))
  }
  context.putImageData(pixels, 0, 0)
  return layer
}

export function drawNeckLockLayer(context, layer) {
  const scale = layer.width / 768
  // Draw only the neck regions; keep the central muzzle and eyes exposed.
  for (const [x, y, width, height] of [[0, 417, 248, 167], [529, 417, 239, 167], [0, 584, 768, 184]]) {
    const rect = [x * scale, y * scale, width * scale, height * scale]
    context.drawImage(layer, ...rect, ...rect)
  }
}
