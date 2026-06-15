import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TranscodingService } from './transcoding.service';

export const TRANSCODE_QUEUE = 'transcode';

@Module({
  imports: [ConfigModule],
  providers: [
    TranscodingService,
    {
      provide: 'BullQueue_transcode',
      useFactory: (config: ConfigService) =>
        new Queue('transcode', { connection: { url: config.get('REDIS_URL', 'redis://localhost:6379') } }),
      inject: [ConfigService],
    },
  ],
  exports: [TranscodingService, 'BullQueue_transcode'],
})
export class TranscodingModule {}
