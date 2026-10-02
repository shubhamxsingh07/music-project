import React, { useEffect, useRef } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function YouTubeBackgroundPlayer() {
  const {
    ytPlayerRef,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    playNext,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
  } = useMusicPlayer();

  const isReadyRef   = useRef(false);
  const tickerRef    = useRef(null);
  const retryRef     = useRef(null);   // holds the second-click timer

  // Stale-closure-free refs for YT callbacks
  const isPlayingRef  = useRef(isPlaying);
  const repeatModeRef = useRef(repeatMode);
  const playNextRef   = useRef(playNext);
  const volumeRef     = useRef(volume);
  const isMutedRef    = useRef(isMuted);
  const setIsPlayingRef  = useRef(setIsPlaying);
  const setDurationRef   = useRef(setDuration);
  const setIsLoadingRef  = useRef(setIsLoading);

  useEffect(() => {
    isPlayingRef.current   = isPlaying;
    repeatModeRef.current  = repeatMode;
    playNextRef.current    = playNext;
    volumeRef.current      = volume;
    isMutedRef.current     = isMuted;
    setIsPlayingRef.current  = setIsPlaying;
    setDurationRef.current   = setDuration;
    setIsLoadingRef.current  = setIsLoading;
  });

  const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);

  // ── Init YT IFrame Player once ─────────────────────────────────────────────
  useEffect(() => {
    let interval = null;

    const createPlayer = () => {
      if (ytPlayerRef.current || !window.YT?.Player) return;
      if (!document.getElementById('youtube-audio-engine')) return;

      ytPlayerRef.current = new window.YT.Player('youtube-audio-engine', {
        height: '1', width: '1',
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, playsinline: 1,
          enablejsapi: 1, origin: window.location.origin,
        },
        events: {
          onReady: () => {
            isReadyRef.current = true;
            try { ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : volumeRef.current * 100); } catch (_) {}
            setIsLoadingRef.current(false);
          },
          onStateChange: (e) => {
            if (e.data === 1) {                       // PLAYING
              setIsLoadingRef.current(false);
              setIsPlayingRef.current(true);
              try {
                const d = e.target.getDuration();
                if (d > 0) setDurationRef.current(d);
              } catch (_) {}
            } else if (e.data === 2) {               // PAUSED
              setIsLoadingRef.current(false);
              if (!isPlayingRef.current) setIsPlayingRef.current(false);
            } else if (e.data === 0) {               // ENDED
              setIsLoadingRef.current(false);
              if (repeatModeRef.current === 'one') {
                try { e.target.seekTo(0, true); e.target.playVideo(); } catch (_) {}
              } else {
                playNextRef.current?.();
              }
            } else if (e.data === 5 || e.data === -1) { // CUED / UNSTARTED
              if (isPlayingRef.current) {
                try { e.target.playVideo(); } catch (_) {}
              }
            }
          },
          onError: () => {
            setIsLoadingRef.current(false);
            setTimeout(() => playNextRef.current?.(), 1500);
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      interval = setInterval(() => {
        if (window.YT?.Player && !ytPlayerRef.current) {
          createPlayer();
          clearInterval(interval);
        }
      }, 200);
    }

    return () => { if (interval) clearInterval(interval); };
  }, []); // eslint-disable-line

  // ── Track changed → show loader, fire play TWICE ──────────────────────────
  useEffect(() => {
    if (retryRef.current) clearTimeout(retryRef.current);

    if (!isYouTube || !currentTrack?.youtubeId) {
      try { ytPlayerRef.current?.pauseVideo?.(); } catch (_) {}
      return;
    }

    if (!isReadyRef.current || !ytPlayerRef.current) return;

    const ytid = currentTrack.youtubeId;

    // Show loader
    setIsLoading(true);

    // ── CLICK #1 ──────────────────────────────────────────────────────────────
    try {
      ytPlayerRef.current.loadVideoById(ytid, 0);
      ytPlayerRef.current.playVideo();
    } catch (_) {}

    // ── CLICK #2 (after 400 ms) — guarantees playback if first call was lost ─
    retryRef.current = setTimeout(() => {
      try {
        const state = ytPlayerRef.current?.getPlayerState?.();
        // If not already playing (state 1), force play again
        if (state !== 1) {
          ytPlayerRef.current?.playVideo?.();
        }
      } catch (_) {}
      // Hide loader after second attempt
      setIsLoading(false);
    }, 400);

    return () => { if (retryRef.current) clearTimeout(retryRef.current); };
  }, [currentTrack?.youtubeId]); // eslint-disable-line

  // ── Play / Pause toggle ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isYouTube || !isReadyRef.current || !ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo?.();
      } else {
        ytPlayerRef.current.pauseVideo?.();
      }
    } catch (_) {}
  }, [isPlaying]); // eslint-disable-line

  // ── Volume / Mute ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !ytPlayerRef.current) return;
    try { ytPlayerRef.current.setVolume?.(isMuted ? 0 : volume * 100); } catch (_) {}
  }, [volume, isMuted]);

  // ── Progress ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying && isYouTube) {
      tickerRef.current = setInterval(() => {
        if (!isReadyRef.current || !ytPlayerRef.current) return;
        try {
          const cur = ytPlayerRef.current.getCurrentTime?.();
          if (cur != null && !isNaN(cur)) setCurrentTime(cur);
          const dur = ytPlayerRef.current.getDuration?.();
          if (dur > 0 && !isNaN(dur)) setDuration(dur);
        } catch (_) {}
      }, 250);
    } else {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    return () => { clearInterval(tickerRef.current); tickerRef.current = null; };
  }, [isPlaying, isYouTube, setCurrentTime, setDuration]);

  return (
    <div
      style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none', zIndex: -9999 }}
      aria-hidden="true"
    >
      <div id="youtube-audio-engine" />
    </div>
  );
}
