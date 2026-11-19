// apps/api/src/modules/auth/guards/auth-rate-limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../../../database/redis.service';

/**
 * Atomic Redis Lua script for sliding fixed-window rate limiting.
 * Guarantees that INCR and EXPIRE execute atomically in a single step,
 * preventing orphaned counters without TTLs.
 * Returns: [1 (allowed) | 0 (blocked), currentCount, ttlSeconds]
 */
const ATOMIC_RATE_LIMIT_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, window)
else
  local currentTtl = redis.call('TTL', key)
  if currentTtl == -1 then
    redis.call('EXPIRE', key, window)
  end
end

if current > limit then
  return {0, current, redis.call('TTL', key)}
else
  return {1, current, redis.call('TTL', key)}
end
`;

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AuthRateLimitGuard.name);

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.url || '';
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.socket?.remoteAddress ||
      '127.0.0.1';

    // Different limits per endpoint
    const isLogin = path.includes('/auth/login');
    const limit = isLogin ? 10 : 30; // 10 per min for login, 30 per min for refresh
    const windowSeconds = 60;
    const key = `ratelimit:auth:${isLogin ? 'login' : 'refresh'}:${ip}`;

    try {
      const client = this.redis.getClient();
      // Execute atomic Lua script
      const result = (await client.eval(
        ATOMIC_RATE_LIMIT_LUA,
        1,
        key,
        limit,
        windowSeconds,
      )) as [number, number, number];

      const [allowed, currentCount, ttl] = result;

      if (allowed === 0) {
        this.logger.warn(
          `Rate limit exceeded for IP: ${ip} on ${path}. Attempts: ${currentCount}/${limit}. TTL: ${ttl}s`,
        );
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: ttl > 0 ? ttl : windowSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;

      // Fail-closed security policy: If Redis is down, reject to prevent brute-force attacks
      this.logger.error(`Redis unavailable during rate limit check: ${err.message}`);
      throw new ServiceUnavailableException(
        'Authentication service temporarily degraded. Rate limiter unavailable.',
      );
    }
  }
}
