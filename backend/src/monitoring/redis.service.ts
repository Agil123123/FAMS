import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient!: Redis;

  onModuleInit() {
    // Standard Redis fallback connection
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error('Redis connection failed too many times, skipping retries.');
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis successfully');
    });

    this.redisClient.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}. Running in degraded mode without cache if this persists.`);
    });
  }

  onModuleDestroy() {
    this.redisClient?.disconnect();
  }

  async setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.setex(key, ttlSeconds, payload);
      } else {
        await this.redisClient.set(key, payload);
      }
    } catch (e: any) {
      this.logger.warn(`Failed to set cache for ${key}: ${e.message}`);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (e: any) {
      this.logger.warn(`Failed to get cache for ${key}: ${e.message}`);
      return null;
    }
  }

  async deleteCache(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (e: any) {
      this.logger.warn(`Failed to delete cache for ${key}: ${e.message}`);
    }
  }

  async scanKeys(pattern: string): Promise<string[]> {
    try {
      let cursor = '0';
      const keys: string[] = [];
      do {
        const [newCursor, scannedKeys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
        cursor = newCursor;
        keys.push(...scannedKeys);
      } while (cursor !== '0');
      return keys;
    } catch (e: any) {
      this.logger.warn(`Failed to scan keys for pattern ${pattern}: ${e.message}`);
      return [];
    }
  }
}
