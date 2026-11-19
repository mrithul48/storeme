// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { CentralizedExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
const compression = require('compression');

async function bootstrap() {
  const logger = new Logger('LaunchCommerce-API');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable HTTP response compression (gzip / brotli)
  app.use(compression());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 4000;
  const configuredCors = configService.get<string[]>('cors.origins') || [];
  const corsOrigins = Array.from(
    new Set([
      'http://localhost:3000',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8081',
      ...configuredCors,
    ])
  );

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Security & CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost, local LAN IPs (192.168.x.x, 10.x.x.x), expo app previews, or configured origins
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('192.168.') ||
        origin.includes('10.') ||
        origin.includes('expo.app') ||
        corsOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Store-Id',
      'X-Device-Id',
      'X-Internal-Token',
      'X-Idempotency-Key',
    ],
  });

  // Global Interceptors & Exception Filters
  app.useGlobalFilters(new CentralizedExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 LaunchCommerce NestJS Backend running at http://localhost:${port}/api/v1`);
  logger.log(`🩺 Health-check available at http://localhost:${port}/api/v1/health`);
}

bootstrap();

