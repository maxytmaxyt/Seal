import React, { useState, useContext, useRef } from 'react'
import { AppContext } from '../App'

const isElectron = () => !!window.seal

function formatDuration(sec) {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}

// Demo mode: when not in Electron, simulate behavior
function mockInfo(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: 'Demo-Video (kein Electron erkannt)',
        uploader: 'Demo-Kanal',
        duration: 185,
        thumbnail: 'https://picsum.photos/seed/seal/320/180',
        filesize_approx: 45000000,
        formats: [
          { format_id: 'bestvideo+bestaudio', ext: 'mp4', height: 1080, vcodec: 'avc1', acodec: 'mp4a' },
          { format_id: '137+140', ext: 'mp4', height: 720, vcodec: 'avc1', acodec: 'mp4a' },
        ],
      })
    }, 1200)
  })
}

export default function DownloadPage() {
  const { settings, setSettings, addToQueue, addToast } = useContext(AppContext)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Local per-download options (start from global settings, user can override)
  const [opts, setOpts] = useState(null)

  function mergedOpts() {
    return opts || { ...settings }
  }
  function setOpt(key, val) {
    setOpts(o => ({ ...(o || settings), [key]: val }))
  }

  async function fetchInfo() {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setInfo(null)
    setOpts(null)
    try {
      const data = isElectron()
        ? await window.seal.getInfo(trimmed)
        : await mockInfo(trimmed)
      setInfo(data)
    } catch (e) {
      setError(e.message || 'Fehler beim Abrufen der Video-Informationen')
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') fetchInfo()
  }

  async function startDownload() {
    if (!info) return
    const o = mergedOpts()
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()

    const queueItem = {
      id,
      url: url.trim(),
      title: info.title,
      thumbnail: info.thumbnail,
      status: 'pending',
      percent: 0,
      speed: '',
      eta: '',
      size: formatSize(info.filesize_approx),
      log: '',
      outputDir: o.outputDir,
    }

    addToQueue(queueItem)

    if (isElectron()) {
      window.seal.download(id, url.trim(), o)
    } else {
      addToast('Demo-Modus: Echter Download nur in der Electron-App', 'error')
    }

    setUrl('')
    setInfo(null)
    setOpts(null)
  }

  async function pickFolder() {
    if (!isElectron()) return
    const folder = await window.seal.pickFolder()
    if (folder) setOpt('outputDir', folder)
  }

  const o = mergedOpts()

  const videoFormats = info?.formats?.filter(f => f.vcodec && f.vcodec !== 'none' && f.height) || []
  const uniqueHeights = [...new Set(videoFormats.map(f => f.height))].sort((a, b) => b - a)

  return (
    <div>
      <div className="page-title">Herunterladen</div>

      {/* URL input */}
      <div className="url-bar">
        <div className="url-input-wrap">
          <input
            ref={inputRef}
            className="url-input"
            placeholder="Video-URL einfügen (YouTube, Twitter, SoundCloud, ...)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchInfo}
          disabled={loading || !url.trim()}
        >
          {loading ? <span className="spinner" /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          )}
          {loading ? 'Abrufen…' : 'Abrufen'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(224,92,92,.1)', border: '1px solid rgba(224,92,92,.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, color: 'var(--error)', fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Video info preview */}
      {info && (
        <div className="info-card">
          {info.thumbnail
            ? <img className="info-thumb" src={info.thumbnail} alt="" />
            : <div className="info-thumb-placeholder">🎬</div>
          }
          <div className="info-meta">
            <div className="info-title">{info.title}</div>
            {info.uploader && <div className="info-uploader">{info.uploader}</div>}
            <div className="info-badges">
              {info.duration > 0 && <span className="badge">⏱ {formatDuration(info.duration)}</span>}
              {info.filesize_approx > 0 && <span className="badge">💾 ~{formatSize(info.filesize_approx)}</span>}
              {info.view_count > 0 && <span className="badge">👁 {info.view_count.toLocaleString('de-DE')}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Options (shown after info load) */}
      {info && (
        <>
          {/* Audio/Video mode */}
          <div style={{ marginBottom: 16 }}>
            <div className="option-label" style={{ marginBottom: 8 }}>Modus</div>
            <div className="chip-row">
              <div className={`chip${!o.audioOnly ? ' active' : ''}`} onClick={() => setOpt('audioOnly', false)}>
                🎬 Video
              </div>
              <div className={`chip${o.audioOnly ? ' active' : ''}`} onClick={() => setOpt('audioOnly', true)}>
                🎵 Nur Audio
              </div>
            </div>
          </div>

          <div className="options-grid">
            {/* Format / Quality */}
            {!o.audioOnly ? (
              <div className="option-group">
                <div className="option-label">Qualität</div>
                <div className="select-wrap">
                  <select className="select" value={o.videoFormat} onChange={e => setOpt('videoFormat', e.target.value)}>
                    <option value="best">Beste verfügbare</option>
                    {uniqueHeights.map(h => (
                      <option key={h} value={`bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`}>{h}p</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="option-group">
                <div className="option-label">Audio-Format</div>
                <div className="select-wrap">
                  <select className="select" value={o.audioFormat} onChange={e => setOpt('audioFormat', e.target.value)}>
                    {['mp3','m4a','opus','wav','flac','aac'].map(f => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Output folder */}
            <div className="option-group">
              <div className="option-label">Zielordner</div>
              <div className="folder-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18v13H3zM3 7l2-4h7l1 2h8"/></svg>
                <span className="folder-path">{o.outputDir || 'Standard (Downloads/Seal)'}</span>
                <button className="btn btn-ghost btn-sm" onClick={pickFolder}>Wählen</button>
              </div>
            </div>
          </div>

          {/* Toggle options */}
          <div className="settings-section" style={{ marginBottom: 20 }}>
            <div className="settings-section-title">Optionen</div>

            {[
              { key: 'embedThumbnail', label: 'Thumbnail einbetten', desc: 'Thumbnail in die Datei einbetten' },
              { key: 'embedMetadata', label: 'Metadaten einbetten', desc: 'Titel, Künstler etc. in die Datei schreiben' },
              { key: 'subtitles', label: 'Untertitel herunterladen', desc: 'DE und EN wenn verfügbar' },
              { key: 'playlist', label: 'Playlist herunterladen', desc: 'Alle Videos der Playlist laden' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="toggle-row">
                <div>
                  <div className="toggle-label">{label}</div>
                  <div className="toggle-desc">{desc}</div>
                </div>
                <div className={`toggle${o[key] ? ' on' : ''}`} onClick={() => setOpt(key, !o[key])} />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} onClick={startDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3v13M7 11l5 5 5-5M3 18h18"/>
            </svg>
            Download starten
          </button>
        </>
      )}

      {/* Empty state */}
      {!info && !loading && !error && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v13M7 11l5 5 5-5M3 18h18"/>
          </svg>
          <p>URL einfügen und auf „Abrufen" klicken</p>
          <p className="text-sm mt-2">Unterstützt YouTube, Twitter/X, SoundCloud, Twitch und <a href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md" style={{color:'var(--accent)'}}>1000+ weitere Seiten</a></p>
        </div>
      )}
    </div>
  )
}
