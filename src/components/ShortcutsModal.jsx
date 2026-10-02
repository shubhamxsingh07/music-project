import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const SHORTCUTS = [
  { key: 'Space', label: 'Play / Pause music' },
  { key: '← / →', label: 'Seek backward / forward 5s' },
  { key: '↑ / ↓', label: 'Volume up / down (5%)' },
  { key: 'M', label: 'Mute / Unmute audio' },
  { key: 'L', label: 'Like / Favorite current track' },
  { key: 'F', label: 'Toggle Fullscreen Cinema mode' },
  { key: 'Q', label: 'Toggle Up Next Queue drawer' },
  { key: 'Ctrl + K', label: 'Focus live Search bar' },
];

export default function ShortcutsModal() {
  const { isShortcutsOpen, setIsShortcutsOpen } = useMusicPlayer();

  if (!isShortcutsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-background-card/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsShortcutsOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-accent-cyan/15 text-accent-cyan">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Keyboard Shortcuts</h3>
            <p className="text-xs text-slate-400">Quick control without touching the mouse</p>
          </div>
        </div>

        <div className="space-y-2 divide-y divide-white/5">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between pt-2.5 text-xs text-slate-300"
            >
              <span className="font-medium text-slate-400">{item.label}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-accent-cyan font-bold shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">Esc</kbd> or click outside to dismiss.
          </p>
        </div>
      </div>
    </div>
  );
}
