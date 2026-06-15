import React, { useEffect, useState, useCallback } from 'react';
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

interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: any[];
}

interface Props {
  token: string;
  navigation: any;
}

export default function LibraryScreen({ token, navigation }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await api.getPlaylists(token);
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreatePlaylist = () => {
    Alert.alert('New Playlist', 'Enter a name', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: () => {
          api.createPlaylist({ name: `My Playlist #${playlists.length + 1}` }, token)
            .then(fetchPlaylists);
        },
      },
    ]);
  };

  const quickLinks = [
    { label: 'Favorites', emoji: '❤️', screen: 'Favorites' },
    { label: 'Albums', emoji: '💿', screen: 'Albums' },
  ];

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
        <Text style={styles.title}>Your Library</Text>
        <TouchableOpacity onPress={handleCreatePlaylist}>
          <Text style={styles.createBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickLinks}>
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.screen}
            style={styles.quickLink}
            onPress={() => navigation.navigate(link.screen, { token })}
          >
            <Text style={styles.quickEmoji}>{link.emoji}</Text>
            <Text style={styles.quickLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Playlists</Text>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No playlists yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id, token })}
          >
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverEmoji}>🎵</Text>
            </View>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistName}>{item.name}</Text>
              <Text style={styles.playlistMeta}>
                {item.songs?.length || 0} songs
              </Text>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5' },
  createBtn: { color: '#22c55e', fontSize: 16, fontWeight: '600' },
  quickLinks: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
  },
  quickEmoji: { fontSize: 20, marginRight: 8 },
  quickLabel: { color: '#f4f4f5', fontSize: 15, fontWeight: '500' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4f4f5',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 16 },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  coverEmoji: { fontSize: 24 },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 16, color: '#f4f4f5', fontWeight: '500' },
  playlistMeta: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
});
