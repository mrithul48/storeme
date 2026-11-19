// apps/api/src/database/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>('redis.url') || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1, // Fail fast on outage; do not hang or queue infinitely
        enableOfflineQueue: false, // Immediately reject commands when disconnected
        lazyConnect: true,
        connectTimeout: 5000,
        retryStrategy: (times) => {
          if (times > 10) {
            // Stop spamming reconnect attempts after 10 tries
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });

      // Attach complete error and lifecycle listeners to prevent unhandled EventEmitter errors
      this.client.on('connect', () => {
        this.logger.log('Redis TCP socket connection established');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.logger.log('✅ Redis client is ready for commands');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(`Redis connection error: ${err.message}`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', (timeToNext: number) => {
        this.isConnected = false;
        this.logger.debug(`Redis attempting reconnection in ${timeToNext}ms...`);
      });

      this.client.on('end', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection permanently ended');
      });

      // Attempt initial connection without blocking app startup
      this.client.connect().catch((err) => {
        this.isConnected = false;
        this.logger.warn(`Initial Redis connection unavailable at ${redisUrl}: ${err.message}. Security operations requiring Redis will fail-closed.`);
      });
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(`Failed to initialize Redis client: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.logger.log('Redis client connection closed');
    }
  }

  get isAvailable(): boolean {
    return this.isConnected && this.client !== null && this.client.status === 'ready';
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  /**
   * Safe fail-closed get operation. Throws if Redis is unavailable.
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis is unavailable');
    }
    return this.client.get(key);
  }

  /**
   * Atomic SET with optional EX (seconds) and NX (set if not exists).
   * Used for distributed replay protection and token rotation locking.
   */
  async set(
    key: string,
    value: string,
    mode?: 'EX',
    duration?: number,
    flag?: 'NX',
  ): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis is unavailable');
    }
    if (mode === 'EX' && duration && flag === 'NX') {
      return this.client.set(key, value, 'EX', duration, 'NX');
    }
    if (mode === 'EX' && duration) {
      return this.client.set(key, value, 'EX', duration);
    }
    return this.client.set(key, value);
  }

  /**
   * Safe fail-closed delete operation. Throws if Redis is unavailable.
   */
  async del(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis is unavailable');
    }
    return this.client.del(key);
  }

  /**
   * Get TTL (Time To Live) in seconds.
   * Returns -2 if key does not exist, -1 if key exists without TTL, or remaining seconds.
   */
  async ttl(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis is unavailable');
    }
    return this.client.ttl(key);
  }

  /**
   * Set expiration in seconds on an existing key.
   * Returns 1 if timeout was set, 0 if key does not exist.
   */
  async expire(key: string, seconds: number): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis is unavailable');
    }
    return this.client.expire(key, seconds);
  }

  /**
   * Health ping. Returns latency and connectivity status.
   */
  async ping(): Promise<{ status: 'connected' | 'disconnected' | 'unavailable'; latencyMs?: number }> {
    if (!this.client || !this.isConnected) {
      return { status: 'unavailable' };
    }
    const start = Date.now();
    try {
      await this.client.ping();
      return { status: 'connected', latencyMs: Date.now() - start };
    } catch {
      return { status: 'disconnected', latencyMs: Date.now() - start };
    }
  }
}


