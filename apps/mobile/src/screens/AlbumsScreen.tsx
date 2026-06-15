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

interface Album {
  album: string;
  artist: string;
  coverUrl: string | null;
  songCount: number;
}

export default function AlbumsScreen({ navigation }: { navigation: any }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlbums()
      .then(setAlbums)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <Text style={styles.title}>Albums</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={albums}
        keyExtractor={(item) => `${item.album}|${item.artist}`}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<Text style={styles.empty}>No albums found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.albumCard}
            onPress={() =>
              navigation.navigate('AlbumDetail', {
                album: item.album,
                artist: item.artist,
                token,
              })
            }
          >
            <View style={styles.cover}>
              <Text style={styles.coverEmoji}>💿</Text>
            </View>
            <Text style={styles.albumName} numberOfLines={1}>
              {item.album}
            </Text>
            <Text style={styles.albumArtist} numberOfLines={1}>
              {item.artist}
            </Text>
            <Text style={styles.songCount}>{item.songCount} songs</Text>
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
  list: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 60, fontSize: 16 },
  albumCard: {
    width: '48%',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  coverEmoji: { fontSize: 36 },
  albumName: { color: '#f4f4f5', fontSize: 14, fontWeight: '600' },
  albumArtist: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  songCount: { color: '#71717a', fontSize: 11, marginTop: 2 },
});
