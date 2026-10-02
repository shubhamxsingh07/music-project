import React from 'react';
import {
  Compass,
  Search,
  Users,
  Heart,
  History,
  Plus,
  Music,
  Radio,
  Keyboard,
  ListMusic,
  Flame,
  Globe2,
  X
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { POPULAR_GENRES } from '../services/musicEngine';

export default function Sidebar({ isOpen, onClose }) {
  const {
    currentView,
    setCurrentView,
    likedTracks,
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    selectedGenre,
    setSelectedGenre,
    setIsPlaylistModalOpen
  } = useMusicPlayer();

  const handleNavClick = (viewName) => {
    setCurrentView(viewName);
    setSelectedPlaylistId(null);
    if (onClose) onClose();
  };

  const handlePlaylistClick = (pId) => {
    setSelectedPlaylistId(pId);
    setCurrentView('playlist');
    if (onClose) onClose();
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setCurrentView('discover');
    if (onClose) onClose();
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 lg:w-64 h-full max-h-screen bg-background-sidebar border-r border-white/5 flex flex-col min-h-0 overflow-hidden shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('discover')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-cyan/20 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5 font-['Outfit']">
              M U S I C
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-cyan/20 text-accent-cyan font-mono font-semibold">2.0</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">AI Music Engine</p>
          </div>
        </div>

        {/* Close Button on Mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-6 pb-24 lg:pb-8 scrollbar-thin scrollbar-thumb-white/10">
        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>

          <button
            onClick={() => handleNavClick('discover')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'discover' && !selectedPlaylistId
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover & Charts</span>
          </button>

          <button
            onClick={() => handleNavClick('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'search'
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search & Explore</span>
          </button>

          <button
            onClick={() => handleNavClick('artists')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'artists'
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Top Artists</span>
          </button>

          <button
            onClick={() => handleNavClick('liked')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'liked'
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Liked Songs</span>
            </div>
            {likedTracks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 font-mono">
                {likedTracks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('community')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'community'
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4 text-accent-cyan" />
              <span>Community Hub</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-accent-cyan/20 text-accent-cyan font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'history'
                ? 'bg-accent-cyan/15 text-accent-cyan shadow-sm shadow-accent-cyan/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Recent History</span>
          </button>
        </div>

        {/* Playlists */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Playlists
            </p>
            <button
              onClick={() => setIsPlaylistModalOpen(true)}
              className="p-1 rounded-md text-slate-400 hover:text-accent-cyan hover:bg-white/5 transition-colors"
              title="Create New Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => handlePlaylistClick(pl.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium truncate transition-all ${
                  selectedPlaylistId === pl.id
                    ? 'bg-white/10 text-accent-cyan font-semibold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ListMusic className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  <span className="truncate">{pl.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {pl.tracks?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Genres
          </p>
          <div className="flex flex-wrap gap-1 px-2">
            {POPULAR_GENRES.slice(0, 8).map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  selectedGenre === genre && currentView === 'discover'
                    ? 'bg-accent-cyan text-slate-950 font-semibold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
