const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('seal', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // Dialogs
  pickFolder: () => ipcRenderer.invoke('dialog:pickFolder'),

  // yt-dlp
  getInfo: (url) => ipcRenderer.invoke('ytdlp:getInfo', url),
  download: (id, url, options) => ipcRenderer.send('ytdlp:download', { id, url, options }),
  cancelDownload: (id) => ipcRenderer.send('ytdlp:cancel', id),
  getVersion: () => ipcRenderer.invoke('ytdlp:version'),

  // Events
  onProgress: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.on('ytdlp:progress', handler)
    return () => ipcRenderer.removeListener('ytdlp:progress', handler)
  },
  onLog: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.on('ytdlp:log', handler)
    return () => ipcRenderer.removeListener('ytdlp:log', handler)
  },
  onDone: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.on('ytdlp:done', handler)
    return () => ipcRenderer.removeListener('ytdlp:done', handler)
  },

  // Shell
  openFolder: (path) => ipcRenderer.send('shell:openFolder', path),
})
