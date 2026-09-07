import React, { useContext } from 'react'
import { AppContext } from '../App'

export default function SettingsPage() {
  const { settings, setSettings, ytdlpVersion } = useContext(AppContext)
  const isElectron = !!window.seal

  function set(key, val) {
    setSettings(s => ({ ...s, [key]: val }))
  }

  async function pickFolder() {
    if (!isElectron) return
    const folder = await window.seal.pickFolder()
    if (folder) set('outputDir', folder)
  }

  return (
    <div>
      <div className="page-title">Einstellungen</div>

      {/* Download */}
      <div className="settings-section">
        <div className="settings-section-title">Download</div>

        <div className="option-group" style={{ marginBottom: 14 }}>
          <div className="option-label">Standard-Zielordner</div>
          <div className="folder-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18v13H3zM3 7l2-4h7l1 2h8"/></svg>
            <span className="folder-path">{settings.outputDir || 'Downloads/Seal (Standard)'}</span>
            <button className="btn btn-ghost btn-sm" onClick={pickFolder} disabled={!isElectron}>Wählen</button>
          </div>
        </div>

        <div className="options-grid">
          <div className="option-group">
            <div className="option-label">Standard-Modus</div>
            <div className="chip-row">
              <div className={`chip${!settings.audioOnly ? ' active' : ''}`} onClick={() => set('audioOnly', false)}>🎬 Video</div>
              <div className={`chip${settings.audioOnly ? ' active' : ''}`} onClick={() => set('audioOnly', true)}>🎵 Audio</div>
            </div>
          </div>

          <div className="option-group">
            <div className="option-label">Standard-Audioformat</div>
            <div className="select-wrap">
              <select className="select" value={settings.audioFormat} onChange={e => set('audioFormat', e.target.value)}>
                {['mp3','m4a','opus','wav','flac','aac'].map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Metadaten */}
      <div className="settings-section">
        <div className="settings-section-title">Metadaten & Extras</div>

        {[
          { key: 'embedThumbnail', label: 'Thumbnail einbetten', desc: 'Thumbnail in die Datei einbetten (benötigt ffmpeg)' },
          { key: 'embedMetadata', label: 'Metadaten einbetten', desc: 'Titel, Künstler, Album aus den Video-Metadaten' },
          { key: 'subtitles', label: 'Untertitel herunterladen', desc: 'DE und EN Untertitel wenn verfügbar' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="toggle-row">
            <div>
              <div className="toggle-label">{label}</div>
              <div className="toggle-desc">{desc}</div>
            </div>
            <div className={`toggle${settings[key] ? ' on' : ''}`} onClick={() => set(key, !settings[key])} />
          </div>
        ))}
      </div>

      {/* Netzwerk */}
      <div className="settings-section">
        <div className="settings-section-title">Netzwerk</div>

        <div className="option-group" style={{ marginBottom: 14 }}>
          <div className="option-label">Proxy</div>
          <input
            className="option-input"
            placeholder="http://proxy:port oder socks5://..."
            value={settings.proxy}
            onChange={e => set('proxy', e.target.value)}
          />
        </div>

        <div className="option-group">
          <div className="option-label">Download-Limit</div>
          <input
            className="option-input"
            placeholder="z.B. 2M oder 500K (leer = unbegrenzt)"
            value={settings.rateLimit}
            onChange={e => set('rateLimit', e.target.value)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="settings-section">
        <div className="settings-section-title">Über</div>
        <div className="toggle-row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="toggle-label">Seal für Windows</div>
            <div className="toggle-desc">Port der Android-App von maxytmaxyt</div>
          </div>
          <span className="version-badge">v1.0.0</span>
        </div>
        {ytdlpVersion && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            yt-dlp Version: {ytdlpVersion}
          </div>
        )}
        {!isElectron && (
          <div style={{ marginTop: 12, background: 'rgba(240,160,48,.1)', border: '1px solid rgba(240,160,48,.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--warning)', fontSize: 12 }}>
            ⚠ Demo-Modus: Läuft im Browser. Für echte Downloads die Electron-App starten.
          </div>
        )}
      </div>
    </div>
  )
}
