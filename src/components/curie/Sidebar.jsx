/* eslint-disable react/prop-types */
import { LoaderIcon, ChevronDownIcon } from './icons'
import {
  WORKSPACE,
  USER,
  SIDEBAR_TASKS,
  SIDEBAR_DATE,
  SIDEBAR_TASKS_OLDER,
} from './curieContent'

function TaskItem({ task }) {
  return (
    <button type="button" className="curie-task" tabIndex={-1}>
      <span className="curie-task__icon">
        <LoaderIcon />
      </span>
      <span className="curie-task__body">
        <span className="curie-task__meta">
          <span className="curie-task__id">{task.id}</span>
          <span className="curie-task__time">{task.time}</span>
        </span>
        <span className="curie-task__name">{task.name}</span>
      </span>
    </button>
  )
}

/**
 * Left navigation (Figma "nav 2.0"): workspace switcher, Chats/Tasks tabs,
 * task history and the profile row. Purely presentational for the demo.
 */
export default function Sidebar({ activeTab = 'tasks' }) {
  return (
    <aside className="curie-side" aria-label="Workspace navigation">
      <button type="button" className="curie-side__ws" tabIndex={-1}>
        {WORKSPACE}
        <ChevronDownIcon />
      </button>
      <hr className="curie-divider" />

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
      <hr className="curie-divider" />

      <div className="curie-side__list">
        {SIDEBAR_TASKS.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        <p className="curie-side__date">{SIDEBAR_DATE}</p>
        {SIDEBAR_TASKS_OLDER.map((task) => (
          <TaskItem key={task.id} task={task} />
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
