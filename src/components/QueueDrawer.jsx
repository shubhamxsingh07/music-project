import React from 'react';
import { X, Trash2, Play, Pause, Music, ListMusic } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatDuration } from '../services/musicEngine';
import AudioVisualizer from './AudioVisualizer';

export default function QueueDrawer() {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    removeFromQueue,
    clearQueue
  } = useMusicPlayer();

  if (!isQueueOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsQueueOpen(false)}
      />

      {/* Slide-out Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-background-darkest/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-accent-cyan" />
            <h3 className="font-bold text-base text-white">Play Queue</h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-300 font-mono">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close Queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Queue List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* Now Playing Section */}
          {currentTrack && (
            <div>
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AudioVisualizer isPlaying={isPlaying} barCount={3} className="h-3" />
                Now Playing
              </p>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/25 shadow-lg">
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-xl object-cover shadow bg-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate" title={currentTrack.title}>
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-slate-300 truncate">{currentTrack.artist}</p>
                </div>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-accent-cyan text-slate-950 flex items-center justify-center shadow-md flex-shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Up Next ({Math.max(0, queue.length - 1)})
            </p>

            {queue.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Queue is empty</p>
                <p className="text-xs mt-1">Add tracks from Discover or Search</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((track, idx) => {
                  const isThisCurrent = idx === queueIndex;

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track, queue, idx)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isThisCurrent
                          ? 'bg-white/10 border-white/20 text-accent-cyan'
                          : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-4 text-center font-mono text-xs text-slate-500 group-hover:text-slate-300">
                          {idx + 1}
                        </span>
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs truncate" title={track.title}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          {formatDuration(track.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(idx);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
