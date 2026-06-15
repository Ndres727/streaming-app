import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { api } from '@streaming/api-client';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;
const INDEX_KEY = 'downloaded_songs_index';

interface DownloadIndex {
  [songId: string]: {
    localUri: string;
    title: string;
    artist: string;
    downloadedAt: string;
  };
}

async function ensureDir() {
  const dir = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
}

async function getIndex(): Promise<DownloadIndex> {
  try {
    const raw = await SecureStore.getItemAsync(INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveIndex(index: DownloadIndex) {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(index));
}

export const downloadManager = {
  async isDownloaded(songId: string): Promise<boolean> {
    const index = await getIndex();
    return !!index[songId];
  },

  async getLocalUri(songId: string): Promise<string | null> {
    const index = await getIndex();
    const entry = index[songId];
    if (!entry) return null;

    const exists = await FileSystem.getInfoAsync(entry.localUri);
    return exists.exists ? entry.localUri : null;
  },

  async getAllDownloaded(): Promise<DownloadIndex> {
    return getIndex();
  },

  async downloadSong(songId: string, audioUrl: string, title: string, artist: string, token: string): Promise<string> {
    await ensureDir();

    const ext = audioUrl.includes('.mp3') ? '.mp3' : '.mp4';
    const filename = `${songId}${ext}`;
    const localUri = `${DOWNLOADS_DIR}${filename}`;

    const existing = await FileSystem.getInfoAsync(localUri);
    if (existing.exists) {
      return localUri;
    }

    const downloadResumable = FileSystem.createDownloadResumable(audioUrl, localUri);
    const result = await downloadResumable.downloadAsync();

    if (!result || !result.uri) {
      throw new Error('Download failed');
    }

    // Mark in backend
    await api.markDownloaded(songId, result.uri, token).catch(() => {});

    // Update index
    const index = await getIndex();
    index[songId] = {
      localUri: result.uri,
      title,
      artist,
      downloadedAt: new Date().toISOString(),
    };
    await saveIndex(index);

    return result.uri;
  },

  async removeDownload(songId: string, token: string): Promise<void> {
    const index = await getIndex();
    const entry = index[songId];

    if (entry) {
      await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
      delete index[songId];
      await saveIndex(index);
    }

    await api.removeDownload(songId, token).catch(() => {});
  },

  async clearDownloads(token: string): Promise<void> {
    const index = await getIndex();
    const ids = Object.keys(index);

    for (const id of ids) {
      try {
        await FileSystem.deleteAsync(index[id].localUri, { idempotent: true });
      } catch {}
    }

    await SecureStore.deleteItemAsync(INDEX_KEY);

    for (const id of ids) {
      await api.removeDownload(id, token).catch(() => {});
    }
  },
};
