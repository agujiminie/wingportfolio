import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import LandingView from './LandingView'
import ChatView from './ChatView'
import TaskPanel from './TaskPanel'
import { CurieLogo, NewChatIcon, PanelIcon, RefreshIcon } from './icons'
import { useFitScale } from './useFitScale'
import { DEAD_CONTROL_TIP, PROMPT, TASK_CARDS } from './curieContent'
import './curie-demo.css'

// ms after send when each chat beat lands
// (plan → follow-up → task cards → tasks settle into final states)
const STAGE_DELAYS = [600, 1500, 2400, 5200]
// The final stage, when both task cards have settled into completed/input
// states — the moment the demo auto-opens the first task's detail panel.
const TASKS_SETTLED_STAGE = STAGE_DELAYS.length

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Controls that actually do something in the demo. Every OTHER button-like
// element is decorative — clicking one pops the "Demo only" tooltip instead
// of silently doing nothing (see handleDeadClick).
const LIVE_CONTROLS = [
  '.curie-send',
  '.curie-nav__panel-toggle',
  '.curie-nav__icon-btn', // new chat (resets the demo)
  '.curie-chat-header__toggle',
  '.curie-chat-header__btn', // tasks-in-this-chat popover
  '.curie-taskpanel__head', // popover collapse
  '.curie-taskcard', // opens the task detail panel
  '[aria-label="Close task panel"]',
  '[aria-label="Copy updated file"]',
].join(', ')

// How long the dead-control tooltip stays up — matches the CSS animation
// (curie-dead-tip-pop) so it finishes fading right as it unmounts.
const DEAD_TIP_DURATION = 2200

/**
 * Interactive CurieTech AI demo embedded in the Work tab.
 *
 *  • Screen 1 (landing) — pre-filled prompt + pre-selected repo; press send…
 *  • Screen 2 (chat)    — the prompt appears as a user message, then Curie
 *    replies with two generated task cards.
 *
 * The app interface (below the macOS title bar) is locked to 16:9:
 * useFitScale picks the largest 16:9 app box + 32px title bar that fits the
 * cutout frame, reflows the stage at a locked text scale (Curie Design System
 * node 3541-2654 components stay 1:1 with Figma), and text remains real DOM
 * text for accessibility.
 */
