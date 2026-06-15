import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as ffmpeg from 'fluent-ffmpeg';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const BUCKET = process.env.MINIO_BUCKET || 'audio-files';

const prisma = new PrismaClient();

const s3 = new S3Client({
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  region: 'us-east-1',
  credentials: { accessKeyId: MINIO_ACCESS_KEY, secretAccessKey: MINIO_SECRET_KEY },
  forcePathStyle: true,
});

async function downloadFile(storageKey: string, destPath: string): Promise<void> {
  const result = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: storageKey }));
  const body = result.Body as NodeJS.ReadableStream;

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    body.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function uploadFile(key: string, filePath: string, contentType: string): Promise<string> {
  const body = fs.createReadStream(filePath);
  const upload = new Upload({
    client: s3,
    params: { Bucket: BUCKET, Key: key, Body: body, ContentType: contentType },
  });
  await upload.done();
  return `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET}/${key}`;
}

function transcodeToHls(inputPath: string, outputDir: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
      ])
      .output(path.join(outputDir, 'master.m3u8'))
      .on('end', () => {
        // Get duration from ffprobe
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) resolve(30);
          const duration = Math.round(metadata.format.duration || 30);
          resolve(duration);
        });
      })
      .on('error', reject)
      .run();
  });
}

async function processJob(job: { data: { songId: string; storageKey: string } }) {
  const { songId, storageKey } = job.data;
  console.log(`Processing song ${songId} from ${storageKey}`);

  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const inputPath = path.join(tmpDir.name, 'input.mp3');
  const outputDir = path.join(tmpDir.name, 'hls');

  try {
    fs.mkdirSync(outputDir, { recursive: true });

    await downloadFile(storageKey, inputPath);
    console.log('Downloaded raw audio');

    const duration = await transcodeToHls(inputPath, outputDir);
    console.log(`Transcoded to HLS (duration: ${duration}s)`);

    // Upload master playlist
    const hlsKey = `hls/${songId}/${uuid()}/master.m3u8`;
    const hlsUrl = await uploadFile(hlsKey, path.join(outputDir, 'master.m3u8'), 'application/vnd.apple.mpegurl');

    // Upload segments
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const segKey = `hls/${songId}/${file}`;
        await uploadFile(segKey, path.join(outputDir, file), 'video/MP2T');
      }
    }

    // Update DB
    await prisma.song.update({
      where: { id: songId },
      data: { status: 'ready', hlsUrl, duration },
    });

    console.log(`Song ${songId} is ready`);
  } catch (err) {
    console.error(`Failed to transcode ${songId}:`, err);
    await prisma.song.update({
      where: { id: songId },
      data: { status: 'error' },
    });
  } finally {
    tmpDir.removeCallback();
  }
}

const worker = new Worker('transcode', processJob, {
  connection: { url: REDIS_URL },
  concurrency: 2,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Transcoder worker started');
