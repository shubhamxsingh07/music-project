import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Play,
  Radio,
  Music,
  ListMusic,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { fetchCommunityPlaylists, fetchCommunityTracks } from '../services/communityService';
import TrackCard from '../components/TrackCard';



export default function CommunityView() {
  const { playTrack } = useMusicPlayer();

  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'playlists' | 'tracks'

  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
      const [pl, tr] = await Promise.all([
        fetchCommunityPlaylists(20),
        fetchCommunityTracks(30)
      ]);
      setPlaylists(pl);
      setTracks(tr);
    } catch (err) {
      console.error('Community load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const handlePlayPlaylist = (pl) => {
    if (pl.tracks && pl.tracks.length > 0) {
      playTrack(pl.tracks[0], pl.tracks, 0);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Community Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-accent-cyan/20 bg-gradient-to-r from-accent-cyan/15 via-background-card/90 to-accent-purple/15 p-5 sm:p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple flex items-center justify-center text-slate-950 shadow-xl shadow-accent-cyan/25 flex-shrink-0">
              <Globe2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-accent-cyan font-mono">
                Shared Hub
              </span>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Curated Playlists & Tracks
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1 max-w-xl">
                Stream curated featured playlists and top community tracks in pure HD audio!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={loadCommunityData}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-accent-cyan text-slate-950 font-bold shadow-md shadow-accent-cyan/20'
              : 'bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          All Media
        </button>
        <button
          onClick={() => setActiveFilter('playlists')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'playlists'
              ? 'bg-accent-cyan text-slate-950 font-bold shadow-md shadow-accent-cyan/20'
              : 'bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          Featured Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveFilter('tracks')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'tracks'
              ? 'bg-accent-cyan text-slate-950 font-bold shadow-md shadow-accent-cyan/20'
              : 'bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          Trending Hits ({tracks.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
          <p className="text-sm font-medium">Fetching database...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 1. Shared Playlists Section */}
          {(activeFilter === 'all' || activeFilter === 'playlists') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Featured Playlists
                </h2>
              </div>

              {playlists.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-slate-400">
                  <p className="text-sm font-medium">No playlists available yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Playlists added by Admin will show up here automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {playlists.map(pl => (
                    <div
                      key={pl.id}
                      onClick={() => handlePlayPlaylist(pl)}
                      className="group bg-background-card/80 hover:bg-background-cardHover/90 border border-white/5 hover:border-accent-cyan/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-accent-cyan/10 flex flex-col justify-between"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800">
                        <img
                          src={pl.artwork}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-accent-cyan backdrop-blur-md flex items-center gap-1">
                          <Radio className="w-3 h-3 text-accent-cyan" />
                          <span>Curated Album</span>
                        </span>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-accent-cyan text-slate-950 flex items-center justify-center shadow-xl">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-accent-cyan transition-colors">
                          {pl.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {pl.tracks?.length || pl.trackCount || 1} tracks • By {pl.author || 'Community'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 2. Shared Tracks & Uploads Section */}
          {(activeFilter === 'all' || activeFilter === 'tracks') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-accent-purple" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Shared Songs & Community Uploads
                </h2>
              </div>

              {tracks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-slate-400">
                  <p className="text-sm font-medium">No community songs uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
          )}
        </div>
      )}
    </div>
  );
}
