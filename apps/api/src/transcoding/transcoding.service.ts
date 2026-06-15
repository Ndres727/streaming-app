import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TRANSCODE_QUEUE } from './transcoding.module';

@Injectable()
export class TranscodingService {
  constructor(@InjectQueue(TRANSCODE_QUEUE) private readonly queue: Queue) {}

  async enqueueTranscode(songId: string, storageKey: string) {
    await this.queue.add('transcode', {
      songId,
      storageKey,
    });
  }
}
