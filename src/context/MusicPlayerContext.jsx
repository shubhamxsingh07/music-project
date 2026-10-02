import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getTrackStreamUrl } from '../services/musicEngine';
import { recordTrackStream } from '../services/analyticsService';
import { saveSongToDB } from '../services/youtubeApiService';

const MusicPlayerContext = createContext(null);

const STORAGE_KEYS = {
  LIKED: 'music_player_liked_tracks_v2',
  PLAYLISTS: 'music_player_playlists_v2',
  HISTORY: 'music_player_history_v2',
  VOLUME: 'music_player_volume_v2',
  REPEAT: 'music_player_repeat_v2',
  SHUFFLE: 'music_player_shuffle_v2',
  PREFERENCES: 'music_player_preferences_v2'
};

export function MusicPlayerProvider({ children }) {
  // Audio element reference
  const audioRef = useRef(new Audio());
  // YouTube background player reference
  const ytPlayerRef = useRef(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.8);

  // Modes
  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.REPEAT) || 'off'; // 'off' | 'all' | 'one'
  });

  // Queue & Navigation
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // User Library Persistence
  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'favorites-default',
        name: 'My Vibe Playlist',
        description: 'Chill, energetic, and favorite top hits',
        tracks: [],
        createdAt: new Date().toISOString()
      }
    ];
  });

  // UI Panels
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activeTrackForPlaylist, setActiveTrackForPlaylist] = useState(null);

  // First-time Onboarding & Preferences
  const [userPreferences, setUserPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return saved ? JSON.parse(saved) : { languages: [], artists: [], isCompleted: false };
    } catch {
      return { languages: [], artists: [], isCompleted: false };
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!saved) return true;
      const parsed = JSON.parse(saved);
      return !parsed.isCompleted;
    } catch {
      return true;
    }
  });

  const saveUserPreferences = useCallback((prefs) => {
    setUserPreferences(prefs);
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  }, []);

  // Active View Router
  const [currentView, setCurrentView] = useState('discover'); // 'discover' | 'search' | 'artists' | 'liked' | 'history' | 'playlist' | 'artist-detail' | 'now-playing'
  const [previousView, setPreviousView] = useState('discover');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedTracks));
  }, [likedTracks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPEAT, repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHUFFLE, String(isShuffle));
  }, [isShuffle]);

  // Handle audio element events
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    const handleError = (e) => {
      console.warn('Audio playback error, attempting recovery:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [repeatMode, volume, isMuted]);

  /**
   * Play a specific track
   * YouTube path: show loader + update state only.
   * YouTubeBackgroundPlayer (Effect on youtubeId) handles loadVideoById + double-play.
   */
  const playTrack = useCallback(async (track, newQueue = null, index = -1, openScreen = true) => {
    if (!track) return;
    const audio = audioRef.current;

    // Navigate to 'now-playing' view (Left: Image, Right: Name, Below: Suggestions)
    if (openScreen) {
      setCurrentView(curr => {
        if (curr !== 'now-playing') {
          setPreviousView(curr);
        }
        return 'now-playing';
      });
      setIsFullScreen(false);
    }

    try {
      const isYt = track.source === 'youtube' || Boolean(track.youtubeId);

      if (isYt) {
        audio.pause();
        audio.src = '';

        // Show loader so user sees feedback immediately
        setIsLoading(true);

        // Update state — YouTubeBackgroundPlayer effect fires on youtubeId change
        setCurrentTrack({ ...track, source: 'youtube' });
        setCurrentTime(0);
        setDuration(track.duration || 210);
        setIsPlaying(true);
        // Loader will be cleared by YouTubeBackgroundPlayer after double-play attempt
      } else {
        // Direct Audio path
        setIsLoading(true);
        const streamUrl = track.source === 'direct'
          ? track.streamUrl
          : await getTrackStreamUrl(track.id);

        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }

        audio.src = streamUrl;
        audio.load();

        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(track.duration || 0);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
        setIsLoading(false);
      }

      // History & analytics
      setHistory(prev => {
        const filtered = prev.filter(t => t.id !== track.id);
        return [track, ...filtered];
      });
      recordTrackStream(track);

      // Auto-save YouTube songs to DB so they play even when API quota is gone
      if (track.youtubeId) {
        saveSongToDB(track).catch(() => {});
      }

      // Queue management
      if (newQueue && Array.isArray(newQueue)) {
        setQueue(newQueue);
        setQueueIndex(index >= 0 ? index : newQueue.findIndex(t => t.id === track.id));
      } else {
        setQueue(prev => {
          if (!prev.find(t => t.id === track.id)) return [...prev, track];
          return prev;
        });
      }
    } catch (err) {
      console.error('Error starting audio stream:', err);
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle Play / Pause
   */
  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0], queue, 0);
      }
      return;
    }

    const isYt = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);
    if (isYt) {
      if (isPlaying) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      } else {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
        }
        setIsPlaying(true);
      }
    } else {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  }, [currentTrack, isPlaying, queue, playTrack]);

  /**
   * Play Next track in queue
   */
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setQueueIndex(randomIndex);
      playTrack(queue[randomIndex], queue, randomIndex);
      return;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex], queue, nextIndex);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playTrack(queue[0], queue, 0);
    } else {
      setIsPlaying(false);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playTrack]);

  /**
   * Seek to specific second
   */
  const seek = useCallback((targetTime) => {
    const clampedTime = Math.max(0, Math.min(targetTime, duration || 1000));
    setCurrentTime(clampedTime);

    const isYt = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
    if (isYt) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(clampedTime, true);
      }
    } else {
      audioRef.current.currentTime = clampedTime;
    }
  }, [duration, currentTrack]);

  /**
   * Play Previous track in queue
   */
  const playPrevious = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (queue.length === 0) return;

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      playTrack(queue[prevIndex], queue, prevIndex);
    } else {
      seek(0);
    }
  }, [queue, queueIndex, currentTime, playTrack, seek]);

  /**
   * Set volume level (0 to 1)
   */
  const setVolumeLevel = useCallback((val) => {
    const clamped = Math.max(0, Math.min(val, 1));
    setVolume(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
    audioRef.current.volume = isMuted ? 0 : clamped;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume((isMuted ? 0 : clamped) * 100);
    }
  }, [isMuted]);

  /**
   * Toggle Mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(0);
        }
      } else {
        const v = previousVolume || 0.8;
        audioRef.current.volume = v;
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(v * 100);
        }
      }
      return next;
    });
  }, [volume, previousVolume]);

  /**
   * Toggle Shuffle Mode
   */
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  /**
   * Cycle Repeat Mode (off -> all -> one -> off)
   */
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  /**
   * Add single track to queue
   */
  const addToQueue = useCallback((track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  /**
   * Play next immediately after current
   */
  const playNextInQueue = useCallback((track) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const insertAt = queueIndex + 1;
      newQueue.splice(insertAt, 0, track);
      return newQueue;
    });
  }, [queueIndex]);

  /**
   * Remove item from queue
   */
  const removeFromQueue = useCallback((indexToRemove) => {
    setQueue(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (indexToRemove < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  }, [queueIndex]);

  /**
   * Clear all queued tracks
   */
  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  }, [currentTrack]);

  /**
   * Like / Favorite toggle
   */
  const toggleLike = useCallback((track) => {
    if (!track) return;
    setLikedTracks(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [track, ...prev];
      }
    });
  }, []);

  const isLiked = useCallback((trackId) => {
    return likedTracks.some(t => t.id === trackId);
  }, [likedTracks]);

  /**
   * Custom Playlists Operations
   */
  const createPlaylist = useCallback((name, description = '') => {
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: name.trim() || 'New Playlist',
      description: description.trim(),
      tracks: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    return newPlaylist;
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setCurrentView('discover');
      setSelectedPlaylistId(null);
    }
  }, [selectedPlaylistId]);

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          if (p.tracks.some(t => t.id === track.id)) return p;
          return { ...p, tracks: [track, ...p.tracks] };
        }
        return p;
      })
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
        }
        return p;
      })
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = {
    audioRef,
    ytPlayerRef,
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    likedTracks,
    history,
    playlists,
    isQueueOpen,
    isFullScreen,
    isShortcutsOpen,
    isPlaylistModalOpen,
    activeTrackForPlaylist,
    userPreferences,
    isOnboardingOpen,
    currentView,
    selectedPlaylistId,
    selectedArtist,
    searchQuery,
    selectedGenre,

    // Setters & Actions
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    addToQueue,
    playNextInQueue,
    removeFromQueue,
    clearQueue,
    toggleLike,
    isLiked,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    clearHistory,
    saveUserPreferences,
    setIsOnboardingOpen,
    setIsQueueOpen,
    setIsFullScreen,
    setIsShortcutsOpen,
    setIsPlaylistModalOpen,
    setActiveTrackForPlaylist,
    setCurrentView,
    previousView,
    setPreviousView,
    setSelectedPlaylistId,
    setSelectedArtist,
    setSearchQuery,
    setSelectedGenre
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
