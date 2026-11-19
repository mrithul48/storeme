// apps/backend/src/database/database.config.ts
import { PoolConfig } from 'pg';

export function getDatabasePoolConfig(): PoolConfig {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:admin@localhost:5432/launchcommerce?schema=public';

  const isLocal =
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1') ||
    databaseUrl.includes('::1');

  const poolConfig: PoolConfig = {
    connectionString: databaseUrl,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10),
  };

  if (!isLocal) {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }

  return poolConfig;
}

