import React from 'react';

export default function AudioVisualizer({ isPlaying, barCount = 4, className = "" }) {
  const bars = Array.from({ length: barCount });

  return (
    <div className={`flex items-end gap-[3px] h-5 ${className}`}>
      {bars.map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-t-sm bg-gradient-to-t from-accent-cyan to-accent-cyanGlow transition-all duration-300 ${
            isPlaying ? 'animate-wave' : 'h-1.5 opacity-40'
          }`}
          style={{
            animationDelay: isPlaying ? `${(i * 0.18).toFixed(2)}s` : '0s',
            animationDuration: `${0.6 + (i % 3) * 0.3}s`,
            height: isPlaying ? undefined : '4px'
          }}
        />
      ))}
    </div>
  );
}
