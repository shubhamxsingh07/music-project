import React from 'react';
import { Play, Pause, Plus, Heart, Sparkles, Radio } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatNumber, formatDuration } from '../services/musicEngine';
import AudioVisualizer from './AudioVisualizer';

export default function HeroBanner({ track, tracksContext = [] }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    addToQueue,
    setSelectedArtist,
    setCurrentView
  } = useMusicPlayer();

  if (!track) return null;

  const isCurrent = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracksContext.length > 0 ? tracksContext : [track], 0);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-8">
      {/* Background Cover Image with Gradient Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-full h-full object-cover filter blur-xl scale-110 opacity-30 transition-transform duration-700 group-hover:scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background-darkest via-background-darkest/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-darkest via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Album Artwork Poster */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ring-2 ring-white/10 group-hover:ring-accent-cyan/50 transition-all duration-300">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isTrackPlaying && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md flex items-center gap-2 border border-accent-cyan/30">
              <AudioVisualizer isPlaying={true} barCount={4} />
              <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">Streaming Live</span>
            </div>
          )}
        </div>

        {/* Text Details & Controls */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left min-w-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 w-fit mx-auto md:mx-0 mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trending Hit</span>
            {track.genre && (
              <>
                <span className="opacity-40">•</span>
                <span>{track.genre}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight truncate" title={track.title}>
            {track.title}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm sm:text-base text-slate-300">
            <span>By</span>
            <button
              onClick={() => {
                if (track.artistId) {
                  setSelectedArtist({
                    id: track.artistId,
                    name: track.artist,
                    handle: track.artistHandle,
                    avatar: track.artistAvatar,
                    isVerified: track.artistVerified
                  });
                  setCurrentView('artist-detail');
                }
              }}
              className="font-bold text-accent-cyan hover:underline truncate"
            >
              {track.artist}
            </button>
            {track.playCount > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono text-xs sm:text-sm">
                  {formatNumber(track.playCount)} plays
                </span>
              </>
            )}
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-xs sm:text-sm">
              {formatDuration(track.duration)}
            </span>
          </div>

          {track.description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-2.5 line-clamp-2 max-w-xl">
              {track.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
            <button
              onClick={handlePlay}
              className="px-7 py-3 rounded-full bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isTrackPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => addToQueue(track)}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base flex items-center gap-2 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-accent-cyan" />
              <span>Queue</span>
            </button>

            <button
              onClick={() => toggleLike(track)}
              className={`p-3 rounded-full backdrop-blur-md border transition-all duration-200 ${
                liked
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20 hover:text-rose-400'
              }`}
              title={liked ? "Remove from Liked" : "Like Track"}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
