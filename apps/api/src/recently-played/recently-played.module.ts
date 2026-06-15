import { Module } from '@nestjs/common';
import { RecentlyPlayedController } from './recently-played.controller';
import { RecentlyPlayedService } from './recently-played.service';

@Module({
  controllers: [RecentlyPlayedController],
  providers: [RecentlyPlayedService],
  exports: [RecentlyPlayedService],
})
export class RecentlyPlayedModule {}
