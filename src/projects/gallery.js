// Gallery page data — analog artwork exported from the Webflow /gallery page.
// Assets live in src/assets/projects/gallery/{thumb,full}; thumbs (~500px) feed
// the scatter hero and masonry grid, fulls (~1080px) feed the lightbox.

// Same photo/frame as the old "In Real Life" collection card — a plain,
// unrotated window (no caption), unlike the scattered paper-card artwork.
import realLifeCover from '../assets/projects/real-life.png'

// Vite glob imports resolve every artwork at build time; `import` narrows the
// module to its default export (the hashed URL string).
const THUMBS = import.meta.glob('../assets/projects/gallery/thumb/*.webp', {
  eager: true,
  import: 'default',
})
const FULLS = import.meta.glob('../assets/projects/gallery/full/*.webp', {
  eager: true,
  import: 'default',
})

function thumbSrc(id) {
  return THUMBS[`../assets/projects/gallery/thumb/${id}.webp`]
}

function fullSrc(id) {
  return FULLS[`../assets/projects/gallery/full/${id}.webp`]
}

export const GALLERY_CATEGORIES = [
  {
    id: 'jimin',
    label: 'My Muse · Jimin',
    blurb: 'Portrait studies of one muse, in every medium I could get my hands on.',
  },
  {
    id: 'cats',
    label: 'Definition of Cats',
    blurb: 'An icon system that tries to define cats — ten personalities, four glyphs each.',
  },
  {
    id: 'letters',
    label: 'Characters',
    blurb: 'Type experiments: single letters repeated, rotated and rebuilt into patterns.',
  },
  {
    id: 'elearning',
    label: 'Illustration',
    blurb: 'Vector illustrations drawn for e-learning products and campaigns.',
  },
  {
    id: 'hand',
    label: 'Hand Drawings',
    blurb: 'Life drawing, charcoal and oil pastel — the slowest, most honest practice.',
  },
]

