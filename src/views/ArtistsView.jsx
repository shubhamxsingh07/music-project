import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2 } from 'lucide-react';
import { TOP_ARTISTS } from '../services/musicEngine';
import ArtistCard from '../components/ArtistCard';

export default function ArtistsView() {
  const [searchFilter, setSearchFilter] = useState('');
  const [artists, setArtists] = useState(TOP_ARTISTS);

  useEffect(() => {
    if (!searchFilter.trim()) {
      setArtists(TOP_ARTISTS);
    } else {
      const q = searchFilter.toLowerCase();
      setArtists(TOP_ARTISTS.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.genre || '').toLowerCase().includes(q)
      ));
    }
  }, [searchFilter]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-accent-purple/15 via-background-card/80 to-accent-cyan/15 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-accent-purple via-accent-blue to-accent-cyan flex items-center justify-center text-slate-950 shadow-lg shadow-accent-purple/20 flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Top Artists & Playback Legends
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Click any artist to explore and play their entire discography & hit playlist
            </p>
          </div>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter artist by name..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-background-card/90 border border-white/10 focus:border-accent-purple/50 rounded-full text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Artists Grid */}
      {artists.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8">
          <p className="text-sm font-semibold text-slate-300">No artists found matching "{searchFilter}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
