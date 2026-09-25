/* eslint-disable react/prop-types */
import { useEffect, useId, useState } from 'react'
import { HEADLINES } from './frameContent'

const STORAGE_KEY = 'hero-headline-scale-v1'
const MIN_SCALE = 25
const MAX_SCALE = 200

function readScale() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(value) && value >= MIN_SCALE && value <= MAX_SCALE) return value
  } catch { /* The control also works when storage is unavailable. */ }
  return 100
}

export default function HeroHeadline({ activeId, scrolled }) {
  const [scale, setScale] = useState(readScale)
  const [input, setInput] = useState(() => String(scale))
  const inputId = useId()

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(scale)) } catch { /* Optional persistence. */ }
  }, [scale])

  const changeScale = event => {
    const value = event.target.value
    setInput(value)
    const next = Number(value)
    if (value.trim() && Number.isFinite(next) && next >= MIN_SCALE && next <= MAX_SCALE) setScale(next)
  }

  const commitScale = () => {
    const value = Number(input)
    const next = input.trim() && Number.isFinite(value)
      ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, value)) : scale
    setScale(next)
    setInput(String(next))
  }

  return (
    <>
      <div className="frame__panel frame__headline-panel" style={{ '--headline-scale': scale / 100 }}>
        <h1 className="frame__headline" key={activeId}>
          {(HEADLINES[activeId] ?? HEADLINES.work).map((line, i) => (
            <span key={i} className="frame__headline-line">{line}</span>
          ))}
        </h1>
      </div>
      <div className="frame__panel frame__headline-scale" hidden={scrolled} role="group" aria-label="Headline size controls">
        <label htmlFor={inputId}>Text Scale</label>
        <input
          id={inputId} type="number" inputMode="decimal" aria-label="Headline scale percentage"
          min={MIN_SCALE} max={MAX_SCALE} step="any" value={input}
          onChange={changeScale} onBlur={commitScale}
          onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
        />
        <span aria-hidden="true">%</span>
        <button type="button" aria-label="Reset text scale" onClick={() => { setScale(100); setInput('100') }}>Reset</button>
      </div>
    </>
  )
}
