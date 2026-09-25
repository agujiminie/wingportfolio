import { useEffect } from 'react'
import CatGazeAtlas from './components/cat/CatGazeAtlas'
import './cat-page.css'

export default function CatPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Cat · Wing Zeng'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="cat-page" aria-label="Margo follows your gaze">
      <a className="cat-page__home" href="#/">← Home</a>
      <CatGazeAtlas idle={false} />
    </main>
  )
}
