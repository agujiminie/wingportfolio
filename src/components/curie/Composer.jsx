/* eslint-disable react/prop-types */
import { PlusIcon, CloseIcon, ChevronDownIcon, ArrowUpIcon } from './icons'
import { REPOS } from './curieContent'

/**
 * The chat box (Figma "Chat Box"): a textarea plus a control bar of chips
 * (attach, repository multi-select, Agent, Verify) and the send button.
 *
 * @param {string} value - controlled textarea value
 * @param {(v: string) => void} onChange
 * @param {() => void} onSend - fired by the send button or ⌘/Ctrl+Enter
 * @param {boolean} showRepo - render the repository chip (landing only)
 * @param {string} placeholder
 * @param {boolean} bare - lighter border variant used in the chat view
 */
export default function Composer({
  value,
  onChange,
  onSend,
  showRepo = true,
  placeholder = 'Ask Curie to build, test, or migrate a flow…',
  bare = false,
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      onSend?.()
    }
  }

  return (
    <div className={`curie-composer${bare ? ' curie-composer--bare' : ''}`}>
      <label className="sr-only" htmlFor="curie-prompt">
        Message Curie
      </label>
      <textarea
        id="curie-prompt"
        className="curie-composer__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />

      <div className="curie-composer__bar">
        <div className="curie-composer__group">
          <button type="button" className="curie-attach" aria-label="Attach files" tabIndex={-1}>
            <PlusIcon />
          </button>

          {showRepo && (
            <span className="curie-chip curie-chip--repo">
              <span className="curie-chip__label" title={REPOS}>
                {REPOS}
              </span>
              <span className="curie-chip__x" aria-hidden="true">
                <CloseIcon size={14} />
              </span>
            </span>
          )}

          <button type="button" className="curie-chip" tabIndex={-1}>
            <span className="curie-chip__label">Agent</span>
            <ChevronDownIcon />
          </button>
        </div>

        <div className="curie-composer__group curie-composer__group--right">
          <button type="button" className="curie-chip" tabIndex={-1}>
            <span className="curie-chip__label">Verify</span>
            <ChevronDownIcon />
          </button>
          <button type="button" className="curie-send" onClick={onSend} aria-label="Send message">
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
