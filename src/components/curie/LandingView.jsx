/* eslint-disable react/prop-types */
import Composer from './Composer'
import { ACTIONS } from './curieContent'

/**
 * Screen 1 — the landing page (Curie Design System node 3541-2654) with a
 * pre-filled prompt and a pre-selected repository, ready for the user to send.
 */
export default function LandingView({ value, onChange, onSend }) {
  return (
    <div className="curie-landing curie-fade">
      {/* Three grid rows (1fr / auto / 1fr) so the chat box sits dead-centre;
          the title floats just above it, the pills just below. */}
      <h2 className="curie-landing__title">How can I help you today?</h2>

      <Composer
        value={value}
        onChange={onChange}
        onSend={onSend}
        showRepo
        autoFocus
        sendTip="Click me to explore the demo"
      />

      <div className="curie-actionbar">
        {ACTIONS.map((action) => (
          <button key={action.id} type="button" className="curie-action" tabIndex={-1}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
