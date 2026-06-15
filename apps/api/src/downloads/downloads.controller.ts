import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DownloadsService } from './downloads.service';

@Controller('downloads')
@UseGuards(AuthGuard('jwt'))
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.downloadsService.findAll(req.user.sub);
  }

  @Post(':songId')
  markDownloaded(
    @Req() req: any,
    @Param('songId') songId: string,
    @Body('localUri') localUri: string,
  ) {
    return this.downloadsService.markDownloaded(req.user.sub, songId, localUri);
  }

  @Delete(':songId')
  remove(@Req() req: any, @Param('songId') songId: string) {
    return this.downloadsService.remove(req.user.sub, songId);
  }
}
