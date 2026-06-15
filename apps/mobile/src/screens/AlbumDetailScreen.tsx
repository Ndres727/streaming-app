import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { api } from '@streaming/api-client';
import { usePlayer, Song } from '../contexts/PlayerContext';

interface Props {
  route: { params: { album: string; artist: string } };
  navigation: any;
}

export default function AlbumDetailScreen({ route, navigation }: Props) {
  const { album, artist } = route.params;
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong } = usePlayer();

  useEffect(() => {
    api.getAlbumSongs(album, artist)
      .then(setSongs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [album, artist]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{album}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.albumInfo}>
        <View style={styles.largeCover}>
          <Text style={styles.largeCoverEmoji}>💿</Text>
        </View>
        <Text style={styles.albumTitle}>{album}</Text>
        <Text style={styles.albumArtist}>{artist}</Text>
        <Text style={styles.songCount}>{songs.length} songs</Text>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.songItem, currentSong?.id === item.id && styles.active]}
            onPress={() => playSong(item)}
          >
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <Text style={styles.duration}>
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  centered: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backBtn: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#f4f4f5', flex: 1, textAlign: 'center' },
  albumInfo: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  largeCover: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeCoverEmoji: { fontSize: 56 },
  albumTitle: { fontSize: 22, fontWeight: 'bold', color: '#f4f4f5' },
  albumArtist: { fontSize: 16, color: '#a1a1aa', marginTop: 4 },
  songCount: { fontSize: 13, color: '#71717a', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  active: { backgroundColor: '#18181b' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, color: '#f4f4f5', fontWeight: '500' },
  songArtist: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
  duration: { fontSize: 13, color: '#71717a' },
});
