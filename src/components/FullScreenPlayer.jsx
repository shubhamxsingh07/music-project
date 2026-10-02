import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  Clock,
  Plus,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration } from '../services/musicEngine';
import { fetchRelatedSuggestions } from '../services/youtubeApiService';
import AudioVisualizer from './AudioVisualizer';

export default function FullScreenPlayer() {
  const {
    isFullScreen,
    setIsFullScreen,
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
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    playTrack,
    currentView,
    setSelectedArtist,
    setCurrentView
  } = useMusicPlayer();

  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  // Fetch related suggestions whenever the current track changes
  useEffect(() => {
    if (!currentTrack?.youtubeId && !currentTrack?.id) return;

    let alive = true;
    setIsLoadingSuggestions(true);

    fetchRelatedSuggestions(currentTrack, 15)
      .then(tracks => {
        if (alive) {
          setSuggestions(tracks);
        }
      })
      .catch(err => {
        console.error('Error fetching suggestions:', err);
      })
      .finally(() => {
        if (alive) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [currentTrack?.youtubeId, currentTrack?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, setIsFullScreen]);

  if (!isFullScreen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleOpenArtist = () => {
    if (currentTrack.artist) {
      setSelectedArtist({
        id: `artist-${currentTrack.artist.toLowerCase().replace(/\s+/g, '-')}`,
        name: currentTrack.artist
      });
      setIsFullScreen(false);
      setCurrentView('artist-detail');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-darkest/95 backdrop-blur-3xl text-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 select-none">
      {/* ── 1. Immersive Dynamic Ambient Background Blur ───────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={currentTrack.thumbnail || currentTrack.artwork}
          alt=""
          className="w-full h-full object-cover filter blur-[100px] scale-150 opacity-30 transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-darkest/80 via-background-darkest/60 to-background-darkest/95" />
      </div>

      {/* ── 2. Top Header Bar ────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 sm:px-12 pt-6 pb-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        {/* Minimize Button (Apple Music style Chevron Down) */}
        <button
          onClick={() => setIsFullScreen(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all hover:scale-105 active:scale-95 text-xs font-semibold"
          title="Minimize Player (Esc)"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* Center Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Radio className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
            Playing from <span className="text-white font-bold capitalize">{currentView || 'Music'}</span>
          </span>
        </div>

        {/* Right Actions: Heart & Add to Playlist */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-2.5 rounded-full border transition-all ${
              liked
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 scale-105'
                : 'bg-white/10 hover:bg-white/20 border-white/5 text-slate-300 hover:text-white'
            }`}
            title="Like Song"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              setActiveTrackForPlaylist(currentTrack);
              setIsPlaylistModalOpen(true);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-slate-300 hover:text-white transition-all"
            title="Add to Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. Scrollable Main Content Area ───────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin scrollbar-thumb-white/10">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* ── Center Stage: Large Artwork & Controls ── */}
          <div className="flex flex-col items-center text-center space-y-6 pt-2">

            {/* Glowing Album Cover */}
            <div className="relative w-52 h-52 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/15 bg-slate-900 group">
              <img
                src={currentTrack.thumbnail || currentTrack.artwork}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.title)}&background=06b6d4&color=fff&size=512`;
                }}
              />
              {/* Live Audio Visualizer Overlay at bottom of cover */}
              {isPlaying && (
                <div className="absolute bottom-3 left-4 right-4 py-1.5 px-3 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 border border-white/10">
                  <AudioVisualizer isPlaying={true} barCount={5} className="h-4" />
                  <span className="text-[10px] font-mono font-bold text-accent-cyan tracking-wider uppercase">HD Audio Stream</span>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="space-y-1.5 max-w-xl">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug line-clamp-2 px-2">
                {currentTrack.title}
              </h1>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={handleOpenArtist}
                  className="text-sm sm:text-lg font-semibold text-slate-300 hover:text-accent-cyan transition-colors"
                >
                  {currentTrack.artist}
                </button>
                <CheckCircle2 className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              </div>
            </div>

            {/* Progress Bar & Timers */}
            <div className="w-full max-w-xl space-y-1.5 pt-2 px-2">
              <div className="relative group h-2 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full pointer-events-none"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progressPercent || 0}
                  onChange={(e) => {
                    const newPercent = parseFloat(e.target.value);
                    seek((newPercent / 100) * (duration || 100));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Playback Controls Island */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-10 pt-2">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2.5 sm:p-3 rounded-2xl transition-all ${
                  isShuffle ? 'text-accent-cyan bg-accent-cyan/15' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Prev */}
              <button
                onClick={playPrevious}
                className="p-2 sm:p-3 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple text-slate-950 flex items-center justify-center shadow-2xl shadow-accent-cyan/40 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                ) : (
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-2 sm:p-3 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Next"
              >
                <SkipForward className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={cycleRepeatMode}
                className={`p-2.5 sm:p-3 rounded-2xl transition-all ${
                  repeatMode !== 'off' ? 'text-accent-cyan bg-accent-cyan/15' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-28 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
            </div>
          </div>

          {/* ── 4. Lower Section: Up Next & Related Suggestions Feed ── */}
          <div className="space-y-4 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-purple/20 text-accent-purple">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white tracking-tight">Up Next & Related Songs</h3>
                  <p className="text-xs text-slate-400">Click any song to play — queue auto-updates</p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                Continuous Play
              </span>
            </div>

            {/* Suggestions Grid */}
            {isLoadingSuggestions ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                      <div className="h-2.5 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No related suggestions found. Play any other track to reload.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((track, i) => (
                  <button
                    key={track.youtubeId || track.id || i}
                    onClick={() => playTrack(track, suggestions, i)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-cyan/30 transition-all group text-left shadow-sm backdrop-blur-md"
                  >
                    {/* Rank */}
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-accent-cyan w-4 text-center flex-shrink-0">
                      {i + 1}
                    </span>

                    {/* HD Thumbnail */}
                    <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-md bg-slate-800">
                      <img
                        src={track.thumbnail || track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=06b6d4&color=fff`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-accent-cyan transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                    </div>

                    {/* Duration */}
                    {track.duration > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatDuration(Math.floor(track.duration))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
