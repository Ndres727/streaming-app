import { Controller, Get, Param, Query } from '@nestjs/common';
import { RadioService } from './radio.service';

@Controller('radio')
export class RadioController {
  constructor(private readonly radioService: RadioService) {}

  @Get(':songId')
  getSimilar(@Param('songId') songId: string, @Query('limit') limit?: string) {
    return this.radioService.getSimilar(songId, limit ? parseInt(limit) : 20);
  }
}
