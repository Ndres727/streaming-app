import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class TranscodingService {
  constructor(@Inject('BullQueue_transcode') private readonly queue: Queue) {}

  async enqueueTranscode(songId: string, storageKey: string) {
    await this.queue.add('transcode', {
      songId,
      storageKey,
    });
  }
}
