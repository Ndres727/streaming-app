import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Controller('stream')
export class StreamController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get(':id')
  async stream(@Param('id') id: string, @Res() res: Response) {
    const song = await this.prisma.song.findUnique({ where: { id } });

    if (!song || song.status !== 'ready') {
      throw new NotFoundException('Song not found or not ready');
    }

    if (song.hlsUrl) {
      return res.redirect(song.hlsUrl);
    }

    // Fallback: serve raw audio file
    const stream = await this.storage.getFile(song.audioUrl);
    res.set({ 'Content-Type': 'audio/mpeg' });
    stream.pipe(res);
  }
}
