import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import { PlayerProvider } from './src/contexts/PlayerContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PlaylistDetailScreen from './src/screens/PlaylistDetailScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import QueueScreen from './src/screens/QueueScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';
import NowPlayingBar from './src/components/NowPlayingBar';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const LibraryStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#22c55e',
    background: '#09090b',
    card: '#18181b',
    text: '#f4f4f5',
    border: '#27272a',
    notification: '#22c55e',
  },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Search: '🔍',
    Library: '📚',
  };
  return (
    <View style={[tabStyles.icon, focused ? tabStyles.active : tabStyles.inactive]}>
      <Text style={tabStyles.emoji}>{icons[label] || '●'}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  icon: { opacity: 0.4 },
  active: { opacity: 1 },
  inactive: { opacity: 0.4 },
  emoji: { fontSize: 20 },
});

function HomeNavigator({ token, onLogout }: { token: string; onLogout: () => void }) {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain">
        {(props) => <HomeScreen {...props} token={token} onLogout={onLogout} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Favorites" component={FavoritesScreen} />
      <HomeStack.Screen name="Albums" component={AlbumsScreen} />
      <HomeStack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
    </HomeStack.Navigator>
  );
}

function LibraryNavigator({ token }: { token: string }) {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryHome">
        {(props) => <LibraryScreen {...props} token={token} />}
      </LibraryStack.Screen>
      <LibraryStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <LibraryStack.Screen name="Favorites" component={FavoritesScreen} />
      <LibraryStack.Screen name="Albums" component={AlbumsScreen} />
      <LibraryStack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
    </LibraryStack.Navigator>
  );
}

function MainTabs({ token, onLogout, navigation }: { token: string; onLogout: () => void; navigation: any }) {
  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#18181b',
            borderTopColor: '#27272a',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: '#71717a',
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeNavigator {...props} token={token} onLogout={onLogout} />}
        </Tab.Screen>
        <Tab.Screen name="Search">
          {(props) => <SearchScreen {...props} token={token} />}
        </Tab.Screen>
        <Tab.Screen name="Library">
          {(props) => <LibraryNavigator token={token} />}
        </Tab.Screen>
      </Tab.Navigator>

      <NowPlayingBar onPress={() => navigation.navigate('Player')} />
    </View>
  );
}

function AppInner({ token: initialToken }: { token: string | null }) {
  const { setToken: setPlayerToken } = usePlayer();

  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('accessToken')
      .then((stored) => {
        setToken(stored);
        setPlayerToken(stored);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPlayerToken(token);
  }, [token, setPlayerToken]);

  const handleAuth = async (accessToken: string) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    setPlayerToken(accessToken);
    setToken(accessToken);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setPlayerToken(null);
    setToken(null);
  };

  if (loading) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main">
              {(props) => (
                <MainTabs {...props} token={token} onLogout={handleLogout} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Queue"
              component={QueueScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onAuth={handleAuth} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('accessToken')
      .then((stored) => setToken(stored))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <PlayerProvider>
      <AppInner token={token} />
    </PlayerProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    position: 'relative',
  },
});
