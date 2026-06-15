import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecentlyPlayedService {
  constructor(private readonly prisma: PrismaService) {}

  async track(userId: string, songId: string) {
    await this.prisma.recentlyPlayed.create({ data: { userId, songId } });
  }

  async findAll(userId: string, limit = 20) {
    const entries = await this.prisma.recentlyPlayed.findMany({
      where: { userId },
      include: { song: true },
      orderBy: { playedAt: 'desc' },
      take: limit,
      distinct: ['songId'],
    });
    return entries.map((e) => e.song);
  }
}
