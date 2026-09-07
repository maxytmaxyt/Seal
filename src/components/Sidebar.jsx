import React, { useContext } from 'react'
import { AppContext } from '../App'

const icons = {
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 3v13M7 11l5 5 5-5M3 18h18"/>
    </svg>
  ),
  queue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="4" rx="1.5"/>
      <rect x="3" y="10" width="18" height="4" rx="1.5"/>
      <rect x="3" y="16" width="18" height="4" rx="1.5"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
}

const NAV = [
  { id: 'download', label: 'Herunterladen' },
  { id: 'queue', label: 'Warteschlange' },
]

export default function Sidebar({ page, setPage, queueCount }) {
  const { ytdlpVersion } = useContext(AppContext)

  return (
    <nav className="sidebar">
      {NAV.map(item => (
        <div
          key={item.id}
          className={`nav-item${page === item.id ? ' active' : ''}`}
          onClick={() => setPage(item.id)}
        >
          {icons[item.id]}
          {item.label}
          {item.id === 'queue' && queueCount > 0 && (
            <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>
              {queueCount}
            </span>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div
        className={`nav-item${page === 'settings' ? ' active' : ''}`}
        onClick={() => setPage('settings')}
      >
        {icons.settings}
        Einstellungen
      </div>

      {ytdlpVersion && (
        <div style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>
          yt-dlp {ytdlpVersion}
        </div>
      )}
    </nav>
  )
}
