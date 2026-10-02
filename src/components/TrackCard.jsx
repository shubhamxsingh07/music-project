import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration, formatNumber } from '../services/musicEngine';
import AudioVisualizer from './AudioVisualizer';

export default function TrackCard({ track, tracksContext = [], index = 0 }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    addToQueue,
    playNextInQueue,
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    setSelectedArtist,
    setCurrentView
  } = useMusicPlayer();

  const [showMenu, setShowMenu] = useState(false);
  const isCurrent = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracksContext.length > 0 ? tracksContext : [track], index);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(track);
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
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
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative bg-background-card/80 hover:bg-background-cardHover/90 backdrop-blur-md rounded-2xl p-3.5 transition-all duration-300 cursor-pointer border border-white/5 hover:border-accent-cyan/30 hover:shadow-xl hover:shadow-accent-cyan/10 flex flex-col justify-between ${
        isCurrent ? 'ring-1 ring-accent-cyan/60 bg-background-cardHover/90 shadow-lg shadow-accent-cyan/10' : ''
      }`}
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800/80 mb-3.5 shadow-md">
        <img
          src={track.artwork}
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating Genre Tag */}
        {track.genre && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-black/60 backdrop-blur-md text-accent-cyan border border-accent-cyan/20">
            {track.genre}
          </span>
        )}

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
            liked
              ? 'bg-rose-500/20 text-rose-500 opacity-100'
              : 'bg-black/60 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:scale-110'
          }`}
          title={liked ? "Remove from Liked" : "Add to Liked"}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isCurrent
                ? 'bg-accent-cyan text-slate-950 scale-100 opacity-100 shadow-accent-cyan/40'
                : 'bg-accent-cyan/95 text-slate-950 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:scale-110 shadow-black/50'
            }`}
          >
            {isTrackPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Animated Sound Wave if playing */}
        {isTrackPlaying && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md flex items-center gap-1.5">
            <AudioVisualizer isPlaying={true} barCount={3} />
            <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider">Playing</span>
          </div>
        )}

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-slate-300">
          {formatDuration(track.duration)}
        </span>
      </div>

      {/* Metadata */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-semibold text-sm truncate transition-colors ${
            isCurrent ? 'text-accent-cyan' : 'text-slate-100 group-hover:text-accent-cyan'
          }`}
          title={track.title}
        >
          {track.title}
        </h4>

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={handleArtistClick}
            className="text-xs text-slate-400 hover:text-slate-200 truncate max-w-[80%] text-left transition-colors"
            title={track.artist}
          >
            {track.artist}
          </button>

          {/* Context Options Menu Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  className="absolute right-0 bottom-full mb-1 w-44 bg-background-darkest/95 backdrop-blur-xl border border-white/10 rounded-xl py-1.5 shadow-2xl z-40 text-xs text-slate-300 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      addToQueue(track);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-accent-cyan" />
                    Add to Queue
                  </button>
                  <button
                    onClick={() => {
                      playNextInQueue(track);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-accent-purple" />
                    Play Next
                  </button>
                  <button
                    onClick={() => {
                      setActiveTrackForPlaylist(track);
                      setIsPlaylistModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5 text-accent-pink" />
                    Add to Playlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Play count */}
        {track.playCount > 0 && (
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {formatNumber(track.playCount)} plays
          </p>
        )}
      </div>
    </div>
  );
}
