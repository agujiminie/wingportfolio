/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { CopyIcon, CheckIcon } from './icons'

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
 * Code-diff task detail (layout referenced from Figma "Demo - Agentic UX",
 * node 38-38606 — a rounded code-viewer card with line numbers and a copy
 * action). Recolored to Curie's own tokens and set in Geist Mono instead of
 * that file's Source Code Pro, so it stays 1:1 with the rest of the demo;
 * diff +/- coloring is new (the reference is a plain viewer, not a diff).
 */
export default function CodeDiffView({ diff }) {
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
        <span className="curie-diff__filename">{diff.fileName}</span>
        <span className="curie-diff__lang">{diff.language}</span>
        <span className="curie-diff__stats">
          <span className="curie-diff__stat curie-diff__stat--add">+{diff.added}</span>
          <span className="curie-diff__stat curie-diff__stat--del">-{diff.removed}</span>
        </span>
        <button
          type="button"
          className="curie-diff__copy"
          onClick={handleCopy}
          aria-label="Copy updated file"
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <div className="curie-diff__body">
        {diff.lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
      </div>
    </section>
  )
}
