import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.sub);
  }

  @Post(':songId/toggle')
  toggle(@Req() req: any, @Param('songId') songId: string) {
    return this.favoritesService.toggle(req.user.sub, songId);
  }

  @Get(':songId')
  isFavorited(@Req() req: any, @Param('songId') songId: string) {
    return this.favoritesService.isFavorited(req.user.sub, songId);
  }
}
