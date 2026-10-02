import React, { useState, useEffect } from 'react';
import { Search, X, Menu, ListMusic, Activity, Sparkles } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { POPULAR_GENRES } from '../services/musicEngine';

export default function Header({ onToggleSidebar }) {
  const {
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    selectedGenre,
    setSelectedGenre,
    isQueueOpen,
    setIsQueueOpen,
    queue
  } = useMusicPlayer();

  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const searchDebounceRef = React.useRef(null);

  // When external searchQuery changes (e.g. clicking trending tags or artist tags), sync local input
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val);
      if (val.trim() && currentView !== 'search') {
        setCurrentView('search');
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    if (currentView !== 'discover') {
      setCurrentView('discover');
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-background-darkest/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search songs, remixes, artists, albums..."
            className="w-full pl-10 pr-20 py-2 bg-white/5 hover:bg-white/10 focus:bg-background-card/90 border border-white/10 focus:border-accent-cyan/50 rounded-full text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/50 transition-all"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {localSearch ? (
              <button
                onClick={handleClearSearch}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-400 border border-white/5">
                Ctrl+K
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Genre Pills on Tablet/Desktop */}
      <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {POPULAR_GENRES.slice(0, 6).map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreSelect(genre)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedGenre === genre && currentView === 'discover'
                ? 'bg-accent-cyan text-slate-950 font-bold shadow-md shadow-accent-cyan/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Right Action Icons: Live Audius node indicator + Queue Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Live Node Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">Live Stream</span>
        </div>

        {/* Up Next / Queue Toggle */}
        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          className={`relative p-2.5 rounded-xl border transition-all ${
            isQueueOpen
              ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
              : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white'
          }`}
          title="Toggle Queue (Q)"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-cyan text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
              {queue.length > 99 ? '99+' : queue.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
