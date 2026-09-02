import { STATE_BY_ID } from '../content'

/**
 * Landing tabs ↔ URL paths. Each tab owns a clean, shareable path
 * (wingzeng.design/ai-playground opens the AI Playground tab directly).
 *
 * The host must serve index.html for these paths — vercel.json's rewrite
 * does that on Vercel; Vite dev/preview do it by default (appType 'spa').
 * The hash routes (#/gallery, #/project/<slug>) are unaffected: they render
 * on top of whatever path is current, and "#/" brings you back to that tab.
 */
export const TAB_PATHS = {
  work: '/work',
  playground: '/ai-playground',
  analogue: '/analog',
}

// Aliases so older / hand-typed variants still land on the right tab.
const PATH_TO_TAB = {
  '/': 'work',
  '/work': 'work',
  '/playground': 'playground',
  '/ai-playground': 'playground',
  '/analog': 'analogue',
  '/analogue': 'analogue',
}

const DEFAULT_TAB = 'work'

/** Canonical path for a tab id. */
export function tabPath(id) {
  return TAB_PATHS[id] ?? TAB_PATHS[DEFAULT_TAB]
}

/**
 * Resolves the tab addressed by a location: the path first, then the legacy
 * "?state=<id>" query (kept so old links keep working), else the default.
 */
export function tabFromLocation(location = window.location) {
  // Legacy query first: "/?state=analogue" must beat the bare "/" → work rule.
  const legacy = new URLSearchParams(location.search).get('state')
  if (legacy && STATE_BY_ID[legacy]) return legacy

  const path = (location.pathname || '/').replace(/\/+$/, '').toLowerCase() || '/'
  return PATH_TO_TAB[path] ?? DEFAULT_TAB
}

/**
 * On first load, rewrite legacy / alias URLs ("/?state=analogue", "/playground")
 * to the canonical path without adding a history entry. The bare "/" is left
 * alone — it is the home URL and simply shows the default tab.
 */
export function normalizeTabPath(id) {
  if (typeof window === 'undefined') return
  const { pathname, search, hash } = window.location
  const canonical = tabPath(id)
  const isHome = pathname === '/' && id === DEFAULT_TAB
  if (!search && (pathname === canonical || isHome)) return
  window.history.replaceState({ tab: id }, '', (isHome ? '/' : canonical) + hash)
}

/**
 * Writes the tab's path into the address bar (pushState so Back/Forward walk
 * through tabs). No-op when the URL already points at that tab, so a popstate
 * round-trip doesn't grow history. Drops the legacy ?state= query.
 */
export function pushTabPath(id) {
  if (typeof window === 'undefined') return
  const next = tabPath(id)
  if (window.location.pathname === next && !window.location.search) return
  window.history.pushState({ tab: id }, '', next + window.location.hash)
}