export default function CurieDemo() {
  const { ref, scale, width, height, stageWidth, stageHeight } = useFitScale()
  const [phase, setPhase] = useState('landing') // 'landing' | 'chat'
  const [prompt, setPrompt] = useState(PROMPT)
  const [reply, setReply] = useState('')
  const [stage, setStage] = useState(0) // chat turns revealed so far (0–3)
  const [selectedTask, setSelectedTask] = useState(null) // last task shown
  const [panelOpen, setPanelOpen] = useState(false) // right panel visible
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Dead-control tooltip: position (unscaled, relative to the demo window)
  // + a serial so re-clicks remount the element and replay its animation.
  const [deadTip, setDeadTip] = useState(null)
  const deadTipRef = useRef(null)
  const deadTipTimer = useRef(null)
  const deadTipSerial = useRef(0)
  const stageTimers = useRef([])

  // Branding always sits at the same spot atop the nav bar whenever the
  // sidebar is open — even in split screen when the user re-opens it
  // manually. It moves into the chat header only while the sidebar is
  // hidden.
  const showChatBrand = sidebarCollapsed
  // The landing has no chat header to carry the brand, so its nav stays put
  // in collapsed mode too (panel button + logo, Figma 1067-5802); only the
  // chat phase crossfades the brand into the chat header.
  const navHidden = phase === 'chat' && sidebarCollapsed

  // Opening a task slides the panel in. The sidebar stays exactly as the user
  // left it — it only collapses when they press the panel toggle themselves.
  const openTask = useCallback((task) => {
    setSelectedTask(task)
    setPanelOpen(true)
  }, [])
  // Close slides the panel out (selectedTask lingers so its content stays
  // rendered through the exit transition); the sidebar is left untouched.
  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])
  // Toggle the sidebar independently — lets the user slide the nav back in
  // while the chat + panel stay open (a valid 3-column state).
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), [])

  const clearStageTimers = () => {
    stageTimers.current.forEach(clearTimeout)
    stageTimers.current = []
  }

  useEffect(() => clearStageTimers, [])
  useEffect(() => () => clearTimeout(deadTipTimer.current), [])

  // Delegated click-catcher for the whole demo window: a click on any
  // button-like element that is NOT in the LIVE_CONTROLS whitelist pops a
  // transient "Demo only" tooltip above it, so decorative controls read as
  // intentional demo scope rather than broken buttons. Positioned against
  // the unscaled .curie-demo wrapper (the stage transform cancels out of
  // the viewport-rect delta), so no scale math is needed.
  const handleDeadClick = useCallback(
    (event) => {
      const control = event.target.closest('button, .curie-chip')
      if (!control || control.closest(LIVE_CONTROLS)) return
      const host = ref.current
      if (!host) return
      const hostRect = host.getBoundingClientRect()
      const rect = control.getBoundingClientRect()
      deadTipSerial.current += 1
      setDeadTip({
        x: rect.left + rect.width / 2 - hostRect.left,
        y: rect.top - hostRect.top,
        key: deadTipSerial.current,
      })
      clearTimeout(deadTipTimer.current)
      deadTipTimer.current = setTimeout(() => setDeadTip(null), DEAD_TIP_DURATION)
    },
    [ref],
  )

  // Keep the pill inside the window's overflow:hidden bounds — clicks near
  // the left/right edges (sidebar rows, send-side chips) would otherwise
  // clip it. Width is only known after render, hence the imperative nudge.
  useLayoutEffect(() => {
    const el = deadTipRef.current
    const host = ref.current
    if (!el || !host || !deadTip) return
    const half = el.offsetWidth / 2
    const clamped = Math.min(Math.max(deadTip.x, half + 10), host.clientWidth - half - 10)
    if (clamped !== deadTip.x) el.style.left = `${clamped}px`
  }, [deadTip, ref])

  // Once both tasks settle, walk the user straight into the first task's
  // detail panel — unless they already opened one themselves mid-flight,
  // in which case their choice wins.
  useEffect(() => {
    if (stage === TASKS_SETTLED_STAGE && !selectedTask) {
      openTask(TASK_CARDS[0])
    }
  }, [stage, selectedTask, openTask])

  const handleSend = useCallback(() => {
    if (phase === 'chat' || !prompt.trim()) return
    setPhase('chat')
    if (prefersReducedMotion()) {
      setStage(STAGE_DELAYS.length)
      return
    }
    stageTimers.current = STAGE_DELAYS.map((delay, i) =>
      setTimeout(() => setStage(i + 1), delay),
    )
  }, [phase, prompt])

  const handleReset = useCallback(() => {
    clearStageTimers()
    clearTimeout(deadTipTimer.current)
    setPhase('landing')
    setStage(0)
    setReply('')
    setPrompt(PROMPT)
    setSelectedTask(null)
    setPanelOpen(false)
    setSidebarCollapsed(false)
    setDeadTip(null)
  }, [])

  return (
    <>
      <button
        type="button"
        className="curie-restart"
        onClick={handleReset}
        aria-label="Restart demo"
        title="Restart demo"
      >
        <RefreshIcon size={16} />
      </button>

      {/* The delegated onClick only intercepts clicks that already landed on
          decorative <button>s inside — it adds no keyboard-reachable
          behavior of its own, so the static wrapper stays a plain div. */}
      <div
        className="curie-demo"
        ref={ref}
        onClick={handleDeadClick}
        style={{
          '--curie-scale': scale,
          '--stage-w': `${stageWidth}px`,
          '--stage-h': `${stageHeight}px`,
          ...(width ? { width: `${width}px`, height: `${height}px` } : {}),
        }}
        role="group"
        aria-label="Interactive CurieTech AI product demo"
      >
      <div className="curie-demo__stage">
        <div className="curie-titlebar">
          <span className="curie-titlebar__lights" aria-hidden="true">
            <i className="curie-titlebar__light curie-titlebar__light--close" />
            <i className="curie-titlebar__light curie-titlebar__light--min" />
            <i className="curie-titlebar__light curie-titlebar__light--max" />
          </span>
          <span className="curie-titlebar__title">CurieTech AI</span>
        </div>

        <div className={`curie-demo__app${panelOpen ? ' curie-demo__app--split' : ''}`}>
          <div className="curie-demo__bg" aria-hidden="true" />

          <header className={`curie-nav${navHidden ? ' curie-nav--hidden' : ''}`}>
            <div className="curie-nav__brand">
              <button
                type="button"
                className="curie-nav__panel-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                aria-expanded={!sidebarCollapsed}
                tabIndex={navHidden ? -1 : 0}
              >
                <PanelIcon size={20} />
              </button>
              <CurieLogo className="curie-brand-logo" />
              {/* New-chat action belongs to the expanded nav only — the
                  collapsed lockup is just panel button + logo (Figma
                  1067-5802). */}
              {!sidebarCollapsed && (
                <button
                  type="button"
                  className="curie-nav__icon-btn curie-fade"
                  onClick={handleReset}
                  aria-label="New chat"
                  tabIndex={navHidden ? -1 : 0}
                >
                  <NewChatIcon size={24} />
                </button>
              )}
            </div>
          </header>

          <div
            className={`curie-body${sidebarCollapsed ? ' curie-body--collapsed' : ''}${
              panelOpen ? ' curie-body--split' : ''
            }`}
          >
            <div
              className={`curie-side-slot${sidebarCollapsed ? ' is-collapsed' : ''}`}
              aria-hidden={sidebarCollapsed}
            >
              <Sidebar activeTab="chats" />
            </div>

            <main className={`curie-main${phase === 'chat' ? ' curie-main--chat' : ''}`}>
              {phase === 'landing' ? (
                <LandingView value={prompt} onChange={setPrompt} onSend={handleSend} />
              ) : (
                <ChatView
                  prompt={prompt}
                  stage={stage}
                  replyValue={reply}
                  onReplyChange={setReply}
                  onSend={() => {}}
                  showBrand={showChatBrand}
                  onPanelToggle={toggleSidebar}
                  onOpenTask={openTask}
                />
              )}
            </main>

            <div
              className={`curie-panel-slot${panelOpen ? ' is-open' : ''}`}
              aria-hidden={!panelOpen}
            >
              {selectedTask && <TaskPanel task={selectedTask} onClose={closePanel} />}
            </div>
          </div>
        </div>
      </div>

      {/* Transient nudge over a clicked decorative control (see
          handleDeadClick). key remounts it per click so the pop animation
          replays; the timeout that clears it matches the animation length. */}
      {deadTip && (
        <span
          key={deadTip.key}
          ref={deadTipRef}
          className="curie-dead-tip"
          style={{ left: deadTip.x, top: deadTip.y }}
          role="status"
        >
          {DEAD_CONTROL_TIP}
        </span>
      )}
      </div>
    </>
  )
}
