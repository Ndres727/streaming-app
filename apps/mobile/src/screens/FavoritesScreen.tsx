import React, { useEffect, useState, useCallback } from 'react';
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
  navigation: any;
}

export default function FavoritesScreen({ navigation }: Props) {
  const { token, playSong, currentSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await api.getFavorites(token);
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggle = async (songId: string) => {
    await api.toggleFavorite(songId, token);
    fetchFavorites();
  };

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
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No favorites yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.songItem, currentSong?.id === item.id && styles.active]}
            onPress={() => playSong(item)}
          >
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.heartBtn}>
              <Text style={styles.heart}>❤️</Text>
            </TouchableOpacity>
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
    paddingBottom: 16,
  },
  backBtn: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f4f4f5' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 60, fontSize: 16 },
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
  heartBtn: { padding: 8 },
  heart: { fontSize: 18 },
});
