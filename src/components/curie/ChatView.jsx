/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from 'react'
import Composer from './Composer'
import {
  CaretRightIcon,
  ChevronDownIcon,
  CurieLogo,
  ListIcon,
  PanelIcon,
  LoaderIcon,
  CheckCircleIcon,
  EnterArrowIcon,
} from './icons'
import {
  WORKED_LABEL,
  CHAT_INTRO,
  CHAT_FOLLOWUP,
  CHAT_ACK,
  TASK_CARDS,
  TASK_PROGRESS,
  TASK_PANEL_TITLE,
} from './curieContent'

function WorkedHeader() {
  return (
    <button type="button" className="curie-worked" tabIndex={-1}>
      {WORKED_LABEL}
      <CaretRightIcon />
    </button>
  )
}

const PROGRESS_ICONS = {
  inprogress: LoaderIcon,
  completed: CheckCircleIcon,
  input: EnterArrowIcon,
}

/**
 * Task card (Task Flow User Journey Figma — nodes 1-39746 / 1-39789 / 5-3582,
 * hover 5-4158 / 5-4175 / 5-4191): translucent white glass card that turns
 * solid + shadowed on hover. Status reads through the icon plate (spinner /
 * check / enter-arrow) and the mono footer line; the caret sits in the header.
 */
