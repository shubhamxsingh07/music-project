import React, { useState } from 'react';
import { Heart, Play, Shuffle, Search, Music, Compass } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import TrackList from '../components/TrackList';
import TrackCard from '../components/TrackCard';

export default function LikedSongsView() {
  const { likedTracks, playTrack, toggleShuffle, setCurrentView } = useMusicPlayer();
  const [filterQuery, setFilterQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('list');

  const filteredTracks = likedTracks.filter(t =>
    t.title?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.artist?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.genre?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (likedTracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * likedTracks.length);
      playTrack(likedTracks[randomIndex], likedTracks, randomIndex);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-background-card/80 to-background-darkest p-5 sm:p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
          {/* Heart Badge Box */}
          <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0 ring-4 ring-rose-500/20">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white fill-white shadow-lg" />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-rose-400 font-mono">
              Personal Collection
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight mt-1 mb-1.5 sm:mb-2">
              Liked Songs
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'} saved in your library
            </p>

            {/* Play & Shuffle Actions */}
            {likedTracks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handlePlayAll}
                  className="flex-1 sm:flex-none justify-center px-6 py-2.5 sm:py-3 rounded-full bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-accent-cyan/25 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={handleShufflePlay}
                  className="flex-1 sm:flex-none justify-center px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md border border-white/10 transition-all"
                >
                  <Shuffle className="w-4 h-4 text-accent-cyan" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter & View Switcher */}
      {likedTracks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter your liked songs..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/50"
            />
          </div>

          <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewLayout('list')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewLayout === 'list' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewLayout === 'grid' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {likedTracks.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Liked Songs Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Click the heart icon on any song while listening or browsing to save it here.
          </p>
          <button
            onClick={() => setCurrentView('discover')}
            className="px-5 py-2.5 rounded-full bg-accent-cyan text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent-cyan/20"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Music</span>
          </button>
        </div>
      ) : viewLayout === 'list' ? (
        <div className="bg-background-card/60 rounded-2xl border border-white/5 p-2">
          <TrackList tracks={filteredTracks} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTracks.map((track, idx) => (
            <TrackCard
              key={track.id}
              track={track}
              tracksContext={filteredTracks}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
