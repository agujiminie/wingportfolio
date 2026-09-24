const samples = import.meta.glob('../../assets/cat/interpolated/h*.webp', {
  eager: true,
  import: 'default',
})

export const INTERPOLATED_FRAMES = Object.entries(samples)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)
