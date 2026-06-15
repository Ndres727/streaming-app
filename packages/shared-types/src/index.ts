import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────
export const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(50),
});

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

// ─── User ──────────────────────────────────────────────────────────
export const UserProfile = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
});

// ─── Song ──────────────────────────────────────────────────────────
export const Song = z.object({
  id: z.string().uuid(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number().positive(),
  coverUrl: z.string().nullable(),
  audioUrl: z.string(),
  hlsUrl: z.string().nullable(),
  genres: z.array(z.string()),
  status: z.enum(['processing', 'ready', 'error']),
  createdAt: z.string().datetime(),
});

export const CreateSongInput = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  album: z.string().max(200).default('Unknown Album'),
  genres: z.array(z.string()).default([]),
});

// ─── Playlist ──────────────────────────────────────────────────────
export const Playlist = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  isPublic: z.boolean(),
  ownerId: z.string().uuid(),
  songs: z.array(Song),
  createdAt: z.string().datetime(),
});

export const CreatePlaylistInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const AddSongToPlaylistInput = z.object({
  playlistId: z.string().uuid(),
  songId: z.string().uuid(),
});

// ─── Search ────────────────────────────────────────────────────────
export const SearchResult = z.object({
  songs: z.array(Song),
  totalCount: z.number(),
});

// ─── Types ─────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof RegisterInput>;
export type LoginInput = z.infer<typeof LoginInput>;
export type AuthResponse = z.infer<typeof AuthResponse>;
export type UserProfile = z.infer<typeof UserProfile>;
export type Song = z.infer<typeof Song>;
export type CreateSongInput = z.infer<typeof CreateSongInput>;
export type Playlist = z.infer<typeof Playlist>;
export type CreatePlaylistInput = z.infer<typeof CreatePlaylistInput>;
export type AddSongToPlaylistInput = z.infer<typeof AddSongToPlaylistInput>;
export type SearchResult = z.infer<typeof SearchResult>;
