# 🦭 Seal for Windows

Eine moderne, performante Desktop-Anwendung zum einfachen Herunterladen von Audio- und Videodateien von YouTube und hunderten weiteren Plattformen. Basiert auf Electron, React und `yt-dlp`.

---

## ✨ Features

- 🎵 **Audio & Video Downloads:** Unterstützt Formate wie MP3, M4A, MP4 (bis zu 4K/8K) und benutzerdefinierte Qualitäten.
- 🖼️ **Thumbnail & Metadaten Embedding:** Speichert Cover-Bilder und ID3-Tags direkt in den Dateien.
- 📜 **Playlists & Untertitel:** Unterstützung für vollständige Playlists und mehrsprachige Untertitel (DE/EN).
- 🚀 **Hardware-Beschleunigt:** Nutzt gebündeltes `ffmpeg` und `yt-dlp` für maximale Extraktionsgeschwindigkeit.
- 🎨 **Sleek Windows 11 Design:** Inklusive Custom Titlebar, Frameless-Look und dunklem Design.
- ⚡ **Auto JS-Runtime Handling:** Integrierte `node` JS-Engine-Unterstützung für fehlerfreie YouTube-Extraktion.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Electron 32, Node.js
- **Core Tools:** `yt-dlp`, `ffmpeg`

---

## 💻 Lokale Entwicklung (Dev-Setup)

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 22 LTS empfohlen)
- Git

### Installation & Start

1. **Repository klonen:**
   ```bash
   git clone [https://github.com/maxytmaxyt/Seal.git](https://github.com/maxytmaxyt/Seal.git)
   cd Seal/windows
