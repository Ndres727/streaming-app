import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DownloadsService {
  constructor(private readonly prisma: PrismaService) {}

  async markDownloaded(userId: string, songId: string, localUri: string) {
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) throw new NotFoundException('Song not found');

    return this.prisma.download.upsert({
      where: { userId_songId: { userId, songId } },
      create: { userId, songId, localUri },
      update: { localUri, downloadedAt: new Date() },
    });
  }

  async findAll(userId: string) {
    const downloads = await this.prisma.download.findMany({
      where: { userId },
      include: { song: true },
      orderBy: { downloadedAt: 'desc' },
    });
    return downloads.map((d) => ({ ...d.song, localUri: d.localUri }));
  }

  async remove(userId: string, songId: string) {
    await this.prisma.download.deleteMany({ where: { userId, songId } });
  }
}
