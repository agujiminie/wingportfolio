import { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import LandingView from './LandingView'
import ChatView from './ChatView'
import TaskPanel from './TaskPanel'
import { CurieLogo, NewChatIcon, PanelIcon, HelpIcon, RefreshIcon } from './icons'
import { useFitScale } from './useFitScale'
import { PROMPT } from './curieContent'
import './curie-demo.css'

// ms after send when each chat beat lands
// (plan → follow-up → task cards → tasks settle into final states)
const STAGE_DELAYS = [600, 1500, 2400, 5200]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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

  // Opening a task slides the panel in and collapses the sidebar by default.
  const openTask = useCallback((task) => {
    setSelectedTask(task)
    setPanelOpen(true)
    setSidebarCollapsed(true)
  }, [])
  // Close slides the panel out and restores the sidebar (selectedTask lingers
  // so its content stays rendered through the exit transition).
  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setSidebarCollapsed(false)
  }, [])
  // Toggle the sidebar independently — lets the user slide the nav back in
  // while the chat + panel stay open (a valid 3-column state).
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), [])

  const clearStageTimers = () => {
    stageTimers.current.forEach(clearTimeout)
    stageTimers.current = []
  }

  useEffect(() => clearStageTimers, [])

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
    setPhase('landing')
    setStage(0)
    setReply('')
    setPrompt(PROMPT)
    setSelectedTask(null)
    setPanelOpen(false)
    setSidebarCollapsed(false)
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

      <div
        className="curie-demo"
        ref={ref}
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
            {phase === 'landing' && (
              <button type="button" className="curie-nav__support" tabIndex={-1}>
                <HelpIcon />
                Support
              </button>
            )}
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
      </div>
    </>
  )
}
