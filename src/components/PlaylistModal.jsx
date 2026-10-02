import React, { useState } from 'react';
import { X, Plus, ListMusic, Check, Sparkles } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function PlaylistModal() {
  const {
    isPlaylistModalOpen,
    setIsPlaylistModalOpen,
    activeTrackForPlaylist,
    setActiveTrackForPlaylist,
    playlists,
    createPlaylist,
    addTrackToPlaylist
  } = useMusicPlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isPlaylistModalOpen) return null;

  const handleClose = () => {
    setIsPlaylistModalOpen(false);
    setActiveTrackForPlaylist(null);
    setIsCreatingNew(false);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setSuccessMsg('');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const created = createPlaylist(newPlaylistName, newPlaylistDesc);
    if (activeTrackForPlaylist) {
      addTrackToPlaylist(created.id, activeTrackForPlaylist);
      setSuccessMsg(`Added "${activeTrackForPlaylist.title}" to ${created.name}`);
    } else {
      setSuccessMsg(`Playlist "${created.name}" created!`);
    }

    setTimeout(() => {
      handleClose();
    }, 900);
  };

  const handleAddToExisting = (playlist) => {
    if (!activeTrackForPlaylist) return;
    addTrackToPlaylist(playlist.id, activeTrackForPlaylist);
    setSuccessMsg(`Added to ${playlist.name}!`);

    setTimeout(() => {
      handleClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-background-card/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-xl bg-accent-cyan/15 text-accent-cyan">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {activeTrackForPlaylist ? 'Add to Playlist' : 'Create New Playlist'}
            </h3>
            {activeTrackForPlaylist && (
              <p className="text-xs text-slate-400 truncate max-w-[260px]">
                {activeTrackForPlaylist.title} • {activeTrackForPlaylist.artist}
              </p>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Option 1: Existing Playlists List */}
        {activeTrackForPlaylist && !isCreatingNew && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Choose an existing playlist
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {playlists.map(pl => {
                const alreadyIn = pl.tracks?.some(t => t.id === activeTrackForPlaylist.id);

                return (
                  <button
                    key={pl.id}
                    onClick={() => handleAddToExisting(pl)}
                    disabled={alreadyIn}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all ${
                      alreadyIn
                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed text-slate-400'
                        : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-accent-cyan/30 text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{pl.name}</p>
                      <p className="text-[11px] text-slate-400">{pl.tracks?.length || 0} tracks</p>
                    </div>
                    {alreadyIn ? (
                      <span className="text-[11px] text-slate-500 font-medium">Already Added</span>
                    ) : (
                      <Plus className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-accent-cyan" />
                <span>Create a brand new playlist</span>
              </button>
            </div>
          </div>
        )}

        {/* Option 2: Create New Playlist Form */}
        {(!activeTrackForPlaylist || isCreatingNew) && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Playlist Name *
              </label>
              <input
                type="text"
                required
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g. Night Vibes, Gym Beats, Coding Focus"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Give your playlist a mood or description..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-accent-cyan rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {activeTrackForPlaylist && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Back to List
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs shadow-lg shadow-accent-cyan/25 transition-all"
              >
                Save Playlist
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
