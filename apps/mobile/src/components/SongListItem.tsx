import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePlayer, Song } from '../contexts/PlayerContext';
import { downloadManager } from '../services/downloadManager';

interface Props {
  song: Song;
  onPlay: (song: Song) => void;
  isActive?: boolean;
}

export default function SongListItem({ song, onPlay, isActive }: Props) {
  const { downloadSong, removeDownload, downloadingIds } = usePlayer();
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    downloadManager.isDownloaded(song.id).then(setIsDownloaded);
  }, [song.id]);

  const isDownloading = downloadingIds.has(song.id);

  const handleDownload = async () => {
    if (isDownloading) return;
    if (isDownloaded) {
      await removeDownload(song.id);
      setIsDownloaded(false);
    } else {
      await downloadSong(song);
      setIsDownloaded(true);
    }
  };

  return (
    <View style={[styles.wrapper, isActive && styles.active]}>
      <TouchableOpacity style={styles.songInfo} onPress={() => onPlay(song)}>
        <View style={styles.textInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {song.artist} · {song.album}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Text style={styles.duration}>
          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
        </Text>

        <TouchableOpacity onPress={handleDownload} style={styles.dlBtn} disabled={isDownloading}>
          {isDownloading ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <Text style={styles.dlIcon}>{isDownloaded ? '✅' : '⬇️'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  active: { backgroundColor: '#18181b' },
  songInfo: { flex: 1 },
  textInfo: {},
  songTitle: { fontSize: 15, color: '#f4f4f5', fontWeight: '500' },
  songArtist: { fontSize: 12, color: '#a1a1aa', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  duration: { fontSize: 12, color: '#71717a' },
  dlBtn: { width: 28, alignItems: 'center', justifyContent: 'center' },
  dlIcon: { fontSize: 16 },
});
