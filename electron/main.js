const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')

// yt-dlp binary path (bundled in resources or found in PATH)
function getYtdlpPath() {
  if (app.isPackaged) {
    const resourcePath = process.resourcesPath
    const binPath = path.join(resourcePath, 'resources', 'yt-dlp.exe')
    if (fs.existsSync(binPath)) return binPath
  }
  const localBin = path.join(__dirname, '..', 'resources', 'yt-dlp.exe')
  if (fs.existsSync(localBin)) return localBin
  return 'yt-dlp'
}

function getFfmpegPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', 'ffmpeg.exe')
  }
  const localBin = path.join(__dirname, '..', 'resources', 'ffmpeg.exe')
  if (fs.existsSync(localBin)) return localBin
  return 'ffmpeg'
}

const activeDownloads = new Map()

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 560,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'icon.ico'),
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  return win
}

app.whenReady().then(() => {
  const win = createWindow()

  ipcMain.on('window:minimize', () => win.minimize())
  ipcMain.on('window:maximize', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', () => win.close())

  ipcMain.handle('dialog:pickFolder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Download-Ordner wählen',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Fetch video info
  ipcMain.handle('ytdlp:getInfo', async (_, url) => {
    return new Promise((resolve, reject) => {
      const ytdlp = getYtdlpPath()
      const args = [
        url,
        '--dump-json',
        '--no-playlist',
        '--js-runtimes', 'node', // JS-Runtime für yt-dlp aktivieren
        '--socket-timeout', '10',
      ]
      let stdout = ''
      let stderr = ''
      const proc = spawn(ytdlp, args, { windowsHide: true })
      proc.stdout.on('data', d => { stdout += d.toString() })
      proc.stderr.on('data', d => { stderr += d.toString() })
      proc.on('close', code => {
        if (code === 0) {
          try {
            resolve(JSON.parse(stdout))
          } catch (e) {
            reject(new Error('JSON parse error: ' + e.message))
          }
        } else {
          reject(new Error(stderr.slice(-500) || 'yt-dlp failed'))
        }
      })
    })
  })

  // Start download
  ipcMain.on('ytdlp:download', (event, { id, url, options }) => {
    const ytdlp = getYtdlpPath()
    const ffmpeg = getFfmpegPath()
    const outputDir = options.outputDir || path.join(os.homedir(), 'Downloads', 'Seal')

    fs.mkdirSync(outputDir, { recursive: true })

    const args = [
      url,
      '--js-runtimes', 'node', // JS-Runtime für yt-dlp aktivieren
      '--ffmpeg-location', path.dirname(ffmpeg),
      '-o', path.join(outputDir, '%(title).200B.%(ext)s'),
      '--newline',
      '--progress',
    ]

    if (options.audioOnly) {
      args.push('-x', '--audio-format', options.audioFormat || 'mp3')
    } else {
      if (options.format) {
        args.push('-f', options.format)
      } else {
        args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best')
      }
    }

    if (options.embedThumbnail) args.push('--embed-thumbnail')
    if (options.embedMetadata) args.push('--embed-metadata')
    if (options.subtitles) {
      args.push('--write-subs', '--sub-langs', 'de,en')
    }
    if (options.playlist) args.push('--yes-playlist')
    else args.push('--no-playlist')
    if (options.proxy) args.push('--proxy', options.proxy)
    if (options.rateLimit) args.push('-r', options.rateLimit)

    const proc = spawn(ytdlp, args, { windowsHide: true })
    activeDownloads.set(id, proc)

    proc.stdout.on('data', data => {
      const lines = data.toString().split('\n').filter(Boolean)
      for (const line of lines) {
        const progressMatch = line.match(/\[download\]\s+([\d.]+)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/)
        if (progressMatch) {
          event.sender.send('ytdlp:progress', {
            id,
            percent: parseFloat(progressMatch[1]),
            size: progressMatch[2],
            speed: progressMatch[3],
            eta: progressMatch[4],
          })
        } else if (line.includes('[download] 100%')) {
          event.sender.send('ytdlp:progress', { id, percent: 100, speed: '', eta: '0:00' })
        } else {
          event.sender.send('ytdlp:log', { id, line })
        }
      }
    })

    proc.stderr.on('data', data => {
      event.sender.send('ytdlp:log', { id, line: data.toString() })
    })

    proc.on('close', code => {
      activeDownloads.delete(id)
      if (code === 0) {
        event.sender.send('ytdlp:done', { id, success: true, outputDir })
      } else {
        event.sender.send('ytdlp:done', { id, success: false })
      }
    })
  })

  ipcMain.on('ytdlp:cancel', (_, id) => {
    const proc = activeDownloads.get(id)
    if (proc) {
      proc.kill()
      activeDownloads.delete(id)
    }
  })

  ipcMain.on('shell:openFolder', (_, folderPath) => {
    shell.openPath(folderPath)
  })

  ipcMain.handle('ytdlp:version', async () => {
    return new Promise(resolve => {
      const proc = spawn(getYtdlpPath(), ['--version'], { windowsHide: true })
      let out = ''
      proc.stdout.on('data', d => { out += d.toString() })
      proc.on('close', () => resolve(out.trim()))
      proc.on('error', () => resolve('not found'))
    })
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
