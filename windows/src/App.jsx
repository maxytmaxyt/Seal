import React, { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import DownloadPage from './components/DownloadPage'
import QueuePage from './components/QueuePage'
import SettingsPage from './components/SettingsPage'
import ToastContainer from './components/Toast'

export const AppContext = React.createContext(null)

const DEFAULT_SETTINGS = {
  outputDir: '',
  audioOnly: false,
  audioFormat: 'mp3',
  videoFormat: 'best',
  embedThumbnail: true,
  embedMetadata: true,
  subtitles: false,
  playlist: false,
  proxy: '',
  rateLimit: '',
  showLog: false,
}

export default function App() {
  const [page, setPage] = useState('download')
  const [queue, setQueue] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [toasts, setToasts] = useState([])
  const [ytdlpVersion, setYtdlpVersion] = useState('')

  // Load settings from localStorage (persists across restarts via renderer)
  useEffect(() => {
    const saved = localStorage.getItem('seal-settings')
    if (saved) {
      try { setSettings(s => ({ ...s, ...JSON.parse(saved) })) } catch {}
    }
    // Get yt-dlp version
    if (window.seal) {
      window.seal.getVersion().then(v => setYtdlpVersion(v))
    }
  }, [])

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('seal-settings', JSON.stringify(settings))
  }, [settings])

  // Subscribe to yt-dlp events
  useEffect(() => {
    if (!window.seal) return

    const offProgress = window.seal.onProgress(({ id, percent, speed, eta, size }) => {
      setQueue(q => q.map(item =>
        item.id === id
          ? { ...item, status: 'downloading', percent, speed, eta, size }
          : item
      ))
    })

    const offLog = window.seal.onLog(({ id, line }) => {
      setQueue(q => q.map(item =>
        item.id === id
          ? { ...item, log: (item.log || '') + line + '\n' }
          : item
      ))
    })

    const offDone = window.seal.onDone(({ id, success, outputDir }) => {
      setQueue(q => q.map(item =>
        item.id === id
          ? { ...item, status: success ? 'done' : 'error', percent: success ? 100 : item.percent, outputDir }
          : item
      ))
      const item = queue.find(i => i.id === id)
      if (success) {
        addToast('Download abgeschlossen: ' + (item?.title || id), 'success')
        if (page !== 'queue') setPage('queue')
      } else {
        addToast('Download fehlgeschlagen', 'error')
      }
    })

    return () => { offProgress(); offLog(); offDone() }
  }, [queue, page])

  function addToast(msg, type = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  function addToQueue(item) {
    setQueue(q => [...q, item])
    setPage('queue')
  }

  function removeFromQueue(id) {
    if (window.seal) window.seal.cancelDownload(id)
    setQueue(q => q.filter(i => i.id !== id))
  }

  function clearDone() {
    setQueue(q => q.filter(i => i.status !== 'done' && i.status !== 'error'))
  }

  return (
    <AppContext.Provider value={{ settings, setSettings, queue, addToQueue, removeFromQueue, clearDone, addToast, ytdlpVersion }}>
      <div className="app-layout">
        <TitleBar />
        <div className="app-body">
          <Sidebar page={page} setPage={setPage} queueCount={queue.filter(i => i.status === 'downloading' || i.status === 'pending').length} />
          <main className="main-content">
            {page === 'download' && <DownloadPage />}
            {page === 'queue' && <QueuePage />}
            {page === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </AppContext.Provider>
  )
}
