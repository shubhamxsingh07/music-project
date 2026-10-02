import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Maximize2,
  ListMusic,
  Loader2,
  Share2,
  Radio
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration } from '../services/musicEngine';
import AudioVisualizer from './AudioVisualizer';

export default function MasterPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleLike,
    isLiked,
    isQueueOpen,
    setIsQueueOpen,
    isFullScreen,
    setIsFullScreen,
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    setSelectedArtist,
    setCurrentView,
    currentView
  } = useMusicPlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekHoverTime, setSeekHoverTime] = useState(null);
  const [seekHoverPos, setSeekHoverPos] = useState(0);
  const progressBarRef = useRef(null);

  if (!currentTrack) {
    return (
      <footer className="h-20 bg-background-player/90 border-t border-white/10 backdrop-blur-2xl px-4 lg:px-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
            <Radio className="w-5 h-5 text-slate-500 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-slate-300">Ready to play</p>
            <p className="text-[11px] text-slate-500">Pick any track to start streaming live music</p>
          </div>
        </div>
      </footer>
    );
  }

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle Seek interactions
  const handleSeekChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    const target = (newPercent / 100) * duration;
    seek(target);
  };

  const handleSeekMouseMove = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = pos / rect.width;
    setSeekHoverPos(pos);
    setSeekHoverTime(percentage * duration);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(`Link for "${currentTrack.title}" copied to clipboard!`);
    }
  };

  return (
    <footer className={`${currentView === 'now-playing' ? 'hidden sm:flex' : 'flex'} h-16 sm:h-24 bg-background-player/95 border-t border-white/10 backdrop-blur-2xl px-3 sm:px-6 lg:px-8 items-center justify-between gap-2 sm:gap-4 z-30 relative select-none`}>
      {/* Mobile Top Thin Progress Line */}
      <div className="sm:hidden absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-cyan to-accent-cyanGlow transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ─── MOBILE VIEW (< sm:) ────────────────────────────────────────── */}
      <div className="sm:hidden flex items-center justify-between w-full gap-2">
        {/* Track Thumbnail + Title & Artist (Tap to open song details) */}
        <div
          onClick={() => setCurrentView('now-playing')}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 ring-1 ring-white/10">
            <img
              src={currentTrack.thumbnail || currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.title)}&background=06b6d4&color=fff`;
              }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <AudioVisualizer isPlaying={true} barCount={3} className="h-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Mobile Quick Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 rounded-full transition-colors ${
              liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
            }`}
            title="Like"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-accent-cyan text-slate-950 flex items-center justify-center shadow-md shadow-accent-cyan/25 active:scale-95 transition-all"
            title="Play / Pause"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => setCurrentView('now-playing')}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Song Details"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── DESKTOP / TABLET VIEW (sm: and up) ─────────────────────────── */}
      {/* 1. Track Info (Left) */}
      <div className="hidden sm:flex items-center gap-3.5 min-w-0 max-w-[28%] sm:max-w-[30%]">
        {/* Artwork */}
        <div
          onClick={() => setCurrentView('now-playing')}
          className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg bg-slate-800 flex-shrink-0 group ring-1 ring-white/10 cursor-pointer hover:ring-accent-cyan/50 transition-all"
          title="Open Song Details"
        >
          <img
            src={currentTrack.thumbnail || currentTrack.artwork}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : ''
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.title)}&background=06b6d4&color=fff`;
            }}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <AudioVisualizer isPlaying={true} barCount={3} />
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <h4
            onClick={() => setCurrentView('now-playing')}
            className="text-xs sm:text-sm font-bold text-white truncate hover:text-accent-cyan transition-colors cursor-pointer"
            title="Open Song Details"
          >
            {currentTrack.title}
          </h4>
          <button
            onClick={() => {
              if (currentTrack.artist) {
                setSelectedArtist({
                  id: currentTrack.artistId || `artist-${currentTrack.artist.toLowerCase().replace(/\s+/g, '-')}`,
                  name: currentTrack.artist,
                  handle: currentTrack.artistHandle,
                  avatar: currentTrack.artistAvatar,
                  isVerified: currentTrack.artistVerified
                });
                setCurrentView('artist-detail');
              }
            }}
            className="text-[11px] sm:text-xs text-slate-400 hover:text-slate-200 truncate block text-left"
            title={currentTrack.artist}
          >
            {currentTrack.artist}
          </button>
        </div>

        {/* Quick Like & Add to Playlist */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 rounded-full transition-colors ${
              liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
            }`}
            title={liked ? "Remove from Liked" : "Like Track (L)"}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => {
              setActiveTrackForPlaylist(currentTrack);
              setIsPlaylistModalOpen(true);
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-accent-cyan transition-colors"
            title="Add to Playlist"
          >
            <Radio className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Controls & Scrubber (Center) */}
      <div className="hidden sm:flex flex-1 max-w-xl flex-col items-center gap-1.5">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition-colors ${
              isShuffle
                ? 'text-accent-cyan bg-accent-cyan/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={playPrevious}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 flex items-center justify-center shadow-lg shadow-accent-cyan/30 hover:scale-105 active:scale-95 transition-all"
            title="Play / Pause (Space)"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-1.5 rounded-lg transition-colors ${
              repeatMode !== 'off'
                ? 'text-accent-cyan bg-accent-cyan/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
            {formatDuration(currentTime)}
          </span>

          <div
            ref={progressBarRef}
            onMouseMove={handleSeekMouseMove}
            onMouseLeave={() => setSeekHoverTime(null)}
            className="relative flex-1 h-1.5 group/seek flex items-center cursor-pointer rounded-full bg-white/10"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-cyan to-accent-cyanGlow rounded-full pointer-events-none transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />

            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-accent-cyan/50 -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity pointer-events-none ring-2 ring-accent-cyan"
              style={{ left: `${progressPercent}%` }}
            />

            {seekHoverTime !== null && (
              <div
                className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 rounded bg-background-darkest/95 border border-white/10 text-[10px] font-mono text-accent-cyan shadow-xl pointer-events-none"
                style={{ left: `${seekHoverPos}px` }}
              >
                {formatDuration(seekHoverTime)}
              </div>
            )}

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent || 0}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* 3. Extra Actions & Volume (Right) */}
      <div className="hidden lg:flex items-center justify-end gap-3 min-w-0 max-w-[25%]">
        <button
          onClick={handleShare}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Share Song Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Mute / Unmute (M)"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 accent-accent-cyan rounded-lg cursor-pointer"
          />
        </div>

        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          className={`p-2 rounded-lg border transition-colors ${
            isQueueOpen
              ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30'
              : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
          title="Queue (Q)"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentView('now-playing')}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Song Details & Suggestions"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
