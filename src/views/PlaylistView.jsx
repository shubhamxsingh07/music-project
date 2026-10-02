import React, { useState } from 'react';
import { ListMusic, Play, Shuffle, Trash2, Plus, Music, Compass } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import TrackList from '../components/TrackList';

export default function PlaylistView() {
  const {
    playlists,
    selectedPlaylistId,
    deletePlaylist,
    playTrack,
    toggleShuffle,
    setCurrentView,
    setIsPlaylistModalOpen
  } = useMusicPlayer();

  const playlist = playlists.find(p => p.id === selectedPlaylistId);

  if (!playlist) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>Playlist not found.</p>
        <button
          onClick={() => setCurrentView('discover')}
          className="mt-3 px-4 py-2 rounded-xl bg-accent-cyan text-slate-950 text-xs font-bold"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks, randomIndex);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Playlist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-accent-purple/30 via-background-card/80 to-background-darkest p-5 sm:p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
          {/* Playlist Icon Box */}
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center shadow-2xl flex-shrink-0 ring-4 ring-accent-purple/20">
            <ListMusic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-accent-purple font-mono">
              Custom Playlist
            </span>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1 mb-2 truncate">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-xs sm:text-sm text-slate-300 mb-2 max-w-xl mx-auto sm:mx-0">
                {playlist.description}
              </p>
            )}
            <p className="text-xs text-slate-400 font-mono">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-5 sm:mt-6">
              {tracks.length > 0 && (
                <>
                  <button
                    onClick={handlePlayAll}
                    className="flex-1 sm:flex-none justify-center px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-accent-cyan/25 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play All</span>
                  </button>

                  <button
                    onClick={handleShufflePlay}
                    className="flex-1 sm:flex-none justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md border border-white/10 transition-all"
                  >
                    <Shuffle className="w-4 h-4 text-accent-cyan" />
                    <span>Shuffle</span>
                  </button>
                </>
              )}

              <button
                onClick={handleDelete}
                className="px-4 py-2.5 sm:py-3 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-rose-500/20 transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Tracks */}
      {tracks.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Playlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Explore tracks on Discover or Search and click "Add to Playlist" to build this collection!
          </p>
          <button
            onClick={() => setCurrentView('discover')}
            className="px-5 py-2.5 rounded-full bg-accent-cyan text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent-cyan/20"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Tracks</span>
          </button>
        </div>
      ) : (
        <div className="bg-background-card/60 rounded-2xl border border-white/5 p-2">
          <TrackList tracks={tracks} currentPlaylistId={playlist.id} />
        </div>
      )}
    </div>
  );
}
