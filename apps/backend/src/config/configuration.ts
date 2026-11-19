// apps/api/src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },
  security: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'launchcommerce-dev-jwt-access-secret-32-chars-min!',
    authEncryptionKey: process.env.AUTH_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    internalSecretCurrent: process.env.INTERNAL_SERVICE_SECRET_CURRENT || 'launchcommerce-dev-internal-secret-current-32-chars!',
    internalSecretPrevious: process.env.INTERNAL_SERVICE_SECRET_PREVIOUS,
    internalKeyId: process.env.INTERNAL_SERVICE_KEY_ID || 'k1',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),
  },
});

