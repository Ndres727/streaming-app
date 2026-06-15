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
import SongListItem from '../components/SongListItem';

interface Props {
  token: string;
  onLogout: () => void;
  navigation: any;
}

export default function HomeScreen({ token, onLogout, navigation }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong } = usePlayer();

  useEffect(() => {
    Promise.all([
      api.getSongs(token),
      api.getRecentlyPlayed(token, 10),
    ])
      .then(([allSongs, recentSongs]) => {
        setSongs(allSongs);
        setRecent(recentSongs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <FlatList
            data={recent}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentCard}
                onPress={() => playSong(item)}
              >
                <View style={styles.recentCover}>
                  <Text style={styles.recentEmoji}>🎵</Text>
                </View>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.recentArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Songs</Text>
          <View style={styles.shortcuts}>
            <TouchableOpacity onPress={() => navigation.navigate('Favorites', { token })}>
              <Text style={styles.shortcutLink}>Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Albums', { token })} style={{ marginLeft: 12 }}>
              <Text style={styles.shortcutLink}>Albums</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>For You</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            onPlay={playSong}
            isActive={currentSong?.id === item.id}
          />
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
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5' },
  logout: { color: '#22c55e', fontSize: 14 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f4f4f5', marginBottom: 12 },
  shortcuts: { flexDirection: 'row', marginBottom: 12 },
  shortcutLink: { color: '#22c55e', fontSize: 14 },
  recentList: { paddingRight: 16 },
  recentCard: { width: 120, marginRight: 12 },
  recentCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentEmoji: { fontSize: 32 },
  recentTitle: { color: '#f4f4f5', fontSize: 13, fontWeight: '500' },
  recentArtist: { color: '#a1a1aa', fontSize: 11, marginTop: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
});
