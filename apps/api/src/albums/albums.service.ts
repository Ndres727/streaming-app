import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const songs = await this.prisma.song.findMany({
      where: { status: 'ready' },
      select: { album: true, artist: true, coverUrl: true },
      orderBy: { album: 'asc' },
    });

    const map = new Map<string, { album: string; artist: string; coverUrl: string | null; songCount: number }>();

    for (const s of songs) {
      const key = `${s.album}|${s.artist}`;
      if (!map.has(key)) {
        map.set(key, { album: s.album, artist: s.artist, coverUrl: s.coverUrl, songCount: 0 });
      }
      map.get(key)!.songCount++;
    }

    return Array.from(map.values());
  }

  async getSongs(album: string, artist?: string) {
    const where: any = { album, status: 'ready' };
    if (artist) where.artist = artist;

    const songs = await this.prisma.song.findMany({ where, orderBy: { title: 'asc' } });
    if (songs.length === 0) throw new NotFoundException('Album not found');
    return songs;
  }
}
