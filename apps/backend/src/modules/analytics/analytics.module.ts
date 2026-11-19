// apps/backend/src/modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './repositories/analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsRepository, AnalyticsService],
  exports: [AnalyticsRepository, AnalyticsService],
})
export class AnalyticsModule {}

