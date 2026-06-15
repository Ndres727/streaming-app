import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '@streaming/api-client';
import { usePlayer, Song } from '../contexts/PlayerContext';

interface Props {
  route: { params: { playlistId: string } };
  navigation: any;
}

export default function PlaylistDetailScreen({ route, navigation }: Props) {
  const { playlistId } = route.params;
  const { token, playSong, currentSong } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState<Song[]>([]);

  useEffect(() => {
    Promise.all([
      api.getPlaylist(playlistId, token),
      api.getSongs(token),
    ])
      .then(([pl, songs]) => {
        setPlaylist(pl);
        setAllSongs(songs as Song[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [playlistId, token]);

  const handleAddSong = () => {
    const available = allSongs.filter(
      (s) => !playlist.songs.find((ps: any) => ps.id === s.id),
    );

    if (available.length === 0) {
      Alert.alert('All songs already in playlist');
      return;
    }

    const options = available.map((s) => s.title);
    // Simple picker — show first few in alert
    Alert.alert('Add Song', 'Feature: pick from list', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add first available',
        onPress: async () => {
          if (available[0]) {
            await api.addSongToPlaylist(playlistId, available[0].id, token);
            const updated = await api.getPlaylist(playlistId, token);
            setPlaylist(updated);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {playlist.name}
        </Text>
        <TouchableOpacity onPress={handleAddSong}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {playlist.description && (
        <Text style={styles.description}>{playlist.description}</Text>
      )}

      <Text style={styles.songCount}>{playlist.songs?.length || 0} songs</Text>

      <FlatList
        data={playlist.songs || []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No songs in this playlist</Text>}
        renderItem={({ item }: { item: Song }) => (
          <TouchableOpacity
            style={[styles.songItem, currentSong?.id === item.id && styles.songItemActive]}
            onPress={() => playSong(item)}
          >
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <Text style={styles.songDuration}>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#f4f4f5', flex: 1, textAlign: 'center' },
  addBtn: { color: '#22c55e', fontSize: 16, fontWeight: '600' },
  description: { color: '#a1a1aa', fontSize: 14, paddingHorizontal: 20, marginBottom: 4 },
  songCount: { color: '#71717a', fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 16 },
  emptyText: { color: '#a1a1aa', fontSize: 16 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  songItemActive: { backgroundColor: '#18181b' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, color: '#f4f4f5', fontWeight: '500' },
  songArtist: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
  songDuration: { fontSize: 13, color: '#71717a' },
});
