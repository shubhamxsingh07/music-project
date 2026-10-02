import React from 'react';
import { History, Play, Trash2, Compass } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import TrackList from '../components/TrackList';

export default function HistoryView() {
  const { history, clearHistory, playTrack, setCurrentView } = useMusicPlayer();

  const handlePlayAll = () => {
    if (history.length > 0) {
      playTrack(history[0], history, 0);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/15 text-accent-blue">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Listening History</h1>
            <p className="text-xs text-slate-400">Recently played tracks on this device</p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePlayAll}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-accent-cyan/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={clearHistory}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-background-card/40 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No History Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Songs you stream will automatically appear here so you can easily replay them.
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
          <TrackList tracks={history} />
        </div>
      )}
    </div>
  );
}