function TaskCard({ task, progress, onOpen }) {
  const meta = TASK_PROGRESS[progress]
  const status = progress === 'inprogress' ? task.statusActive : meta.status
  const StatusIcon = PROGRESS_ICONS[progress]
  return (
    <div
      className={`curie-taskcard curie-taskcard--${progress}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(task)
        }
      }}
    >
      <div className="curie-taskcard__head">
        <div className="curie-taskcard__left">
          <span
            className={`curie-taskcard__iconwrap curie-taskcard__iconwrap--${progress}`}
            aria-hidden="true"
          >
            <StatusIcon size={18} />
          </span>
          <span className="curie-taskcard__info">
            <span className="curie-taskcard__id">{task.id}</span>
            <span className="curie-taskcard__title">{task.title}</span>
          </span>
        </div>
        <span className="curie-taskcard__expand" aria-hidden="true">
          <CaretRightIcon />
        </span>
      </div>
      <hr className="curie-divider" />
      <div className="curie-taskcard__foot">
        <span className="curie-taskcard__status">{status}</span>
      </div>
    </div>
  )
}

/**
 * Screen 2 — the chat flow (Figma "Phase 2 - Single Agent UX", node 386-17414):
 * the sent prompt, Curie's generation plan under a "Worked for 31s" header, a
 * follow-up user message, and the initiated task card. `stage` (0–3) gates the
 * turns so they animate in sequence after send.
 */
// How long the scrollbar stays visible after scrolling stops (macOS-like fade)
const SCROLLBAR_LINGER = 900

export default function ChatView({
  prompt,
  stage,
  replyValue,
  onReplyChange,
  onSend,
  showBrand = false,
  onPanelToggle,
  onOpenTask,
}) {
  const logRef = useRef(null)
  const [showTasks, setShowTasks] = useState(false)
  // Tasks run in progress until the final stage, then settle into their
  // Figma end states (completed / input needed).
  const progressOf = (task) => (stage >= 4 ? task.finalProgress : 'inprogress')
  const [scrolling, setScrolling] = useState(false)
  const scrollTimer = useRef(null)

  // Scroll just enough to reveal the newest beat (not a hard pin-to-bottom),
  // so the user's own message stays on screen while the reply streams in.
  // Rect math instead of scrollIntoView — the latter would also scroll the
  // HOST page, hijacking the portfolio's scroll position.
  const revealLatest = useCallback(() => {
    const log = logRef.current
    const last = log?.querySelector('.curie-chat__col')?.lastElementChild
    if (!log || !last) return
    const logRect = log.getBoundingClientRect()
    // Rects are in screen px but scrollTop is in stage px — the stage is
    // CSS-scaled, so convert via the log's own rendered/layout width ratio.
    const scale = logRect.width / log.offsetWidth || 1
    const delta = last.getBoundingClientRect().bottom - logRect.bottom
    if (delta > 0) log.scrollTop += delta / scale
  }, [])

  useEffect(() => {
    revealLatest()
  }, [stage, revealLatest])

  // Re-reveal through layout reflows (split panel opening, sidebar toggling)
  // — otherwise the log keeps a stale offset and clips the newest card.
  useEffect(() => {
    const log = logRef.current
    if (!log || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(revealLatest)
    observer.observe(log)
    return () => observer.disconnect()
  }, [revealLatest])

  useEffect(() => () => clearTimeout(scrollTimer.current), [])

  const handleLogScroll = () => {
    setScrolling(true)
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => setScrolling(false), SCROLLBAR_LINGER)
  }

  return (
    <div className="curie-chat">
      <header className="curie-chat-header curie-fade">
        {/* Carries the branding the hidden sidebar normally shows — panel
            toggle + wordmark (Figma node 1045-32864). Always mounted so it can
            crossfade with the global nav; hidden when the sidebar is expanded
            and no panel is open. */}
        <div className={`curie-chat-header__brand${showBrand ? '' : ' is-hidden'}`}>
          <button
            type="button"
            className="curie-chat-header__toggle"
            onClick={onPanelToggle}
            aria-label="Toggle sidebar"
            tabIndex={showBrand ? 0 : -1}
          >
            <PanelIcon size={20} />
          </button>
          <CurieLogo className="curie-brand-logo" />
        </div>
        <button
          type="button"
          className="curie-chat-header__btn"
          aria-label={TASK_PANEL_TITLE}
          data-tip={TASK_PANEL_TITLE}
          aria-expanded={showTasks}
          onClick={() => setShowTasks((open) => !open)}
        >
          <ListIcon size={20} />
        </button>
      </header>

      {showTasks && (
        <div className="curie-taskpanel curie-enter" role="region" aria-label={TASK_PANEL_TITLE}>
          <button
            type="button"
            className="curie-taskpanel__head"
            onClick={() => setShowTasks(false)}
          >
            {TASK_PANEL_TITLE}
            <ChevronDownIcon />
          </button>
          <div className="curie-taskpanel__list">
            {TASK_CARDS.map((task) => (
              <button key={task.id} type="button" className="curie-taskpanel__item" tabIndex={-1}>
                <span className="curie-taskpanel__id">{task.id}</span>
                <span className="curie-taskpanel__title">{task.title}</span>
                <span className={`curie-tag curie-tag--${progressOf(task)}`}>
                  {TASK_PROGRESS[progressOf(task)].panelTag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`curie-chat__log${scrolling ? ' is-scrolling' : ''}`}
        ref={logRef}
        onScroll={handleLogScroll}
      >
        <div className="curie-chat__col">
          <div className="curie-msg--user curie-enter">{prompt}</div>

          {stage >= 1 && (
            <div className="curie-turn curie-enter" aria-live="polite">
              <WorkedHeader />
              <div className="curie-turn__body">
                <p>{CHAT_INTRO.lead}</p>
                <ul>
                  {CHAT_INTRO.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {stage >= 2 && <div className="curie-msg--user curie-enter">{CHAT_FOLLOWUP}</div>}

          {stage >= 3 && (
            <div className="curie-turn curie-enter" aria-live="polite">
              <WorkedHeader />
              <div className="curie-turn__body">
                <p>{CHAT_ACK}</p>
              </div>
              {TASK_CARDS.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  progress={progressOf(task)}
                  onOpen={onOpenTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="curie-chat__composer">
        <Composer
          value={replyValue}
          onChange={onReplyChange}
          onSend={onSend}
          showRepo={false}
          compact
          placeholder="Describe your task"
        />
      </div>
    </div>
  )
}
