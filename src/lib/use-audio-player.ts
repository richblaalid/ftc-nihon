'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

export type AudioPlayer = AudioPlayerState & AudioPlayerControls;

/**
 * Custom hook for HTML5 Audio playback.
 * Lazy-loads audio on first play to avoid blocking page load.
 * Falls back gracefully if audio fails to load.
 */
export function useAudioPlayer(audioUrl?: string, fallbackDuration?: number): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audioRef.current = null;
      }
    };
  }, []);

  /** Dispose current audio element and reset state (called on URL change). */
  const resetPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(fallbackDuration ?? 0);
    setIsLoading(false);
    setError(null);
  }, [fallbackDuration]);

  const getOrCreateAudio = useCallback((): HTMLAudioElement | null => {
    if (!audioUrl) return null;

    // If URL changed since last creation, reset and create fresh
    if (activeUrlRef.current !== audioUrl) {
      resetPlayer();
      activeUrlRef.current = audioUrl;
    }

    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = 'none';
    audio.src = audioUrl;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    });

    audio.addEventListener('waiting', () => {
      setIsLoading(true);
    });

    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });

    audioRef.current = audio;
    return audio;
  }, [audioUrl, resetPlayer]);

  // Play must be called synchronously from a user gesture for iOS Safari
  const play = useCallback(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;

    setIsLoading(true);
    setError(null);

    // audio.play() must be called synchronously in the click handler
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          // AbortError happens when play is interrupted (e.g., quick pause after play)
          if (err.name !== 'AbortError') {
            setError('Playback failed');
            setIsLoading(false);
          }
        });
    }
  }, [getOrCreateAudio]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || Infinity));
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration || Infinity);
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const skipBackward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - seconds, 0);
      setCurrentTime(audio.currentTime);
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    skipForward,
    skipBackward,
  };
}

/**
 * Format seconds as M:SS or H:MM:SS.
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
