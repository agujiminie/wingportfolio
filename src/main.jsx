import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ProjectPage from './ProjectPage'
import GalleryPage from './GalleryPage'
import { getProjectFromHash } from './projects'
import { isGalleryHash } from './projects/gallery'
import './index.css'

/**
 * Hash router: "#/project/<slug>" renders that case study, "#/gallery" the
 * analog gallery; anything else renders the landing App. Hash routes need no
 * host rewrite rules, so the built site keeps working on any static host.
 */
function Root() {
  const [route, setRoute] = React.useState(() => parseRoute(window.location.hash))

  React.useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (route.gallery) return <GalleryPage />
  if (route.project) return <ProjectPage key={route.project.slug} project={route.project} />
  return <App />
}

function parseRoute(hash) {
  return { gallery: isGalleryHash(hash), project: getProjectFromHash(hash) }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
