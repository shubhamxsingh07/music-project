# 🎵 Symphony Music — Next-Gen AI Music Streaming Web App

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![YouTube Data API](https://img.shields.io/badge/YouTube-Data_API_v3-FF0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern, ad-free, high-fidelity music streaming application with **Google Gemini AI** title cleaning, **YouTube background audio engine**, and **mobile-first responsive design**.

---

## 🌟 Key Features

### 🎧 1. Infinite Music Streaming & Discovery
- **YouTube Audio Engine:** Stream millions of Bollywood, Punjabi, Bhojpuri, Pop, Lo-Fi, and Global songs in ultra HD 320 kbps audio quality.
- **Smart Cloud Caching:** Songs played once are automatically cached in Firebase Firestore so they stream instantly even without YouTube API quota.
- **Related Song Recommendations:** Real-time AI and artist-based recommendation engine for non-stop continuous playback.

### 🤖 2. Google Gemini AI Intelligence
- **AI Song Title Cleaning:** Automatically strips out cluttered YouTube metadata (e.g. *"Lyrical Video 4K 60FPS | Full Song | T-Series"*) and formats it into clean, crisp **Song Title & Artist Name**.
- **Contextual Search Analysis:** Natural language search understanding (e.g., *"sad romantic songs"*, *"arijit singh hits 2024"*).

### 📱 3. 100% Fully Responsive & Mobile-First
- **Dedicated Mobile Player Screen:**
  - Centered album artwork with dynamic radial ambient glow matching the cover.
  - Interactive **touch scrubber progress bar** with real-time timestamps.
  - Prominent neon circular Play/Pause button with smooth micro-interactions.
  - Shuffle, Skip Previous, Skip Next, and Repeat (Off / All / One) controls.
  - Live **Audio Visualizer wave animation** (`LIVE HD`) when playing.
- **Native Mobile Bottom Navigation Bar:** Quick access to Discover, Search, Artists, Liked Songs (with badge), and Community Hub.
- **Desktop Studio Mode:** 3-column control bar with volume slider, queue drawer, and keyboard shortcuts.

### 🎤 4. Verified Artists Directory
- Complete profiles for top Indian artists (**Arijit Singh, Shreya Ghoshal, Jubin Nautiyal, Atif Aslam, Neha Kakkar, Diljit Dosanjh, Pawan Singh**, and more).
- High-resolution real photos, follower counts, verified badges, and top track discographies.

### 📂 5. Playlists, Favorites & History
- **Personal Playlists:** Create, rename, delete custom playlists, and add songs in one click.
- **Liked Songs Collection:** Heart any song to instantly save it to your personal favorites library.
- **Listening History:** Automatically tracks recently played tracks so you can jump right back in.
- **Play Queue Drawer:** View up-next songs, reorder, or remove tracks on the fly.

### 🛡️ 6. Admin Studio & Community Hub
- **Real-Time Analytics:** Live active online visitors counter, total stream plays, and catalog size.
- **Music Importer:** Import YouTube playlists and songs directly into community playlists.
- **Audio Uploader:** Drag-and-drop custom MP3s and high-res cover art directly to Firebase Storage.

### ⌨️ 7. Keyboard Shortcuts
| Key | Action |
|:---|:---|
| <kbd>Space</kbd> | Play / Pause audio |
| <kbd>←</kbd> / <kbd>→</kbd> | Seek backward / forward 5s |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume up / down (5%) |
| <kbd>M</kbd> | Mute / Unmute audio |
| <kbd>L</kbd> | Like / Favorite current track |
| <kbd>F</kbd> | Toggle Fullscreen Cinema Player |
| <kbd>Q</kbd> | Toggle Up Next Queue Drawer |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Quick focus search bar |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS
- **Icons & Animations:** Lucide React, Tailwind Animate
- **Audio Engines:** Native HTML5 Audio API & YouTube IFrame Player API
- **AI Integration:** Google Gemini Generative Language API
- **Backend & Database:** Firebase Firestore & Firebase Cloud Storage
- **State Management:** React Context API with persistent LocalStorage

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/shubhamxsingh07/music-project.git
cd music-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI & YouTube API
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```text
music-project/
├── public/                 # Static public assets
├── src/
│   ├── components/         # Reusable UI & Player components
│   │   ├── MasterPlayer.jsx          # Bottom persistent player
│   │   ├── MobileBottomNav.jsx       # Native mobile bottom bar
│   │   ├── FullScreenPlayer.jsx      # Cinema mode fullscreen player
│   │   ├── AudioVisualizer.jsx       # Animated wave bars
│   │   ├── QueueDrawer.jsx           # Slide-out queue drawer
│   │   ├── TrackCard.jsx & TrackList # Song grid & list cards
│   │   └── ...
│   ├── context/            # Global MusicPlayerContext
│   ├── services/           # Backend, AI & API Services
│   │   ├── geminiMusicAi.js          # Google Gemini AI title cleaner
│   │   ├── youtubeApiService.js      # YouTube Data API discovery
│   │   ├── communityService.js       # Firestore playlist & track sync
│   │   ├── analyticsService.js       # Live visitor metrics
│   │   └── firebase.js               # Firebase client instance
│   ├── views/              # Main App Screens
│   │   ├── DiscoverView.jsx          # Home feed & recommendations
│   │   ├── SearchView.jsx            # Live search & trending chips
│   │   ├── NowPlayingView.jsx        # Dedicated mobile/desktop player
│   │   ├── ArtistsView.jsx           # Top verified artists grid
│   │   ├── ArtistDetailView.jsx      # Artist biography & discography
│   │   ├── LikedSongsView.jsx        # Favorite songs library
│   │   ├── PlaylistView.jsx          # Custom playlist view
│   │   ├── HistoryView.jsx           # Listening history
│   │   ├── CommunityView.jsx         # Shared playlists & hub
│   │   └── AdminView.jsx             # Dedicated Admin Studio
│   ├── App.jsx             # Main Application Shell
│   └── main.jsx            # Entry point
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind CSS theme & tokens
├── vite.config.js          # Vite bundler config
└── README.md
```

---

## 🛡️ Security

- All API keys and Firebase credentials are kept safe in `.env` and excluded from git via `.gitignore`.
- Production build tree-shakes unused assets and enforces strict sanitization.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for music lovers everywhere 🎶</p>
