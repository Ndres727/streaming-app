import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);
  private publicUrlBase: string;

  constructor(private config: ConfigService) {
    const endpoint = config.get('MINIO_ENDPOINT', 'localhost');
    const port = config.get('MINIO_PORT', '9000');
    const accessKey = config.get('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = config.get('MINIO_SECRET_KEY', 'minioadmin');
    const useSSL = config.get('MINIO_USE_SSL', 'false') === 'true';
    this.bucket = config.get('MINIO_BUCKET', 'audio-files');

    this.client = new S3Client({
      endpoint: `http://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    });

    this.publicUrlBase = `http://${endpoint}:${port}/${this.bucket}`;
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: 1 }),
      );
    } catch {
      // Bucket doesn't exist — in production use HeadBucketCommand
      this.logger.warn(`Bucket "${this.bucket}" may not exist, creating...`);
    }
  }

  async uploadFile(
    key: string,
    body: Buffer | Readable,
    contentType: string,
  ): Promise<string> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
    });

    await upload.done();
    return `${this.publicUrlBase}/${key}`;
  }

  async getFile(key: string): Promise<Readable> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return result.Body as Readable;
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrlBase}/${key}`;
  }
}
