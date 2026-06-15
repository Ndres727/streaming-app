import type { AuthResponse, Song, Playlist, UserProfile } from '@streaming/shared-types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://streaming-app-production-906a.up.railway.app/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getProfile: (token: string) =>
    request<UserProfile>('/auth/me', { headers: authHeaders(token) }),

  // Songs
  getSongs: (token: string, search?: string) =>
    request<Song[]>(`/songs${search ? `?q=${encodeURIComponent(search)}` : ''}`, {
      headers: authHeaders(token),
    }),

  getSong: (id: string, token: string) =>
    request<Song>(`/songs/${id}`, { headers: authHeaders(token) }),

  // Playlists
  getPlaylists: (token: string) =>
    request<Playlist[]>('/playlists', { headers: authHeaders(token) }),

  getPlaylist: (id: string, token: string) =>
    request<Playlist>(`/playlists/${id}`, { headers: authHeaders(token) }),

  createPlaylist: (data: { name: string; description?: string; isPublic?: boolean }, token: string) =>
    request<Playlist>('/playlists', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),

  addSongToPlaylist: (playlistId: string, songId: string, token: string) =>
    request<Playlist>(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId }),
      headers: authHeaders(token),
    }),

  removeSongFromPlaylist: (playlistId: string, songId: string, token: string) =>
    request<void>(`/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  deletePlaylist: (id: string, token: string) =>
    request<void>(`/playlists/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  // Favorites
  getFavorites: (token: string) =>
    request<Song[]>('/favorites', { headers: authHeaders(token) }),

  toggleFavorite: (songId: string, token: string) =>
    request<{ favorited: boolean }>(`/favorites/${songId}/toggle`, {
      method: 'POST',
      headers: authHeaders(token),
    }),

  isFavorited: (songId: string, token: string) =>
    request<boolean>(`/favorites/${songId}`, { headers: authHeaders(token) }),

  // Recently Played
  getRecentlyPlayed: (token: string, limit?: number) =>
    request<Song[]>(`/recently-played${limit ? `?limit=${limit}` : ''}`, {
      headers: authHeaders(token),
    }),

  trackPlay: (songId: string, token: string) =>
    request<void>(`/recently-played/${songId}`, {
      method: 'POST',
      headers: authHeaders(token),
    }),

  // Albums
  getAlbums: () => request<Array<{ album: string; artist: string; coverUrl: string | null; songCount: number }>>('/albums'),

  getAlbumSongs: (album: string, artist?: string) =>
    request<Song[]>(`/albums/${encodeURIComponent(album)}${artist ? `?artist=${encodeURIComponent(artist)}` : ''}`),

  // Radio
  getRadio: (songId: string, limit?: number) =>
    request<Song[]>(`/radio/${songId}${limit ? `?limit=${limit}` : ''}`),

  // Downloads
  getDownloads: (token: string) =>
    request<Song[]>('/downloads', { headers: authHeaders(token) }),

  markDownloaded: (songId: string, localUri: string, token: string) =>
    request<any>(`/downloads/${songId}`, {
      method: 'POST',
      body: JSON.stringify({ localUri }),
      headers: authHeaders(token),
    }),

  removeDownload: (songId: string, token: string) =>
    request<void>(`/downloads/${songId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),
};
