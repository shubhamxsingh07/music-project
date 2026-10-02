import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Plus,
  Sparkles,
  Music2,
  Clock,
  Radio,
  CheckCircle2,
  Share2,
  ListMusic,
  Loader2,
  Maximize2
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration } from '../services/musicEngine';
import { fetchRelatedSuggestions } from '../services/youtubeApiService';
import AudioVisualizer from '../components/AudioVisualizer';

export default function NowPlayingView() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    seek,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    toggleLike,
    isLiked,
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    setCurrentView,
    previousView,
    playTrack,
    setSelectedArtist,
    isQueueOpen,
    setIsQueueOpen,
    setIsFullScreen,
    queue
  } = useMusicPlayer();

  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  // Fetch related suggestions whenever the current track changes
  useEffect(() => {
    if (!currentTrack?.id && !currentTrack?.youtubeId) return;

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

  if (!currentTrack) {
    return (
      <div className="py-24 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8 flex flex-col items-center">
        <Music2 className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Song Playing Right Now</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">
          Pick any song or artist from Discover to start streaming in high quality.
        </p>
        <button
          onClick={() => setCurrentView('discover')}
          className="px-5 py-2.5 rounded-full bg-accent-cyan text-slate-950 font-bold text-xs shadow-lg shadow-accent-cyan/20 hover:scale-105 transition-transform"
        >
          Go to Discover
        </button>
      </div>
    );
  }

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    seek((val / 100) * (duration || 100));
  };

  const handleOpenArtist = (e) => {
    e?.stopPropagation();
    if (currentTrack.artist) {
      setSelectedArtist({
        id: `artist-${currentTrack.artist.toLowerCase().replace(/\s+/g, '-')}`,
        name: currentTrack.artist
      });
      setCurrentView('artist-detail');
    }
  };

  const handleShare = (e) => {
    e?.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(`Link for "${currentTrack.title}" copied!`);
    }
  };

  const backDestination = previousView && previousView !== 'now-playing' ? previousView : 'discover';

  return (
    <div className="space-y-6 pb-28 sm:pb-20 animate-in fade-in duration-300 select-none">
      {/* ── Top Bar: Back Button, Now Streaming Pill & Queue Trigger ── */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrentView(backDestination)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/5 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="capitalize">Back to {backDestination}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[11px] sm:text-xs font-mono font-semibold">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
            <span>Now Streaming</span>
          </div>

          <button
            onClick={() => setIsQueueOpen(prev => !prev)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 flex items-center gap-1 text-xs"
            title="Queue"
          >
            <ListMusic className="w-4 h-4 text-accent-cyan" />
            <span className="text-[10px] font-mono hidden sm:inline">{queue.length}</span>
          </button>
        </div>
      </div>

      {/* ── 1. MOBILE-FIRST HERO PLAYER (< lg:) ───────────────────────── */}
      <div className="lg:hidden relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.08] via-background-card/90 to-background-darkest border border-white/10 p-5 shadow-2xl">
        {/* Ambient background glow matching artwork */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #06b6d4, #8b5cf6, transparent 70%)`
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Cover Artwork */}
          <div className="relative w-56 h-56 sm:w-68 sm:h-68 max-w-[70vw] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/15 bg-slate-900 group mx-auto">
            <img
              src={currentTrack.thumbnail || currentTrack.artwork}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.title)}&background=06b6d4&color=fff&size=512`;
              }}
            />

            {/* Live Playing Wave Indicator Badge */}
            {isPlaying && (
              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-lg">
                <AudioVisualizer isPlaying={true} barCount={3} className="h-3" />
                <span className="text-[9px] font-mono text-accent-cyan font-bold tracking-wider ml-0.5">
                  LIVE HD
                </span>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="w-full mt-4 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug line-clamp-2 px-1">
              {currentTrack.title}
            </h1>

            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <button
                onClick={handleOpenArtist}
                className="text-sm font-semibold text-slate-300 hover:text-accent-cyan transition-colors"
              >
                {currentTrack.artist}
              </button>
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 font-mono">
                320 kbps HD
              </span>
              <span className="px-2 py-0.5 rounded-md bg-accent-purple/15 border border-accent-purple/30 text-accent-purple font-medium">
                High Fidelity
              </span>
              {currentTrack.genre && (
                <span className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-medium">
                  {currentTrack.genre}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Touch Scrubber / Progress Bar */}
          <div className="w-full max-w-sm mt-4 space-y-1.5 px-2">
            <div className="relative group h-2 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple rounded-full pointer-events-none transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercent || 0}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-0.5">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Primary Controls Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-xl transition-all ${
                isShuffle ? 'text-accent-cyan bg-accent-cyan/15 scale-105' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Previous */}
            <button
              onClick={playPrevious}
              className="p-2.5 text-slate-300 hover:text-white active:scale-90 transition-transform"
              title="Previous Song"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Big Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple text-slate-950 flex items-center justify-center shadow-xl shadow-accent-cyan/40 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              className="p-2.5 text-slate-300 hover:text-white active:scale-90 transition-transform"
              title="Next Song"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={`p-2.5 rounded-xl transition-all ${
                repeatMode !== 'off' ? 'text-accent-cyan bg-accent-cyan/15 scale-105' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-center gap-2.5 mt-4 pt-3 border-t border-white/5 w-full max-w-sm">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                liked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTrackForPlaylist(currentTrack);
                setIsPlaylistModalOpen(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Playlist</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 transition-all"
              title="Share Track"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFullScreen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 transition-all"
              title="Cinema Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-accent-cyan" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. DESKTOP / TABLET STUDIO BANNER (>= lg:) ─────────────────── */}
      <div className="hidden lg:block relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 backdrop-blur-2xl shadow-2xl">
        {/* Ambient background glow matching artwork */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #06b6d4, #8b5cf6, transparent 70%)`
          }}
        />

        <div className="relative z-10 flex items-start gap-8">
          {/* Cover Artwork */}
          <div className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/15 flex-shrink-0 bg-slate-900 group">
            <img
              src={currentTrack.thumbnail || currentTrack.artwork}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.title)}&background=06b6d4&color=fff&size=512`;
              }}
            />

            {/* Live Playing Wave Indicator Badge */}
            {isPlaying && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-lg">
                <AudioVisualizer isPlaying={true} barCount={3} className="h-3" />
                <span className="text-[10px] font-mono text-accent-cyan font-bold tracking-wider ml-0.5">
                  LIVE HD
                </span>
              </div>
            )}
          </div>

          {/* Details & Playback Island */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-cyan mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Track</span>
                {currentTrack.genre && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-slate-300">{currentTrack.genre}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug line-clamp-2">
                {currentTrack.title}
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleOpenArtist}
                  className="text-lg font-semibold text-slate-300 hover:text-accent-cyan transition-colors"
                >
                  {currentTrack.artist}
                </button>
                <CheckCircle2 className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              </div>

              <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-400">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono font-medium">
                  320 kbps Ultra HD
                </span>
                <span className="px-3 py-1 rounded-lg bg-accent-purple/15 border border-accent-purple/30 text-accent-purple font-medium">
                  High Fidelity
                </span>
              </div>
            </div>

            {/* Desktop Scrubber */}
            <div className="w-full max-w-xl space-y-1.5 mt-5">
              <div className="relative group h-2 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple rounded-full pointer-events-none transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progressPercent || 0}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Desktop Playback & Actions Row */}
            <div className="flex items-center gap-4 mt-4">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2.5 rounded-xl transition-all ${
                  isShuffle ? 'text-accent-cyan bg-accent-cyan/15 scale-105' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple text-slate-950 flex items-center justify-center shadow-xl shadow-accent-cyan/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={cycleRepeatMode}
                className={`p-2.5 rounded-xl transition-all ${
                  repeatMode !== 'off' ? 'text-accent-cyan bg-accent-cyan/15 scale-105' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>

              <div className="h-6 w-px bg-white/10 mx-2" />

              {/* Actions */}
              <button
                onClick={() => toggleLike(currentTrack)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  liked
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 scale-105'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTrackForPlaylist(currentTrack);
                  setIsPlaylistModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Playlist</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="Share Song"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullScreen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="Cinema Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5 text-accent-cyan" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. UP NEXT & RELATED SONGS SECTION ──────────────────────────── */}
      <div className="space-y-4 pt-2">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
              <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Up Next & Suggested Songs
              </h2>
              <p className="text-xs text-slate-400">
                Based on <span className="text-slate-200 font-medium">{currentTrack.artist || 'this track'}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {suggestions.length} Tracks
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoadingSuggestions ? (
          <div className="space-y-2.5 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/10 rounded w-1/3" />
                  <div className="h-2.5 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-background-card/40 rounded-2xl border border-white/5 p-6">
            <Music2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No suggestions available right now</p>
            <p className="text-xs text-slate-500 mt-1">Play any song from Discover to reload suggestions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((track, i) => {
              const trackLiked = isLiked(track.id);
              const isThisPlaying = currentTrack?.id === track.id || currentTrack?.youtubeId === track.youtubeId;

              return (
                <div
                  key={track.youtubeId || track.id || i}
                  onClick={() => playTrack(track, suggestions, i)}
                  className={`w-full flex items-center justify-between gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl border transition-all group text-left cursor-pointer shadow-sm ${
                    isThisPlaying
                      ? 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan shadow-md shadow-accent-cyan/10'
                      : 'bg-background-card/50 hover:bg-white/10 border-white/5 hover:border-accent-cyan/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Index / Play on hover */}
                    <div className="w-5 sm:w-6 text-center flex-shrink-0 flex items-center justify-center">
                      {isThisPlaying ? (
                        <AudioVisualizer isPlaying={isPlaying} barCount={3} className="h-3.5" />
                      ) : (
                        <>
                          <span className="text-xs font-mono font-bold text-slate-500 group-hover:hidden">
                            {i + 1}
                          </span>
                          <Play className="w-3.5 h-3.5 text-accent-cyan fill-accent-cyan hidden group-hover:block" />
                        </>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md bg-slate-800 ring-1 ring-white/5">
                      <img
                        src={track.thumbnail || track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=06b6d4&color=fff`;
                        }}
                      />
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                        isThisPlaying ? 'text-accent-cyan' : 'text-white group-hover:text-accent-cyan'
                      }`}>
                        {track.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Duration + Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {track.duration > 0 && (
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500 hidden sm:inline" />
                        {formatDuration(Math.floor(track.duration))}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                        trackLiked
                          ? 'text-rose-400'
                          : 'text-slate-500 hover:text-rose-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                      }`}
                      title="Like Track"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${trackLiked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrackForPlaylist(track);
                        setIsPlaylistModalOpen(true);
                      }}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-accent-cyan opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
