/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
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
 * @param {boolean} compact - auto-height single-row variant (chat view)
 * @param {boolean} autoFocus - focus the input once the demo scrolls into
 *   view (IntersectionObserver + preventScroll, so the embed never hijacks
 *   the host page's keyboard or scroll position at load); the caret lands
 *   at the END of the pre-filled prompt, blinking and ready to send
 * @param {string} [sendTip] - floating tooltip above the send button
 *   nudging visitors to click it (landing only)
 */
export default function Composer({
  value,
  onChange,
  onSend,
  showRepo = true,
  placeholder = 'Ask Curie to build, test, or migrate a flow…',
  compact = false,
  autoFocus = false,
  sendTip,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    const el = inputRef.current
    if (!autoFocus || !el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const end = el.value.length
          el.setSelectionRange(end, end) // caret blinks after the prompt
          el.focus({ preventScroll: true })
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [autoFocus])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      onSend?.()
    }
  }

  return (
    <div className={`curie-composer${compact ? ' curie-composer--compact' : ''}`}>
      <label className="sr-only" htmlFor="curie-prompt">
        Message Curie
      </label>
      <textarea
        id="curie-prompt"
        ref={inputRef}
        className="curie-composer__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={compact ? 1 : 3}
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
          <button type="button" className="curie-chip curie-chip--ghost" tabIndex={-1}>
            <span className="curie-chip__label">Verify</span>
            <ChevronDownIcon />
          </button>
          <span className="curie-send-wrap">
            {sendTip && <span className="curie-send-tip">{sendTip}</span>}
            <button
              type="button"
              className={`curie-send${value?.trim() ? '' : ' curie-send--disabled'}`}
              onClick={onSend}
              aria-label="Send message"
              aria-disabled={!value?.trim()}
            >
              <ArrowUpIcon />
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
