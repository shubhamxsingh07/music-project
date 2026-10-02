import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Users, Music, Play, Loader2 } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatNumber } from '../services/musicEngine';
import { fetchArtistDiscography } from '../services/youtubeApiService';
import TrackList from '../components/TrackList';
import TrackCard from '../components/TrackCard';

export default function ArtistDetailView() {
  const { selectedArtist, setCurrentView, playTrack } = useMusicPlayer();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewLayout, setViewLayout] = useState('list');

  useEffect(() => {
    if (!selectedArtist?.name) return;
    let isMounted = true;
    setIsLoading(true);

    const loadArtistDiscography = async () => {
      try {
        const results = await fetchArtistDiscography(selectedArtist.name, 25);
        if (isMounted) {
          setTracks(results);
        }
      } catch (err) {
        console.error('Failed to load artist tracks:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadArtistDiscography();

    return () => {
      isMounted = false;
    };
  }, [selectedArtist]);

  if (!selectedArtist) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>No artist selected.</p>
        <button
          onClick={() => setCurrentView('discover')}
          className="mt-3 px-4 py-2 rounded-xl bg-accent-cyan text-slate-950 text-xs font-bold"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('artists')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Artists</span>
      </button>

      {/* Artist Profile Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-background-card/80 p-5 sm:p-8 md:p-10 shadow-2xl">
        {/* Cover Photo Backdrop */}
        {selectedArtist.cover && (
          <div className="absolute inset-0 z-0">
            <img
              src={selectedArtist.cover}
              alt=""
              className="w-full h-full object-cover filter blur-2xl opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-darkest via-background-darkest/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-6">
          {/* Avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 flex-shrink-0 bg-slate-800">
            <img
              src={selectedArtist.avatar}
              alt={selectedArtist.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtist.name)}&background=1e293b&color=38bdf8&size=300`;
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight truncate">
                {selectedArtist.name}
              </h1>
              {selectedArtist.isVerified && (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan flex-shrink-0 fill-accent-cyan/20" />
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-mono mb-2 sm:mb-3">
              @{selectedArtist.handle}
            </p>

            {selectedArtist.bio && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-3 mb-4">
                {selectedArtist.bio}
              </p>
            )}

            {/* Stats & Play All */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={handlePlayAll}
                disabled={tracks.length === 0}
                className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-full bg-accent-cyan hover:bg-accent-cyanGlow text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-accent-cyan/25 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Discography</span>
              </button>

              {selectedArtist.followerCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{formatNumber(selectedArtist.followerCount)} followers</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Music className="w-4 h-4 text-slate-500" />
                <span>{tracks.length} tracks available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Discography</h2>

          <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 text-xs">
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

        {isLoading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-accent-cyan" />
            <p className="text-xs">Loading tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-background-card/40 rounded-2xl border border-white/5">
            <p className="text-sm">No tracks found for this artist.</p>
          </div>
        ) : viewLayout === 'list' ? (
          <div className="bg-background-card/60 rounded-2xl border border-white/5 p-2">
            <TrackList tracks={tracks} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tracks.map((track, idx) => (
              <TrackCard
                key={track.id}
                track={track}
                tracksContext={tracks}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
