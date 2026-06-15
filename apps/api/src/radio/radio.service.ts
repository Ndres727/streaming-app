import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RadioService {
  constructor(private readonly prisma: PrismaService) {}

  async getSimilar(songId: string, limit = 20) {
    const seed = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!seed) throw new NotFoundException('Song not found');

    const similar = await this.prisma.song.findMany({
      where: {
        id: { not: songId },
        status: 'ready',
        genres: { hasSome: seed.genres },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // If not enough matches by genre, fill with random songs
    if (similar.length < limit) {
      const extra = await this.prisma.song.findMany({
        where: {
          id: { not: songId, notIn: similar.map((s) => s.id) },
          status: 'ready',
        },
        take: limit - similar.length,
      });
      similar.push(...extra);
    }

    return similar;
  }
}
