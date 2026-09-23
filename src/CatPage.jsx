import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { BRAND } from './frameContent'
import CatGaze from './components/cat/CatGaze'
import { CAT_FRAMES } from './components/cat/catFrames'
import './cat-page.css'

/**
 * Standalone #/cat page — white viewport, one cat, nothing else (like the
 * reference video). The cat itself is the reusable <CatGaze>, so the landing
 * page can host the same component later without touching this file.
 */
export default function CatPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `Cat · ${BRAND.name}`
    document.documentElement.classList.add('cat-page-active')
    return () => {
      document.title = previousTitle
      document.documentElement.classList.remove('cat-page-active')
    }
  }, [])

  return (
    <main className="cat-page">
      <a className="cat-page__home" href="#/">
        <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
        <span>Home</span>
      </a>
      <div className="cat-page__stage">
        <CatGaze frames={CAT_FRAMES} />
      </div>
    </main>
  )
}
