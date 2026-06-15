import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { usePlayer, Song } from '../contexts/PlayerContext';

interface Props {
  navigation: any;
}

export default function QueueScreen({ navigation }: Props) {
  const { queue, removeFromQueue, clearQueue, playSong, currentSong } = usePlayer();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Up Next</Text>
        <TouchableOpacity onPress={clearQueue}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      {currentSong && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowPlayingLabel}>Now Playing</Text>
          <Text style={styles.nowPlayingTitle}>{currentSong.title}</Text>
          <Text style={styles.nowPlayingArtist}>{currentSong.artist}</Text>
        </View>
      )}

      <FlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Queue is empty</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.queueItem}>
            <TouchableOpacity style={styles.songInfo} onPress={() => playSong(item)}>
              <Text style={styles.queueIndex}>{index + 1}</Text>
              <View style={styles.songText}>
                <Text style={styles.songTitle}>{item.title}</Text>
                <Text style={styles.songArtist}>{item.artist}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFromQueue(index)}>
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#f4f4f5' },
  clearBtn: { color: '#f87171', fontSize: 14 },
  nowPlaying: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  nowPlayingLabel: { color: '#22c55e', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  nowPlayingTitle: { color: '#f4f4f5', fontSize: 16, fontWeight: '500' },
  nowPlayingArtist: { color: '#a1a1aa', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 16 },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  songInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  queueIndex: { color: '#71717a', fontSize: 14, width: 28 },
  songText: { flex: 1 },
  songTitle: { color: '#f4f4f5', fontSize: 15, fontWeight: '500' },
  songArtist: { color: '#a1a1aa', fontSize: 12, marginTop: 1 },
  removeBtn: { color: '#71717a', fontSize: 16, padding: 8 },
});
