const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// Frame-rate independent damping; cap speed so a fast pointer jump still
// visits neighboring poses. A new target replaces the old one immediately.
export function advanceGaze(position, target, elapsedMs, speed = 0.012, dampingMs = 65) {
  const dt = clamp(elapsedMs, 0, 32)
  const alpha = 1 - Math.exp(-dt / dampingMs)
  const maxStep = dt * speed
  const advance = (from, to) => Math.abs(to - from) < 0.002 ? to :
    from + clamp((to - from) * alpha, -maxStep, maxStep)
  return { x: advance(position.x, target.x), y: advance(position.y, target.y) }
}

// The sample covers c1 → c2 → c3, i.e. the middle half of the original range.
// Keep the same pointer-to-angle scale when comparing all three modes.
export function interpolatedIndex(x, frameCount) {
  return Math.round((clamp(x, -0.5, 0.5) + 0.5) * (frameCount - 1))
}

export function atlasIndex(position, side) {
  const index = value => Math.round((clamp(value, -1, 1) + 1) / 2 * (side - 1))
  return index(position.y) * side + index(position.x)
}
