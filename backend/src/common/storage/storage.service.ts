// ==========================================================
// Storage Service (MinIO S3-Compatible)
// Upload, download, delete files
// ==========================================================

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client;
  private readonly buckets = ['photos', 'documents', 'exports'];

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: this.config.get('MINIO_PORT', 9000),
      useSSL: this.config.get('MINIO_USE_SSL', false),
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'minio_access_key'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'minio_secret_key_change_me'),
    });
  }

  async onModuleInit() {
    // Auto-create buckets on startup
    for (const bucket of this.buckets) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket);
          this.logger.log(`Bucket created: ${bucket}`, 'StorageService');
        }
      } catch (error) {
        this.logger.warn(
          `Could not create bucket "${bucket}": ${error}`,
          'StorageService',
        );
      }
    }
  }

  /**
   * Upload a file to a bucket
   */
  async upload(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.putObject(bucket, objectName, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    this.logger.debug(
      `File uploaded: ${bucket}/${objectName}`,
      'StorageService',
    );
    return objectName;
  }

  /**
   * Get a presigned URL for file download
   */
  async getPresignedUrl(
    bucket: string,
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(bucket, objectName, expirySeconds);
  }

  /**
   * Delete a file from a bucket
   */
  async delete(bucket: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucket, objectName);
    this.logger.debug(
      `File deleted: ${bucket}/${objectName}`,
      'StorageService',
    );
  }

  /**
   * Check if an object exists
   */
  async exists(bucket: string, objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }
}
