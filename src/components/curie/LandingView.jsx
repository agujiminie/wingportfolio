/* eslint-disable react/prop-types */
import Composer from './Composer'
import { CodeIcon, FlaskIcon, DocumentIcon, SwapIcon } from './icons'
import { ACTIONS } from './curieContent'

const ACTION_ICONS = {
  code: CodeIcon,
  flask: FlaskIcon,
  document: DocumentIcon,
  swap: SwapIcon,
}

/**
 * Screen 1 — the blank landing page with a pre-filled prompt and a
 * pre-selected repository, ready for the user to send.
 */
export default function LandingView({ value, onChange, onSend }) {
  return (
    <div className="curie-landing curie-fade">
      <h2 className="curie-landing__title">How can I help you today?</h2>

      <div className="curie-landing__composer">
        <Composer value={value} onChange={onChange} onSend={onSend} showRepo />

        <div className="curie-actionbar">
          {ACTIONS.map((action) => {
            const Icon = ACTION_ICONS[action.icon]
            return (
              <button key={action.id} type="button" className="curie-action" tabIndex={-1}>
                <Icon />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
