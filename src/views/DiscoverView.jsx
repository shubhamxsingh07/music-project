import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Music, Loader2, Disc3 } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { TOP_ARTISTS, POPULAR_GENRES } from '../services/musicEngine';
import { fetchGenreSongs } from '../services/youtubeApiService';
import ArtistCard from '../components/ArtistCard';
import TrackList from '../components/TrackList';

export default function DiscoverView() {
  const {
    setCurrentView,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre
  } = useMusicPlayer();

  const activeGenre = selectedGenre && selectedGenre !== 'All' ? selectedGenre : 'Hindi';
  const [genreTracks, setGenreTracks] = useState([]);
  const [isLoadingGenre, setIsLoadingGenre] = useState(true);

  // Load songs whenever the selected genre changes (from sidebar, header, or tabs)
  useEffect(() => {
    let alive = true;
    setIsLoadingGenre(true);

    fetchGenreSongs(activeGenre, 25)
      .then(tracks => {
        if (alive) {
          setGenreTracks(tracks);
        }
      })
      .catch(err => {
        console.error('Error loading genre songs:', err);
      })
      .finally(() => {
        if (alive) {
          setIsLoadingGenre(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [activeGenre]);

  const QUICK_SEARCH_TAGS = [
    'Arijit Singh', 'Shreya Ghoshal', 'Atif Aslam', 'Jubin Nautiyal',
    'Diljit Dosanjh', 'Neha Kakkar', 'Sonu Nigam', 'B Praak',
    'Badshah', 'Yo Yo Honey Singh', 'Kishore Kumar', 'Lata Mangeshkar'
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-12 animate-in fade-in duration-300">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-5 sm:p-8 md:p-10 bg-gradient-to-r from-accent-cyan/20 via-background-card/90 to-accent-purple/20 border border-white/10 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" /> High-Definition Audio Streaming
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Stream Top Hits & Your Favorite Genres
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Click any genre below to discover top hits, or choose a singer to play their entire discography.
          </p>

          {/* Quick Search Shortcut Tags */}
          <div className="pt-2 flex flex-wrap gap-2">
            {QUICK_SEARCH_TAGS.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setCurrentView('search');
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-all hover:border-accent-cyan/40 hover:text-accent-cyan"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Genre Selector & Songs Section ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-cyan/15 text-accent-cyan">
              <Disc3 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {activeGenre} Songs & Hits
              </h2>
              <p className="text-xs text-slate-400">
                Explore popular {activeGenre} tracks — single click to play instantly
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Genre Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {POPULAR_GENRES.filter(g => g !== 'All').map(genre => {
            const isActive = activeGenre.toLowerCase() === genre.toLowerCase();
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex-shrink-0 border ${
                  isActive
                    ? 'bg-accent-cyan text-slate-950 border-accent-cyan font-bold shadow-md shadow-accent-cyan/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Tracks List */}
        {isLoadingGenre ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400 bg-background-card/40 rounded-2xl border border-white/5">
            <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            <p className="text-xs font-medium">Fetching {activeGenre} songs catalog...</p>
          </div>
        ) : genreTracks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-background-card/40 rounded-2xl border border-white/5">
            <Music className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No songs found for {activeGenre}</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting another genre above.</p>
          </div>
        ) : (
          <div className="bg-background-card/60 rounded-2xl border border-white/5 p-2">
            <TrackList tracks={genreTracks} />
          </div>
        )}
      </section>

      {/* ─── Top Playback Artists & Singers Section ───────────────────────────── */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-purple/15 text-accent-purple">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Top Artists & Singers</h2>
              <p className="text-xs text-slate-400">Top 10 trending singers — click to stream their entire playlist</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('artists')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 transition-all hover:scale-105"
          >
            <span>View All ({TOP_ARTISTS.length})</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* 10 Top Artists Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {TOP_ARTISTS.slice(0, 10).map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>

        {/* Footer Shortcut to View All Artists */}
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentView('artists')}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all inline-flex items-center gap-2"
          >
            <span>Explore all {TOP_ARTISTS.length} Playback Artists & Legends</span>
            <span>&rarr;</span>
          </button>
        </div>
      </section>
    </div>
  );
}
