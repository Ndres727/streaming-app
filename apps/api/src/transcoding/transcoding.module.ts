import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TranscodingService } from './transcoding.service';

export const TRANSCODE_QUEUE = 'transcode';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get('REDIS_URL', 'redis://localhost:6379') },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: TRANSCODE_QUEUE }),
  ],
  providers: [TranscodingService],
  exports: [TranscodingService, BullModule],
})
export class TranscodingModule {}
