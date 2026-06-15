import { Controller, Get, Param, Query } from '@nestjs/common';
import { AlbumsService } from './albums.service';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':album')
  getSongs(@Param('album') album: string, @Query('artist') artist?: string) {
    return this.albumsService.getSongs(album, artist);
  }
}
