import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../contexts/PlayerContext';
import { downloadManager } from '../services/downloadManager';

interface Props {
  onPress: () => void;
}

export default function NowPlayingBar({ onPress }: Props) {
  const { currentSong, isPlaying, togglePlayPause, formatTime, position, duration, isOnline } = usePlayer();
  const [isDownloaded, setIsDownloaded] = React.useState(false);

  React.useEffect(() => {
    if (currentSong) {
      downloadManager.isDownloaded(currentSong.id).then(setIsDownloaded);
    }
  }, [currentSong?.id]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {!isOnline && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.coverSmall}>
            <Text style={styles.coverEmoji}>🎵</Text>
            {!isOnline && <View style={styles.offlineDot} />}
          </View>
          <View style={styles.textInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentSong.artist} {isDownloaded ? '💾' : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  offlineBadge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 2,
    alignItems: 'center',
  },
  offlineText: { color: '#09090b', fontSize: 11, fontWeight: '600' },
  progressBar: { height: 2, backgroundColor: '#27272a' },
  progressFill: { height: '100%', backgroundColor: '#22c55e' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 24,
  },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  coverSmall: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  coverEmoji: { fontSize: 18 },
  offlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  textInfo: { flex: 1 },
  songTitle: { color: '#f4f4f5', fontSize: 14, fontWeight: '500' },
  artistName: { color: '#a1a1aa', fontSize: 12, marginTop: 1 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 16 },
});