// ratio = width / height of the exported image (drives masonry placeholders).
const RAW_ITEMS = {
  jimin: [
    ['jimin-01', 0.7495, 'Portrait of Jimin in sunglasses — pencil and digital color on blue'],
    ['jimin-02', 0.7877, 'Soft pastel portrait of Jimin in pink'],
    ['jimin-03', 0.7976, 'Line drawing of Jimin in an embroidered jacket'],
    ['jimin-04', 0.766, 'Pencil portrait study on grid paper'],
    ['jimin-05', 0.75, '“Don’t think about making art” poster study in yellow and pink'],
    ['jimin-06', 0.7495, 'Pop-color portrait with a rose — purple and pink on blue'],
    ['jimin-07', 0.916, 'Black-and-white pencil portrait, hand over face'],
    ['jimin-08', 0.5261, 'Digital painting of Jimin in a black jacket'],
    ['jimin-09', 1.0256, 'San Francisco collage illustration'],
  ],
  cats: [
    ['cats-01', 0.7727, 'Cat icon set — “Sociable”'],
    ['cats-02', 0.7727, 'Cat icon set — “Nervous”'],
    ['cats-03', 0.7727, 'Cat icon set — “Humorless”'],
    ['cats-04', 0.7727, 'Cat icon set — “Round”'],
    ['cats-05', 0.7727, 'Cat icon set — “Pride”'],
    ['cats-06', 0.7727, 'Cat icon set — “Loving”'],
    ['cats-07', 0.7727, 'Cat icon set — “Vocal”'],
    ['cats-08', 0.7727, 'Cat icon set — “Athletic”'],
    ['cats-09', 0.7727, 'Cat icon set — “Curious”'],
    ['cats-10', 0.7727, 'Cat icon set — “Scheming”'],
  ],
  letters: [
    ['letters-01', 0.7725, 'Letterform pattern study — stacked glyph tower'],
    ['letters-02', 0.7725, 'Letterform pattern study — repeated “3” waves'],
    ['letters-03', 0.7725, 'Letterform pattern study — interlocking chevrons'],
    ['letters-04', 0.7725, 'Letterform pattern study — mirrored “S” pairs'],
    ['letters-05', 0.7725, 'Letterform pattern study — ornamental masks'],
    ['letters-06', 0.7725, 'Letterform pattern study — scattered “K” field'],
    ['letters-07', 0.7725, 'Letterform pattern study — “F” lattice'],
    ['letters-08', 0.7725, 'Letterform pattern study — rounded maze'],
    ['letters-09', 0.7725, 'Letterform pattern study — zigzag diagonal'],
    ['letters-10', 0.7725, 'Letterform pattern study — tumbling “F” cluster'],
    ['letters-11', 0.7725, 'Letterform pattern study — chained “C” bands'],
    ['letters-12', 0.7725, 'Letterform pattern study — brackets and circles'],
    ['letters-13', 0.7725, 'Letterform pattern study — symmetric monkey faces'],
  ],
  elearning: [
    ['elearning-01', 2.1687, 'E-learning illustration — hands and megaphone on green'],
    ['elearning-02', 2.1687, 'E-learning illustration — idea sharing in pastel'],
    ['elearning-03', 2.1687, 'E-learning illustration — blue geometric waves'],
    ['elearning-04', 1.998, 'Character stickers and badge illustrations'],
    ['elearning-05', 1.6901, 'Isometric virtual exhibition hall illustration'],
    ['elearning-06', 2.1687, 'Isometric device and workspace illustration'],
    ['elearning-07', 2.2594, 'Paw-print pattern illustration on orange'],
    ['elearning-08', 1.5675, 'Brand book spreads and print collateral'],
    ['elearning-09', 2.1176, 'Campus poster series with framed illustrations'],
    ['elearning-10', 2.1135, 'Outline-style course illustration with badges'],
  ],
  hand: [
    ['hand-01', 0.75, 'Charcoal figure drawing — standing pose'],
    ['hand-02', 1.0011, 'Pink dog on yellow — oil pastel'],
    ['hand-03', 1.3333, 'Watercolor sky study'],
    ['hand-04', 0.75, 'Charcoal figure drawing — arm raised'],
    ['hand-05', 0.7495, 'Charcoal figure drawing — leaning pose'],
    ['hand-06', 0.75, 'Charcoal figure drawing — full figure'],
    ['hand-07', 0.75, 'Charcoal study of a hand'],
    ['hand-08', 0.7495, 'Yellow dog on magenta — oil pastel'],
    ['hand-09', 1.3333, 'Street corner in oil pastel — blue and orange'],
    ['hand-10', 0.75, 'Graphite figure sketch — hand to shoulder'],
    ['hand-11', 0.7505, 'Graphite figure sketch — back view'],
    ['hand-12', 0.7505, 'Graphite figure sketch — seated pose'],
  ],
}

export const GALLERY_ITEMS = Object.entries(RAW_ITEMS).flatMap(([category, rows]) =>
  rows.map(([id, ratio, alt]) => ({
    id,
    category,
    ratio,
    alt,
    thumb: thumbSrc(id),
    full: fullSrc(id),
  })),
)

const ITEM_BY_ID = Object.fromEntries(GALLERY_ITEMS.map((item) => [item.id, item]))

/** Items for a tab — 'all' interleaves categories so ratios and colors mix. */
export function galleryItemsFor(categoryId) {
  if (categoryId !== 'all') {
    return GALLERY_ITEMS.filter((item) => item.category === categoryId)
  }
  const buckets = GALLERY_CATEGORIES.map((cat) =>
    GALLERY_ITEMS.filter((item) => item.category === cat.id),
  )
  const longest = Math.max(...buckets.map((bucket) => bucket.length))
  const mixed = []
  for (let i = 0; i < longest; i++) {
    for (const bucket of buckets) {
      if (bucket[i]) mixed.push(bucket[i])
    }
  }
  return mixed
}

