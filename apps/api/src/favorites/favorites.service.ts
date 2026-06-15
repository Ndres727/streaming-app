import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, songId: string) {
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) throw new NotFoundException('Song not found');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, songId } });
    return { favorited: true };
  }

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { song: true },
      orderBy: { id: 'desc' },
    });
    return favorites.map((f) => f.song);
  }

  async isFavorited(userId: string, songId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_songId: { userId, songId } },
    });
    return !!fav;
  }
}
