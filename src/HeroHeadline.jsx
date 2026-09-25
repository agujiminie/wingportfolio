/* eslint-disable react/prop-types */
import { HEADLINES } from './frameContent'

export default function HeroHeadline({ activeId }) {
  return (
    <div className="frame__panel frame__headline-panel">
      <h1 className="frame__headline" key={activeId}>
        {(HEADLINES[activeId] ?? HEADLINES.work).map((line, i) => (
          <span key={i} className="frame__headline-line">{line}</span>
        ))}
      </h1>
    </div>
  )
}
