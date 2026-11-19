// apps/api/src/config/env.validation.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  DIRECT_URL: z.string().url().optional(),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters').default('launchcommerce-dev-jwt-access-secret-32-chars-min!'),
  AUTH_ENCRYPTION_KEY: z.string().length(64, 'AUTH_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)').default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  INTERNAL_SERVICE_SECRET_CURRENT: z.string().min(32, 'INTERNAL_SERVICE_SECRET_CURRENT must be at least 32 characters').default('launchcommerce-dev-internal-secret-current-32-chars!'),
  INTERNAL_SERVICE_SECRET_PREVIOUS: z.string().min(32).optional(),
  INTERNAL_SERVICE_KEY_ID: z.string().default('k1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const errors = parsed.error.format();
    console.error('❌ Environment validation failed:', JSON.stringify(errors, null, 2));
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

