# Seal für Windows 11

Port der Android-App [Seal](https://github.com/maxytmaxyt/Seal) für Windows 11.  
Basiert auf **Electron + React + yt-dlp**.

## Setup (Entwicklung)

### 1. Voraussetzungen

- [Node.js](https://nodejs.org) ≥ 18
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) (`yt-dlp.exe`)
- [FFmpeg](https://github.com/BtbN/FFmpeg-Builds/releases) (`ffmpeg.exe`, `ffprobe.exe`)

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. yt-dlp & ffmpeg einrichten

Lege `yt-dlp.exe`, `ffmpeg.exe` und `ffprobe.exe` in den Ordner `resources/`.

**Oder** füge sie zum System-PATH hinzu – Seal findet sie automatisch.

### 4. Entwicklungsserver starten

```bash
npm run dev
```

### 5. Produktions-Build erstellen

```bash
npm run build
```

Die fertige `.exe` liegt danach im Ordner `release/`.

---

## Funktionen

- 🎬 Video-Download (MP4, WebM, beste Qualität oder gewünschte Auflösung)
- 🎵 Audio-Extraktion (MP3, M4A, OPUS, WAV, FLAC, AAC)
- 📋 Download-Warteschlange mit Fortschrittsanzeige
- 🖼 Thumbnail-Vorschau vor dem Download
- ⚙ Proxy-Unterstützung & Download-Limit
- 🪟 Natives Windows 11 Design (dunkles Theme)
- Unterstützt 1000+ Seiten via yt-dlp

## Credits

- Originale Android-App: [Seal](https://github.com/JunkFood02/Seal) von JunkFood02
- Fork: [maxytmaxyt/Seal](https://github.com/maxytmaxyt/Seal)
- Download-Engine: [yt-dlp](https://github.com/yt-dlp/yt-dlp)
