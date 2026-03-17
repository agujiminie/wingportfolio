import { startTransition, useState } from 'react'
import MorphStage from './MorphStage'
import {
  MORPH_FRAMES,
  ORDER_BY_ACTIVE,
  STATE_BY_ID,
  STATES,
  SWITCH_SLOTS,
} from './content'

export default function App() {
  const [activeId, setActiveId] = useState('work')

  const activeState = STATE_BY_ID[activeId]
  const orderedStates = ORDER_BY_ACTIVE[activeId].map((id) => STATE_BY_ID[id])

  return (
    <main
      className="landing"
      style={{
        '--gradient-bottom': activeState.gradientBottom,
        '--active-fill': activeState.activeFill,
        '--active-text': activeState.activeText,
      }}
    >
      <div className="landing__noise" aria-hidden="true" />

      <header className="landing__header">
        <h1>Wing Zeng</h1>
        <p>8+yoe AI Product Designer</p>
      </header>

      <section className="landing__switcher" aria-label="Category switcher">
        {orderedStates.map((state, index) => {
          const isActive = state.id === activeId

          return (
            <button
              key={state.id}
              type="button"
              aria-pressed={isActive}
              className={`landing__pill${isActive ? ' is-active' : ''}`}
              style={SWITCH_SLOTS[index]}
              onClick={() => {
                if (state.id === activeId) {
                  return
                }

                startTransition(() => {
                  setActiveId(state.id)
                })
              }}
            >
              {state.pillLabel}
            </button>
          )
        })}
      </section>

      <section
        className={`landing__scene landing__scene--${activeState.id}`}
        style={{
          '--blob-color': activeState.blobColor,
          '--blob-transform': activeState.blobTransform,
          '--blob-width': activeState.blobWidth,
          '--blob-height': activeState.blobHeight,
          '--shadow-color': activeState.shadowColor,
          '--shadow-transform': activeState.shadowTransform,
          '--shadow-width': activeState.shadowWidth,
          '--shadow-height': activeState.shadowHeight,
        }}
      >
        <div className="landing__shadow" aria-hidden="true" />
        <div className="landing__blob" aria-hidden="true" />
        <MorphStage activeId={activeId} states={STATES} morphFrames={MORPH_FRAMES} />
      </section>
    </main>
  )
}
