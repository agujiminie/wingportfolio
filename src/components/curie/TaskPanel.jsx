/* eslint-disable react/prop-types */
import { DownloadIcon, DocumentIcon, FolderIcon, CloseIcon } from './icons'
import { TASK_DETAIL, TASK_PANEL_DOWNLOAD } from './curieContent'

function FileRow({ name, nested = false }) {
  return (
    <button type="button" className={`curie-panel__file${nested ? ' is-nested' : ''}`} tabIndex={-1}>
      <span className="curie-panel__file-icon" aria-hidden="true">
        <DocumentIcon size={18} />
      </span>
      <span className="curie-panel__file-name">{name}</span>
    </button>
  )
}

function Section({ section }) {
  return (
    <section className="curie-panel__section">
      <div className="curie-panel__section-head">
        <div className="curie-panel__section-titles">
          <span className="curie-panel__section-title">{section.title}</span>
          <span className="curie-panel__section-sub">{section.subtitle}</span>
        </div>
        <button
          type="button"
          className="curie-panel__icon-btn"
          aria-label={`Download ${section.title}`}
          tabIndex={-1}
        >
          <DownloadIcon size={16} />
        </button>
      </div>

      <div className="curie-panel__rows">
        {section.files?.map((file) => (
          <FileRow key={file} name={file} />
        ))}
        {section.tree?.map((node) => (
          <div key={node.name} className="curie-panel__tree-group">
            <button type="button" className="curie-panel__folder" tabIndex={-1}>
              <span className="curie-panel__file-icon" aria-hidden="true">
                <FolderIcon size={18} />
              </span>
              <span className="curie-panel__file-name">{node.name}</span>
            </button>
            {node.children?.map((child) => (
              <FileRow key={child} name={child} nested />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Task detail side panel (Figma workflow-automation, node 1045-32850). Opens
 * split-screen when a task card is clicked: a floating white card with a
 * header (task id + title, Download All, close) over a scrollable body of
 * Summary + All Flows sections.
 */
export default function TaskPanel({ task, onClose }) {
  return (
    <aside className="curie-panel curie-enter" aria-label={`Task ${task.id} details`}>
      <header className="curie-panel__head">
        <div className="curie-panel__head-titles">
          <span className="curie-panel__id">{task.id}</span>
          <h3 className="curie-panel__title">Task: {task.title}</h3>
        </div>
        <div className="curie-panel__head-actions">
          <button type="button" className="curie-panel__download-all" tabIndex={-1}>
            <DownloadIcon size={16} />
            {TASK_PANEL_DOWNLOAD}
          </button>
          <button
            type="button"
            className="curie-panel__close"
            onClick={onClose}
            aria-label="Close task panel"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </header>

      <div className="curie-panel__body">
        {TASK_DETAIL.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </aside>
  )
}
