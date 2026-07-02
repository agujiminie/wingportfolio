/* eslint-disable react/prop-types */
import Composer from './Composer'
import { LoaderIcon, CurieMark } from './icons'
import { REPLY, GENERATED_TASKS } from './curieContent'

function GeneratedCard({ task }) {
  return (
    <button type="button" className="curie-card" tabIndex={-1}>
      <span className="curie-card__icon">
        <LoaderIcon size={18} />
      </span>
      <span className="curie-card__body">
        <span className="curie-card__head">
          <span className="curie-card__id">{task.id}</span>
          <span className={`curie-card__status curie-card__status--${task.variant}`}>
            {task.status}
          </span>
          <span className="curie-card__time">{task.time}</span>
        </span>
        <span className="curie-card__name">{task.name}</span>
        <span className="curie-card__sub">{task.sub}</span>
      </span>
    </button>
  )
}

/**
 * Screen 2 — the chat flow after the prompt was sent: the user's message,
 * Curie's reply, and the two task cards it generated. `showReply` gates the
 * assistant block so it can animate in a beat after the user message.
 */
export default function ChatView({ prompt, showReply, replyValue, onReplyChange, onSend }) {
  return (
    <div className="curie-chat">
      <div className="curie-chat__log">
        <div className="curie-msg--user curie-enter">{prompt}</div>

        {showReply && (
          <div className="curie-msg--assistant curie-enter" aria-live="polite">
            <span className="curie-msg__avatar" aria-hidden="true">
              <CurieMark size={16} />
            </span>
            <div className="curie-msg__content">
              <p className="curie-msg__text">{REPLY}</p>
              <div className="curie-msg__cards">
                {GENERATED_TASKS.map((task) => (
                  <GeneratedCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="curie-chat__composer">
        <Composer
          value={replyValue}
          onChange={onReplyChange}
          onSend={onSend}
          showRepo={false}
          bare
          placeholder="Reply to Curie…"
        />
      </div>
    </div>
  )
}
