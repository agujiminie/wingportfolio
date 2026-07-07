// Project case-study registry + hash-route parsing.
// Routes are hash-based (#/project/<slug>) so they work on any static host
// (GitHub Pages included) with no rewrite rules or router dependency.

import { ORACLE } from './oracle'
import { NOVOED } from './novoed'
import { NOVOED_MOBILE } from './novoedMobile'
import { TACC } from './tacc'
import { TENCENT } from './tencent'
import { MUSION } from './musion'

// Display order — also drives the "Next project" footer navigation.
// Add new case studies here as they are migrated (ai-game, ai-playlist, ...).
export const PROJECT_ORDER = [ORACLE, NOVOED, NOVOED_MOBILE, TACC, TENCENT, MUSION]

export const PROJECTS = Object.fromEntries(
  PROJECT_ORDER.map((project) => [project.slug, project]),
)

const PROJECT_HASH_RE = /^#\/project\/([\w-]+)\/?$/

/** Returns the project for a location hash like "#/project/oracle", else null. */
export function getProjectFromHash(hash) {
  const match = PROJECT_HASH_RE.exec(hash ?? '')
  if (!match) return null
  return PROJECTS[match[1]] ?? null
}

/** Builds the canonical hash link for a project slug. */
export function projectHref(slug) {
  return `#/project/${slug}`
}

/** The project after `slug` in display order, or null when it is the only one. */
export function getNextProject(slug) {
  if (PROJECT_ORDER.length < 2) return null
  const index = PROJECT_ORDER.findIndex((project) => project.slug === slug)
  return PROJECT_ORDER[(index + 1) % PROJECT_ORDER.length]
}
