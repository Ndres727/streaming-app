import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecentlyPlayedService } from './recently-played.service';

@Controller('recently-played')
@UseGuards(AuthGuard('jwt'))
export class RecentlyPlayedController {
  constructor(private readonly recentlyPlayedService: RecentlyPlayedService) {}

  @Get()
  findAll(@Req() req: any, @Query('limit') limit?: string) {
    return this.recentlyPlayedService.findAll(req.user.sub, limit ? parseInt(limit) : 20);
  }

  @Post(':songId')
  track(@Req() req: any, @Param('songId') songId: string) {
    return this.recentlyPlayedService.track(req.user.sub, songId);
  }
}
