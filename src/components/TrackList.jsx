import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, Trash2, Clock } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration, formatNumber } from '../services/musicEngine';
import AudioVisualizer from './AudioVisualizer';

export default function TrackList({ tracks = [], currentPlaylistId = null }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    addToQueue,
    playNextInQueue,
    removeTrackFromPlaylist,
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    setSelectedArtist,
    setCurrentView
  } = useMusicPlayer();

  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 bg-background-card/40 rounded-2xl border border-white/5">
        <p className="text-base font-medium">No tracks available</p>
        <p className="text-xs text-slate-500 mt-1">Explore trending music or search for your favorite tracks!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[24px_1fr_auto_32px] sm:grid-cols-[36px_1fr_80px_60px_36px] md:grid-cols-[36px_1fr_120px_100px_80px_40px] items-center px-2 sm:px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10 gap-2 sm:gap-3">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Genre</span>
        <span className="hidden sm:block text-right">Plays</span>
        <span className="flex items-center justify-end gap-1"><Clock className="w-3.5 h-3.5" /></span>
        <span className="text-center"></span>
      </div>

      {/* Track Rows */}
      <div className="divide-y divide-white/5">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          const isTrackPlaying = isCurrent && isPlaying;
          const liked = isLiked(track.id);
          const isMenuOpen = activeMenuId === track.id;

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playTrack(track, tracks, index);
                }
              }}
              className={`group grid grid-cols-[24px_1fr_auto_32px] sm:grid-cols-[36px_1fr_80px_60px_36px] md:grid-cols-[36px_1fr_120px_100px_80px_40px] items-center px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 cursor-pointer gap-2 sm:gap-3 border border-transparent ${
                isCurrent
                  ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan'
                  : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              {/* Index or Play/Visualizer Indicator */}
              <div className="flex items-center justify-center text-xs font-mono text-slate-400 group-hover:text-accent-cyan">
                {isCurrent ? (
                  isTrackPlaying ? (
                    <>
                      <div className="group-hover:hidden">
                        <AudioVisualizer isPlaying={true} barCount={3} className="h-3.5" />
                      </div>
                      <Pause className="w-3.5 h-3.5 hidden group-hover:block fill-current text-accent-cyan" />
                    </>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current text-accent-cyan" />
                  )
                ) : (
                  <>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current" />
                  </>
                )}
              </div>

              {/* Artwork + Title + Artist */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={track.thumbnail || track.artwork}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover shadow-sm bg-slate-800 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title || 'Music')}&background=06b6d4&color=fff`;
                  }}
                />
                <div className="min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? 'text-accent-cyan' : 'text-slate-100 group-hover:text-white'
                    }`}
                    title={track.title}
                  >
                    {track.title}
                  </h4>
                  <button
                    onClick={(e) => {
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
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 truncate text-left block"
                  >
                    {track.artist}
                  </button>
                </div>
              </div>

              {/* Genre */}
              <div className="hidden md:block truncate">
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 text-slate-300 border border-white/5">
                  {track.genre || 'General'}
                </span>
              </div>

              {/* Plays */}
              <div className="hidden sm:block text-right font-mono text-xs text-slate-400">
                {formatNumber(track.playCount)}
              </div>

              {/* Duration & Like Button */}
              <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    liked
                      ? 'text-rose-500'
                      : 'opacity-0 group-hover:opacity-100 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
                </button>
                <span>{formatDuration(track.duration)}</span>
              </div>

              {/* Context Actions Menu */}
              <div className="relative text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : track.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                      }}
                    />
                    <div
                      className="absolute right-0 top-full mt-1 w-44 bg-background-darkest/95 backdrop-blur-xl border border-white/10 rounded-xl py-1.5 shadow-2xl z-40 text-xs text-slate-300 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          addToQueue(track);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-accent-cyan" />
                        Add to Queue
                      </button>
                      <button
                        onClick={() => {
                          playNextInQueue(track);
                          setActiveMenuId(null);
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
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5 text-accent-pink" />
                        Add to Playlist
                      </button>
                      {currentPlaylistId && (
                        <button
                          onClick={() => {
                            removeTrackFromPlaylist(currentPlaylistId, track.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove from Playlist
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
