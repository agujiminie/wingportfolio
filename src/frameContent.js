// Static content for the viewport-framing panels that surround the morph canvas.
// Panel positions are defined in index.css (.frame__*); this module owns the copy.

// Project cover images — transparent PNGs (~1440px wide). Alpha is preserved
// so the persistent background shows through wherever the artwork is cut out.
import musionCover from './assets/projects/musion.png'
import oracleCover from './assets/projects/oracle.png'
import novoedCover from './assets/projects/novoed.png'
import taccCover from './assets/projects/tacc.png'
import tencentCover from './assets/projects/tencent.png'
import aiPlaylistCover from './assets/projects/ai-playlist.png'
import realLifeCover from './assets/projects/real-life.png'
import aiGameCover from './assets/projects/ai-game.png'

export const BRAND = {
  name: 'Wing Zeng',
}

// Per-tab hero headline; each entry renders as its own line. Keys match STATE ids.
export const HEADLINES = {
  work: ['Make it simple.', 'Make it human.', 'Make it.'],
  playground: ['Make it fun.', 'Make it possible.', 'Make it.'],
  analogue: ['Make it tangible.', 'Make it beautiful.', 'Make it.'],
}

// Top-right icon buttons.
export const CTAS = [
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: '#' },
  { id: 'email', label: 'Email', icon: 'mail', href: 'mailto:wzeng@curietech.ai' },
]

// Left-edge nav drives the morph stage; each id must match a STATE id in content.js.
export const NAV_ITEMS = [
  { id: 'work', label: 'Work' },
  { id: 'playground', label: 'AI Playground' },
  { id: 'analogue', label: 'Analog' },
]

// ── Second screen (scroll-revealed) ──────────────────────────────────────
// Copy is sourced from the Figma landing frames (Current Work / Previous Work).

export const CURRENT_WORK = {
  label: 'Current Work',
  title: 'Making AI Agents work for Enterprise Engineers',
  description:
    'As the founding designer, I’m designing an agent platform for enterprise IT, where engineers collaborate with specialized AI agents to build, test, document, and maintain complex integrations.',
}

// Previous work — rendered as the same alternating feature rows as the
// collection tabs. Media + links are placeholders until real project assets
// are supplied (each links to its own project page later).
export const EXPERIENCE = [
  {
    name: 'Oracle',
    tag: 'AI Service Platform',
    blurb: 'Unlock Customer Satisfaction by AI Powered Service Platform',
    cover: oracleCover,
    // Anchor bottom-right, scale up (left edge ~1/5 in), then nudge down a touch
    // so the "ORACLE" wordmark sits a bit below the top edge.
    coverStyle: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right bottom', transform: 'translateY(7%) scale(1.14)', transformOrigin: 'right bottom' },
    cta: 'View project',
    href: '#',
  },
  {
    name: 'NovoEd',
    tag: 'Learning Platform',
    blurb: 'Practice, Learn and Improve On-the-go — Enhance Learning Through Video Practice',
    cover: novoedCover,
    cta: 'View project',
    href: '#',
  },
  {
    name: 'Texas Advanced Computing Center',
    tag: 'Design System',
    blurb: 'Build the Sustainable Design System for Global Scholars Using TACC AI Consoles',
    cover: taccCover,
    cta: 'View project',
    href: '#',
  },
  {
    name: 'Tencent',
    tag: 'Live Streaming',
    blurb: 'Bring the Social Live Streaming to Millions of Corporate Learners',
    cover: tencentCover,
    cta: 'View project',
    href: '#',
  },
]

// ── AI Playground tab (scroll-revealed) ──────────────────────────────────
// Three side projects, each shown as an alternating feature row with its own
// 镂空 cutout. Media + links are placeholders until real assets are supplied.
export const PLAYGROUND = {
  label: 'AI Playground',
  title: 'Side projects I build with AI',
  description:
    'Off the clock, I explore what AI makes possible — a search tool, a game, and music — built for the joy of making.',
  items: [
    {
      name: 'Musion',
      tag: 'AI Search',
      blurb: 'An AI search tool that helps you explore and go deeper on a new passion.',
      cover: musionCover,
      // Anchor right so the artwork's right edge meets the frame; whole image kept.
      coverStyle: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right center' },
      cta: 'View project',
      href: '#',
    },
    {
      name: 'AI Game Design & Development',
      tag: 'Roblox · Game',
      blurb:
        'Designed and launched an open-world social lobby game on Roblox, built end-to-end with AI.',
      cover: aiGameCover,
      // Opaque screenshot → size the box to the image (1.387) so the whole shot
      // shows with rounded corners (10px), like the AI Playlist cover.
      coverStyle: { height: '86%', width: 'auto', aspectRatio: '1.387 / 1', objectFit: 'cover', borderRadius: '10px' },
      cta: 'View project',
      href: '#',
    },
    {
      name: 'AI Playlist',
      tag: 'Music',
      blurb: 'A growing collection of me producing music in collaboration with AI.',
      cover: aiPlaylistCover,
      // Opaque square album art → size the box to the image and round its
      // corners to match the placeholder (10px).
      coverStyle: { height: '86%', width: 'auto', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '10px' },
      cta: 'Listen',
      href: '#',
    },
  ],
}

// ── Analog tab (scroll-revealed) ─────────────────────────────────────────
// Three collections. "In Real Life" holds two photos, so it renders two frames
// inside its cutout (frames: 2).
export const ANALOG = {
  label: 'Analog',
  title: 'Made by hand, away from the screen',
  description:
    'The analog side of my practice — drawing, collage, and the moments in between.',
  items: [
    {
      name: 'Gallery',
      tag: 'Drawing',
      blurb: 'A collection of my hand drawings.',
      cta: 'View gallery',
      href: '#',
    },
    {
      name: '手帐 / Collage Art',
      tag: 'Collage',
      blurb: 'Journal spreads and collage art — follow along on Instagram.',
      cta: 'View on Instagram',
      href: '#',
    },
    {
      // Image only — no caption. The frame matches the collage's aspect ratio
      // (1.415) so it fills edge-to-edge, and the frame is centred in the row.
      name: 'In Real Life',
      cover: realLifeCover,
      imageOnly: true,
      coverAspect: '1.415',
      coverStyle: { width: '100%', height: '100%', objectFit: 'cover' },
    },
  ],
}

// Maps a tab id → its scroll-revealed collection. 'work' is rendered with its
// own bespoke layout (current work + previous work), so it is not listed here.
export const COLLECTIONS = {
  playground: PLAYGROUND,
  analogue: ANALOG,
}
