import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const STATUS_LABELS = {
  pending: 'Ausstehend',
  downloading: 'Lädt herunter',
  done: 'Fertig',
  error: 'Fehler',
  cancelled: 'Abgebrochen',
}

export default function QueuePage() {
  const { queue, removeFromQueue, clearDone } = useContext(AppContext)
  const [expandedLog, setExpandedLog] = useState(null)

  const isElectron = !!window.seal

  if (queue.length === 0) {
    return (
      <div>
        <div className="page-title">Warteschlange</div>
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="4" rx="1.5"/>
            <rect x="3" y="10" width="18" height="4" rx="1.5"/>
            <rect x="3" y="16" width="18" height="4" rx="1.5"/>
          </svg>
          <p>Keine Downloads in der Warteschlange</p>
        </div>
      </div>
    )
  }

  const hasDone = queue.some(i => i.status === 'done' || i.status === 'error')

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>Warteschlange</div>
        {hasDone && (
          <button className="btn btn-ghost btn-sm" onClick={clearDone}>
            Erledigte löschen
          </button>
        )}
      </div>

      {queue.map(item => (
        <QueueItem
          key={item.id}
          item={item}
          onRemove={() => removeFromQueue(item.id)}
          showLog={expandedLog === item.id}
          onToggleLog={() => setExpandedLog(expandedLog === item.id ? null : item.id)}
          isElectron={isElectron}
        />
      ))}
    </div>
  )
}

function QueueItem({ item, onRemove, showLog, onToggleLog, isElectron }) {
  const statusClass = {
    pending: 'status-pending',
    downloading: 'status-downloading',
    done: 'status-done',
    error: 'status-error',
    cancelled: 'status-cancelled',
  }[item.status] || 'status-pending'

  const barClass = item.status === 'done' ? 'done' : item.status === 'error' ? 'error' : ''

  return (
    <div className="queue-item">
      <div className="queue-header">
        {item.thumbnail
          ? <img className="queue-thumb" src={item.thumbnail} alt="" />
          : <div className="queue-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
        }
        <div className="queue-title" title={item.title}>{item.title}</div>
        <span className={`queue-status ${statusClass}`}>
          {item.status === 'downloading' && <span className="spinner" style={{ width: 10, height: 10, marginRight: 5 }} />}
          {STATUS_LABELS[item.status] || item.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div
          className={`progress-bar-fill ${barClass}`}
          style={{ width: `${item.percent || 0}%` }}
        />
      </div>

      <div className="progress-meta">
        <span>{item.status === 'downloading' ? `${(item.percent || 0).toFixed(1)}%` : item.status === 'done' ? '100%' : '0%'}</span>
        <span>{item.speed && `${item.speed}`} {item.eta && `ETA ${item.eta}`} {item.size && `· ${item.size}`}</span>
      </div>

      <div className="queue-actions">
        {item.status === 'done' && item.outputDir && isElectron && (
          <button className="btn btn-ghost btn-sm" onClick={() => window.seal.openFolder(item.outputDir)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18v13H3zM3 7l2-4h7l1 2h8"/></svg>
            Ordner öffnen
          </button>
        )}
        {item.log && (
          <button className="btn btn-ghost btn-sm" onClick={onToggleLog}>
            {showLog ? 'Log verbergen' : 'Log anzeigen'}
          </button>
        )}
        {(item.status === 'downloading' || item.status === 'pending') && (
          <button className="btn btn-danger btn-sm" onClick={onRemove}>
            Abbrechen
          </button>
        )}
        {(item.status === 'done' || item.status === 'error' || item.status === 'cancelled') && (
          <button className="btn btn-ghost btn-sm" onClick={onRemove}>
            Entfernen
          </button>
        )}
      </div>

      {showLog && item.log && (
        <div className="log-console">
          {item.log}
        </div>
      )}
    </div>
  )
}
