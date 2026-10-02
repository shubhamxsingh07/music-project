import React from 'react';
import { CheckCircle, Music2, Users } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatNumber } from '../services/musicEngine';

export default function ArtistCard({ artist }) {
  const { setSelectedArtist, setCurrentView } = useMusicPlayer();

  const handleClick = () => {
    setSelectedArtist(artist);
    setCurrentView('artist-detail');
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-background-card/70 hover:bg-background-cardHover/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 transition-all duration-300 cursor-pointer border border-white/5 hover:border-accent-cyan/30 hover:shadow-xl hover:shadow-accent-cyan/10 flex flex-col items-center text-center"
    >
      {/* Avatar with glow */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2.5 sm:mb-3 rounded-full overflow-hidden shadow-lg bg-slate-800 ring-2 ring-white/10 group-hover:ring-accent-cyan transition-all duration-300 group-hover:scale-105">
        <img
          src={artist.avatar}
          alt={artist.name}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1e293b&color=38bdf8&size=200`;
          }}
        />
      </div>

      {/* Artist Name & Verification */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <h4 className="font-semibold text-sm text-slate-100 group-hover:text-accent-cyan truncate transition-colors">
          {artist.name}
        </h4>
        {artist.isVerified && (
          <CheckCircle className="w-4 h-4 text-accent-cyan flex-shrink-0 fill-accent-cyan/20" />
        )}
      </div>

      <p className="text-xs text-slate-400 truncate w-full mt-0.5">
        @{artist.handle}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-400 font-medium">
        {artist.followerCount > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500" />
            {formatNumber(artist.followerCount)}
          </span>
        )}
        {artist.trackCount > 0 && (
          <span className="flex items-center gap-1">
            <Music2 className="w-3 h-3 text-slate-500" />
            {artist.trackCount} tracks
          </span>
        )}
      </div>
    </div>
  );
}
