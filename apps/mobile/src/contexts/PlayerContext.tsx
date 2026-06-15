import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Network from 'expo-network';
import { api } from '@streaming/api-client';
import { downloadManager } from '../services/downloadManager';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string | null;
  audioUrl: string;
  hlsUrl?: string | null;
  genres: string[];
  localUri?: string | null;
}

interface SleepTimer {
  remaining: number;
  total: number;
}

interface PlayerContextValue {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  sleepTimer: SleepTimer | null;
  queue: Song[];
  token: string | null;
  isOnline: boolean;
  setToken: (t: string | null) => void;
  playSong: (song: Song) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  formatTime: (millis: number) => string;
  downloadSong: (song: Song) => Promise<void>;
  removeDownload: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => Promise<boolean>;
  downloadingIds: Set<string>;
}

const PlayerContext = createContext<PlayerContextValue>(null!);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sleepTimer, setSleepTimerState] = useState<SleepTimer | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [token, setTokenState] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOnline(state.isConnected ?? true);
    };
    checkNetwork();
    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, []);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef<string | null>(null);

  const setToken = useCallback((t: string | null) => {
    tokenRef.current = t;
    setTokenState(t);
  }, []);

  const formatTime = useCallback((millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const loadAndPlay = useCallback(async (song: Song) => {
    // Check local storage first
    const localUri = await downloadManager.getLocalUri(song.id);
    const uri = localUri || song.hlsUrl || song.audioUrl;

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
    );
    soundRef.current = sound;
    setCurrentSong({ ...song, localUri: localUri || song.localUri });
    setIsPlaying(true);
    setPosition(0);
    setDuration(song.duration * 1000);

    // Track play (only if online)
    if (tokenRef.current && isOnline) {
      api.trackPlay(song.id, tokenRef.current).catch(() => {});
    }
  }, [isOnline]);

  const startPositionPolling = useCallback(() => {
    if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    positionIntervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.durationMillis) setDuration(status.durationMillis);
            if (status.didJustFinish) {
              setIsPlaying(false);
              soundRef.current.unloadAsync().catch(() => {});
              soundRef.current = null;

              setQueue((prev) => {
                const [nextSong, ...rest] = prev;
                if (nextSong) {
                  loadAndPlay(nextSong).catch(console.error);
                  return rest;
                }
                return prev;
              });
            }
          }
        } catch {
          // ignore polling errors
        }
      }
    }, 500);
  }, [loadAndPlay]);

  const stopPositionPolling = useCallback(() => {
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPositionPolling();
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playSong = useCallback(async (song: Song) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      await loadAndPlay(song);
      startPositionPolling();
    } catch (err) {
      console.error('Failed to play song:', err);
    }
  }, [loadAndPlay, startPositionPolling]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        stopPositionPolling();
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        startPositionPolling();
      }
    } catch (err) {
      console.error('Toggle play/pause failed:', err);
    }
  }, [isPlaying, startPositionPolling, stopPositionPolling]);

  const seekTo = useCallback(async (millis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
      setPosition(millis);
    }
  }, []);

  const previous = useCallback(async () => {
    if (position > 3000 && currentSong) {
      await seekTo(0);
      return;
    }
    // Go to previous in queue logic — for MVP just restart
    if (currentSong) {
      await playSong(currentSong);
    }
  }, [position, currentSong, playSong, seekTo]);

  const next = useCallback(async () => {
    if (queue.length > 0) {
      const [nextSong, ...rest] = queue;
      setQueue(rest);
      if (nextSong) {
        soundRef.current?.unloadAsync().catch(() => {});
        soundRef.current = null;
        await loadAndPlay(nextSong).catch(console.error);
      }
    }
  }, [queue, loadAndPlay]);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const isDownloaded = useCallback(async (songId: string): Promise<boolean> => {
    return downloadManager.isDownloaded(songId);
  }, []);

  const downloadSong = useCallback(async (song: Song) => {
    if (!token || downloadingIds.has(song.id)) return;
    setDownloadingIds((prev) => new Set(prev).add(song.id));
    try {
      const url = song.hlsUrl || song.audioUrl;
      await downloadManager.downloadSong(song.id, url, song.title, song.artist, token);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }
  }, [token, downloadingIds]);

  const removeDownload = useCallback(async (songId: string) => {
    if (!token) return;
    await downloadManager.removeDownload(songId, token);
  }, [token]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerState(null);
  }, []);

  const setSleepTimer = useCallback((minutes: number) => {
    cancelSleepTimer();

    const total = minutes * 60;
    setSleepTimerState({ remaining: total, total });

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerState((prev) => {
        if (!prev) return null;

        const newRemaining = prev.remaining - 1;

        if (newRemaining <= 0) {
          if (sleepTimerRef.current) {
            clearInterval(sleepTimerRef.current);
            sleepTimerRef.current = null;
          }
          if (soundRef.current) {
            soundRef.current.pauseAsync().catch(console.error);
          }
          setIsPlaying(false);
          stopPositionPolling();
          return null;
        }

        return { ...prev, remaining: newRemaining };
      });
    }, 1000);
  }, [cancelSleepTimer, stopPositionPolling]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        position,
        duration,
        sleepTimer,
        queue,
        token,
        isOnline,
        setToken,
        playSong,
        togglePlayPause,
        seekTo,
        next,
        previous,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setSleepTimer,
        cancelSleepTimer,
        formatTime,
        downloadSong,
        removeDownload,
        isDownloaded,
        downloadingIds,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
