import { forwardRef } from 'react'
import bg3 from './assets/figma/bg3-analog.png'
import bg2 from './assets/figma/bg2-ai-playground.png'
import bg1 from './assets/figma/bg1-latest-work.png'

const BG_BY_STATE = {
  analogue: bg3,
  playground: bg2,
  work: bg1,
}

const LandingBackground = forwardRef(function LandingBackground({ activeId }, ref) {
  return (
    <div ref={ref} className="landing-bg" aria-hidden="true">
      {Object.entries(BG_BY_STATE).map(([id, image]) => (
        <div
          key={id}
          className={`landing-bg__layer${activeId === id ? ' is-visible' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
    </div>
  )
})

export default LandingBackground
