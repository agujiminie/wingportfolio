/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { CopyIcon, CheckIcon, DownloadIcon, CloseIcon } from './icons'

const COPY_RESET_DELAY = 1500

function Line({ line }) {
  const marker = line.type === 'add' ? '+' : line.type === 'del' ? '-' : ''
  return (
    <div className={`curie-diff__line curie-diff__line--${line.type}`}>
      <span className="curie-diff__gutter" aria-hidden="true">
        <span className="curie-diff__num">{line.old ?? ''}</span>
        <span className="curie-diff__num">{line.new ?? ''}</span>
        <span className="curie-diff__marker">{marker}</span>
      </span>
      <code className="curie-diff__code">
        {line.segments.map((seg, i) => (
          <span key={i} className={seg.k ? `curie-diff__tok--${seg.k}` : undefined}>
            {seg.t}
          </span>
        ))}
      </code>
    </div>
  )
}

/**
 * Code-diff task detail, laid out as a code canvas in the Claude Code idiom:
 * ONE slim toolbar line (task id · filename · language · diff stats on the
 * left, icon-only copy / download / close on the right) sitting directly on
 * top of the scrollable code — no stacked headers. Set in Curie's own tokens
 * and Geist Mono; diff +/- coloring uses the pale status family.
 *
 * @param {object} diff - fileName / language / added / removed / lines
 * @param {string} [taskId] - muted mono prefix tying the canvas to its task card
 * @param {() => void} [onClose] - renders the close control when provided
 */
export default function CodeDiffView({ diff, taskId, onClose }) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef(null)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleCopy = async () => {
    const text = diff.lines
      .filter((line) => line.type !== 'del')
      .map((line) => line.segments.map((seg) => seg.t).join(''))
      .join('\n')
    try {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), COPY_RESET_DELAY)
    } catch {
      // Clipboard permission denied or unavailable — no destructive fallback needed.
    }
  }

  return (
    <section className="curie-diff">
      <header className="curie-diff__head">
        {taskId && <span className="curie-diff__task-id">{taskId}</span>}
        <span className="curie-diff__filename">{diff.fileName}</span>
        <span className="curie-diff__lang">{diff.language}</span>
        <span className="curie-diff__stats">
          <span className="curie-diff__stat curie-diff__stat--add">+{diff.added}</span>
          <span className="curie-diff__stat curie-diff__stat--del">-{diff.removed}</span>
        </span>
        <div className="curie-diff__actions">
          <button
            type="button"
            className="curie-diff__tool"
            onClick={handleCopy}
            aria-label="Copy updated file"
            title={copied ? 'Copied' : 'Copy'}
          >
            {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
          </button>
          <button
            type="button"
            className="curie-diff__tool"
            aria-label="Download file"
            title="Download"
            tabIndex={-1}
          >
            <DownloadIcon size={15} />
          </button>
          {onClose && (
            <button
              type="button"
              className="curie-diff__tool"
              onClick={onClose}
              aria-label="Close task panel"
              title="Close"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      </header>
      <div className="curie-diff__body">
        {diff.lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
      </div>
    </section>
  )
}
