import bg3 from '../bg/bg3.png'
import bg2 from '../bg/bg2.png'
import bg1 from '../bg/bg1.png'
import Dither from './components/Dither/Dither'

const BG_BY_STATE = {
  analogue: bg3,
  playground: bg2,
  work: bg1,
}

function LandingBackground({ activeId }) {
  return (
    <div className="landing-bg" aria-hidden="true">
      {Object.entries(BG_BY_STATE).map(([id, image]) => (
        <div
          key={id}
          className={`landing-bg__layer${activeId === id ? ' is-visible' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      <div className="landing-bg__dither-shell">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={2.5}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={2.5}
          waveSpeed={0.02}
        />
      </div>
    </div>
  )
}

export default LandingBackground
