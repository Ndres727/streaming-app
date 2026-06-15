import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
  navigation: any;
}

export default function SearchScreen({ token, navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playSong, currentSong } = usePlayer();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.getSongs(token, query);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <TextInput
        style={styles.input}
        placeholder="Search songs, artists, albums..."
        placeholderTextColor="#71717a"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        autoCapitalize="none"
      />

      {loading && <ActivityIndicator style={styles.loading} size="large" color="#22c55e" />}

      {searched && !loading && results.length === 0 && (
        <Text style={styles.empty}>No results found</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
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
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginBottom: 16 },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f4f4f5',
    fontSize: 16,
    marginBottom: 16,
  },
  loading: { marginTop: 20 },
  empty: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 16 },
  list: { paddingBottom: 100 },
});