// ── Scatter hero ──────────────────────────────────────────────────────────
// Slot positions are hand-tuned (Claude-startups style): cards ring the hero
// and bleed past its edges, keeping the center clear for the headline + tabs.
// x/y are % of the hero box (card centers), w is the card width in px at the
// reference 1440 viewport (scaled via clamp in CSS), r is rotation in deg,
// speed drives the scroll parallax (1 = scrolls with page). `mobile: false`
// slots are hidden below 768px.
export const SCATTER_SLOTS = [
  { x: 8, y: 16, w: 230, r: -7, speed: 0.75, mobile: true },
  { x: 27, y: 4, w: 170, r: 4, speed: 1.3, mobile: false },
  { x: 76, y: 7, w: 200, r: 6, speed: 1.15, mobile: false },
  { x: 94, y: 22, w: 260, r: -4, speed: 0.65, mobile: true },
  { x: 3, y: 52, w: 270, r: 5, speed: 0.9, mobile: false },
  { x: 92, y: 58, w: 185, r: -8, speed: 1.35, mobile: false },
  { x: 12, y: 88, w: 200, r: 8, speed: 1.2, mobile: true },
  { x: 38, y: 97, w: 250, r: -5, speed: 0.8, mobile: false },
  { x: 66, y: 93, w: 175, r: 7, speed: 1.25, mobile: false },
  { x: 89, y: 92, w: 230, r: -6, speed: 1.0, mobile: true },
]

// Curated picks per tab, ordered to match SCATTER_SLOTS (color/medium mix).
// "all" leans on the muse portraits (mostly Jimin) with one hand drawing and
// two illustrations mixed in, per the wide slots (2, 7) taking the wide
// e-learning frames so they aren't over-cropped.
const SCATTER_PICKS = {
  all: [
    'jimin-01',
    'jimin-05',
    'elearning-02',
    'jimin-06',
    'hand-01',
    'jimin-02',
    'jimin-07',
    'elearning-07',
    'jimin-03',
    'jimin-04',
  ],
  jimin: [
    'jimin-01',
    'jimin-05',
    'jimin-02',
    'jimin-06',
    'jimin-09',
    'jimin-03',
    'jimin-07',
    'jimin-04',
    'jimin-08',
  ],
  cats: [
    'cats-06',
    'cats-01',
    'cats-05',
    'cats-10',
    'cats-04',
    'cats-07',
    'cats-02',
    'cats-08',
    'cats-09',
    'cats-03',
  ],
  letters: [
    'letters-09',
    'letters-12',
    'letters-05',
    'letters-01',
    'letters-13',
    'letters-04',
    'letters-06',
    'letters-11',
    'letters-02',
    'letters-08',
  ],
  elearning: [
    'elearning-02',
    'elearning-07',
    'elearning-01',
    'elearning-05',
    'elearning-04',
    'elearning-09',
    'elearning-03',
    'elearning-06',
    'elearning-10',
    'elearning-08',
  ],
  hand: [
    'hand-02',
    'hand-08',
    'hand-01',
    'hand-09',
    'hand-03',
    'hand-07',
    'hand-04',
    'hand-11',
    'hand-05',
    'hand-12',
  ],
}

/** Scatter cards for a tab: one item per slot (short categories skip slots). */
export function scatterCardsFor(categoryId) {
  const picks = SCATTER_PICKS[categoryId] ?? SCATTER_PICKS.all
  return picks
    .slice(0, SCATTER_SLOTS.length)
    .map((id, index) => ({ item: ITEM_BY_ID[id], slot: SCATTER_SLOTS[index] }))
    .filter((card) => Boolean(card.item))
}

// Closing frame — the same photo + plain window used by the old "In Real
// Life" collection card (imageOnly, no caption, no rotation).
export const GALLERY_CLOSING = {
  src: realLifeCover,
  alt: 'In real life — behind the sketches: studio days, gallery visits, and travel.',
  aspect: 1.415,
}

export const GALLERY_HASH = '#/gallery'

/** True when the location hash addresses the gallery page. */
export function isGalleryHash(hash) {
  return /^#\/gallery\/?$/.test(hash ?? '')
}
