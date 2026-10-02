import React, { useState, useEffect } from 'react';
import { Search, Music, Sparkles, Loader2, Compass, TrendingUp, Play, Clock } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { searchYouTubeSongs } from '../services/youtubeApiService';

const QUICK_TAGS = [
  'Tum Hi Ho', 'Kesariya', 'Raataan Lambiyan', 'Tera Ban Jaunga',
  'Apna Bana Le', 'Tauba Tauba', 'Ik Vaari Aa', 'Hawayein',
  'Arijit Singh', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Atif Aslam',
];

function formatDuration(secs) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function SearchView() {
  const { searchQuery, setSearchQuery, playTrack } = useMusicPlayer();
  const [results, setResults]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setResults([]);
      setError('');
      return;
    }

    let alive = true;
    setIsLoading(true);
    setError('');

    searchYouTubeSongs(searchQuery)
      .then(tracks => {
        if (!alive) return;
        setResults(tracks);
        if (tracks.length === 0) setError('No songs found. Try another keyword.');
      })
      .catch(() => {
        if (alive) setError('Search failed. Check your connection and try again.');
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => { alive = false; };
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-accent-cyan/15 via-background-card/80 to-accent-purple/15 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple flex items-center justify-center text-slate-950 shadow-lg shadow-accent-cyan/25 flex-shrink-0">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
              {searchQuery ? `"${searchQuery}"` : 'Search Songs & Artists'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Search any song, artist, movie or album — instant streaming
            </p>
          </div>
        </div>
      </div>

      {/* Quick Search Tags */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-accent-cyan" /> Trending:
        </span>
        {QUICK_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag)}
            className="px-3 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 hover:text-accent-cyan text-slate-300 border border-white/5 transition-all flex-shrink-0 font-medium"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
          <p className="text-sm font-medium">Finding songs...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="py-16 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8">
          <Search className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">{error}</p>
        </div>
      )}

      {/* Results — 5 songs as thumbnail cards */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-bold text-lg text-white">
              {results.length} Songs Found
            </h3>
          </div>

          <div className="space-y-2">
            {results.map((track, i) => (
              <button
                key={track.youtubeId}
                onClick={() => playTrack(track, results, i)}
                className="w-full flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-background-card/60 hover:bg-white/5 border border-white/5 hover:border-accent-cyan/20 transition-all group text-left"
              >
                {/* HD Thumbnail — small */}
                <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=06b6d4&color=fff`; }}
                  />
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
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
                  <span className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDuration(Math.floor(track.duration))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searchQuery && !isLoading && (
        <div className="py-24 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/10 p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-4 shadow-lg shadow-accent-cyan/15">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Search Bollywood Songs</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Type a song name, artist, or movie name to find & play instantly.
            Played songs auto-save so they work even offline.
          </p>
        </div>
      )}
    </div>
  );
}
