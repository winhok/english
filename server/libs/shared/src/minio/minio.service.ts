import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: Number(this.configService.get<string>('MINIO_PORT')),
      useSSL: !!Number(this.configService.get<string>('MINIO_USE_SSL')),
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
    });
  }

  async onModuleInit() {
    const bucket = this.configService.get<string>('MINIO_BUCKET')!;
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket);
      await this.minioClient.setBucketPolicy(
        bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadObjects',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }),
      );
    }
  }

  getClient(): Minio.Client {
    return this.minioClient;
  }

  getBucket(): string {
    return this.configService.get<string>('MINIO_BUCKET')!;
  }
}
