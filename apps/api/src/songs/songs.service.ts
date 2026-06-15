import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TranscodingService } from '../transcoding/transcoding.service';

@Injectable()
export class SongsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly transcoding: TranscodingService,
  ) {}

  async findAll(search?: string) {
    if (search) {
      return this.prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
            { album: { contains: search, mode: 'insensitive' } },
          ],
          status: 'ready',
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.song.findMany({
      where: { status: 'ready' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) throw new NotFoundException('Song not found');
    return song;
  }

  async create(data: {
    title: string;
    artist: string;
    album?: string;
    genres?: string[];
    audioUrl: string;
    duration: number;
  }) {
    return this.prisma.song.create({
      data: {
        title: data.title,
        artist: data.artist,
        album: data.album || 'Unknown Album',
        genres: data.genres || [],
        audioUrl: data.audioUrl,
        duration: data.duration,
        status: 'processing',
      },
    });
  }

  async uploadAndCreate(
    file: Express.Multer.File,
    metadata: { title: string; artist: string; album?: string; genres?: string[] },
  ) {
    const key = `raw/${Date.now()}-${file.originalname}`;
    const audioUrl = await this.storage.uploadFile(key, file.buffer, file.mimetype);

    const song = await this.create({
      ...metadata,
      audioUrl,
      duration: 30, // placeholder — will be updated after transcoding
    });

    await this.transcoding.enqueueTranscode(song.id, key);

    return song;
  }

  async update(id: string, data: Partial<{ title: string; artist: string; album: string; genres: string[] }>) {
    const song = await this.findById(id);
    return this.prisma.song.update({ where: { id }, data });
  }

  async delete(id: string) {
    const song = await this.findById(id);
    await this.storage.deleteFile(song.audioUrl);
    if (song.hlsUrl) {
      const prefix = song.hlsUrl.replace(/\/master\.m3u8$/, '');
      // Delete HLS segments by prefix would need listing — simplified for MVP
    }
    return this.prisma.song.delete({ where: { id } });
  }

  async markAsReady(id: string, hlsUrl: string, duration: number) {
    return this.prisma.song.update({
      where: { id },
      data: { status: 'ready', hlsUrl, duration },
    });
  }
}
