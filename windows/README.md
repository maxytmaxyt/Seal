# Seal für Windows 11

Windows 11 Port der [Seal Android-App](https://github.com/maxytmaxyt/Seal).  
Basiert auf **Electron + React + yt-dlp**.

## Schnellstart

```bash
cd windows
npm install

# yt-dlp.exe + ffmpeg.exe in resources/ legen (oder im PATH)
# → https://github.com/yt-dlp/yt-dlp/releases/latest
# → https://github.com/BtbN/FFmpeg-Builds/releases

npm run dev        # Entwicklungsserver
npm run build      # .exe Installer bauen → release/
```

## Features

- 🎬 Video-Download (MP4, beste Qualität oder gewählte Auflösung)
- 🎵 Audio-Extraktion (MP3, M4A, OPUS, WAV, FLAC, AAC)
- 📋 Download-Warteschlange mit Live-Fortschritt
- 🖼 Thumbnail-Vorschau vor dem Download
- ⚙ Proxy & Download-Limit
- 🪟 Natives Windows 11 Design (dunkles Theme, custom Titlebar)
- 1000+ Seiten via yt-dlp
