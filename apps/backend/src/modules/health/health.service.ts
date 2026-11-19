// apps/api/src/modules/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';
import { HealthCheckResponse } from '@launchcommerce/api-contracts';

@Injectable()
export class HealthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const [dbResult, redisResult] = await Promise.all([
      this.db.healthCheck(),
      this.redis.ping(),
    ]);

    const mem = process.memoryUsage();
    const isHealthy = dbResult.status === 'healthy';

    return {
      status: isHealthy ? (redisResult.status === 'connected' ? 'ok' : 'degraded') : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: isHealthy ? 'connected' : 'disconnected',
          latencyMs: dbResult.latencyMs,
        },
        redis: {
          status: redisResult.status,
          latencyMs: redisResult.latencyMs,
        },
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        },
      },
    };
  }
}

