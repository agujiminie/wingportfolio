import { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import LandingView from './LandingView'
import ChatView from './ChatView'
import { EditIcon, PanelIcon, HelpIcon } from './icons'
import { useFitScale } from './useFitScale'
import { PROMPT } from './curieContent'
import './curie-demo.css'

const REPLY_DELAY = 620 // ms between the user message and Curie's reply

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
 * A fixed 1120×640 stage is scaled to fit the cutout window so the layout
 * stays 1:1 with Figma; text remains real DOM text for accessibility.
 */
export default function CurieDemo() {
  const { ref, scale } = useFitScale(1120)
  const [phase, setPhase] = useState('landing') // 'landing' | 'chat'
  const [prompt, setPrompt] = useState(PROMPT)
  const [reply, setReply] = useState('')
  const [showReply, setShowReply] = useState(false)
  const replyTimer = useRef(null)

  useEffect(() => () => clearTimeout(replyTimer.current), [])

  const handleSend = useCallback(() => {
    if (phase === 'chat' || !prompt.trim()) return
    setPhase('chat')
    if (prefersReducedMotion()) {
      setShowReply(true)
      return
    }
    replyTimer.current = setTimeout(() => setShowReply(true), REPLY_DELAY)
  }, [phase, prompt])

  const handleReset = useCallback(() => {
    clearTimeout(replyTimer.current)
    setPhase('landing')
    setShowReply(false)
    setReply('')
    setPrompt(PROMPT)
  }, [])

  return (
    <div
      className="curie-demo"
      ref={ref}
      style={{ '--curie-scale': scale }}
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

        <div className="curie-demo__app">
          <div className="curie-demo__bg" aria-hidden="true" />

          <header className="curie-nav">
            <div className="curie-nav__brand">
              <span className="curie-nav__logo">
                <PanelIcon size={20} />
                <span className="curie-nav__logo-text">
                  <b>Curie</b>Tech AI
                </span>
              </span>
              <button
                type="button"
                className="curie-nav__icon-btn"
                onClick={handleReset}
                aria-label="New chat"
              >
                <EditIcon />
              </button>
            </div>
            <button type="button" className="curie-nav__support" tabIndex={-1}>
              <HelpIcon />
              Support
            </button>
          </header>

          <div className="curie-body">
            <Sidebar activeTab="tasks" />

            <main className="curie-main">
              {phase === 'landing' ? (
                <LandingView value={prompt} onChange={setPrompt} onSend={handleSend} />
              ) : (
                <ChatView
                  prompt={prompt}
                  showReply={showReply}
                  replyValue={reply}
                  onReplyChange={setReply}
                  onSend={() => {}}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
