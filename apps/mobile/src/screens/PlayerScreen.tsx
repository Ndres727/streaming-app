import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { api } from '@streaming/api-client';
import { usePlayer } from '../contexts/PlayerContext';
import SleepTimerModal from '../components/SleepTimerModal';

interface Props {
  navigation: any;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PROGRESS_PADDING = 48;
const BAR_WIDTH = SCREEN_WIDTH - PROGRESS_PADDING * 2;

export default function PlayerScreen({ navigation }: Props) {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    queue,
    togglePlayPause,
    seekTo,
    next,
    previous,
    addToQueue,
    formatTime,
    sleepTimer,
    cancelSleepTimer,
    token,
    isOnline,
  } = usePlayer();

  const [showTimerModal, setShowTimerModal] = useState(false);
  const [radioMode, setRadioMode] = useState(false);
  const [favorited, setFavorited] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noSongText}>No song selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = duration > 0 ? position / duration : 0;

  const handleSeek = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / BAR_WIDTH));
    seekTo(ratio * duration);
  };

  const toggleFavorite = async () => {
    if (!token) return;
    const res = await api.toggleFavorite(currentSong.id, token);
    setFavorited(res.favorited);
  };

  const handleRadio = async () => {
    if (radioMode) {
      setRadioMode(false);
      return;
    }
    setRadioMode(true);
    const similar = await api.getRadio(currentSong.id, 10);
    for (const song of similar) {
      addToQueue(song);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Offline mode · Downloaded songs only</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.downBtn}>Now Playing</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Queue')}>
            <Text style={styles.queueBtn}>Queue ({queue.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowTimerModal(true)} style={{ marginLeft: 12 }}>
            <View style={styles.timerBtn}>
              <Text style={styles.timerText}>
                {sleepTimer
                  ? `${Math.floor(sleepTimer.remaining / 60)}:${(sleepTimer.remaining % 60).toString().padStart(2, '0')}`
                  : 'Sleep'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.artworkContainer}>
        <View style={styles.artwork}>
          <Text style={styles.artworkEmoji}>🎵</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={styles.artistName}>{currentSong.artist}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleFavorite}>
          <Text style={styles.actionIcon}>{favorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRadio}>
          <Text style={[styles.actionIcon, radioMode && styles.activeAction]}>
            {radioMode ? '📻' : '📡'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <TouchableOpacity activeOpacity={1} onPress={handleSeek} style={styles.barTouchArea}>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
          </View>
        </TouchableOpacity>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={previous} style={styles.skipBtn}>
          <Text style={styles.skipIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={next} style={styles.skipBtn}>
          <Text style={styles.skipIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <SleepTimerModal visible={showTimerModal} onClose={() => setShowTimerModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noSongText: { color: '#71717a', fontSize: 18 },
  offlineBanner: { backgroundColor: '#f59e0b', paddingVertical: 4, alignItems: 'center' },
  offlineBannerText: { color: '#09090b', fontSize: 12, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  downBtn: { color: '#f4f4f5', fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  queueBtn: { color: '#22c55e', fontSize: 14 },
  timerBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  timerText: { color: '#22c55e', fontSize: 12, fontWeight: '500' },
  artworkContainer: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkEmoji: { fontSize: 72 },
  info: { paddingHorizontal: 24, marginBottom: 12 },
  songTitle: { fontSize: 22, fontWeight: 'bold', color: '#f4f4f5' },
  artistName: { fontSize: 15, color: '#a1a1aa', marginTop: 4 },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 20,
    marginBottom: 20,
  },
  actionIcon: { fontSize: 22 },
  activeAction: { opacity: 1 },
  progressContainer: { paddingHorizontal: PROGRESS_PADDING, marginBottom: 24 },
  barTouchArea: { height: 32, justifyContent: 'center' },
  barBg: {
    height: 4,
    backgroundColor: '#3f3f46',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { color: '#71717a', fontSize: 12 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 24,
  },
  skipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: { fontSize: 20 },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 32 },
});
