/* eslint-disable react/prop-types */
import { ChevronDownIcon, SearchIcon, ChatBubbleIcon } from './icons'
import { WORKSPACE, USER, SIDEBAR_CHATS } from './curieContent'

function ChatItem({ chat }) {
  return (
    <button type="button" className="curie-chat-item" tabIndex={-1}>
      <span className="curie-chat-item__row">
        <span className="curie-chat-item__icon">
          <ChatBubbleIcon />
        </span>
        <span className="curie-chat-item__name">{chat.name}</span>
      </span>
      <span className="curie-chat-item__time">{chat.time}</span>
    </button>
  )
}

/**
 * Left navigation (Curie Design System "Nav 2.0", node 3541-2097): workspace
 * switcher, Chats/Tasks tabs with search, chat history and the profile row.
 * Purely presentational for the demo.
 */
export default function Sidebar({ activeTab = 'chats' }) {
  return (
    <aside className="curie-side" aria-label="Workspace navigation">
      <button type="button" className="curie-side__ws" tabIndex={-1}>
        {WORKSPACE}
        <ChevronDownIcon />
      </button>
      <hr className="curie-divider curie-divider--full" />

      <div className="curie-side__tabs-row">
        <div className="curie-side__tabs" role="tablist" aria-label="Chats and tasks">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chats'}
            className={`curie-tab${activeTab === 'chats' ? ' is-active' : ''}`}
            tabIndex={-1}
          >
            Chats
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tasks'}
            className={`curie-tab${activeTab === 'tasks' ? ' is-active' : ''}`}
            tabIndex={-1}
          >
            Tasks
          </button>
        </div>
        <button type="button" className="curie-side__search" aria-label="Search chats" tabIndex={-1}>
          <SearchIcon size={20} />
        </button>
      </div>

      <div className="curie-side__list">
        <hr className="curie-divider" />
        {SIDEBAR_CHATS.map((chat) => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </div>

      <div className="curie-side__profile">
        <span className="curie-avatar" aria-hidden="true">
          {USER.initials}
        </span>
        <span className="curie-side__name">{USER.name}</span>
      </div>
    </aside>
  )
}
