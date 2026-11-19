// apps/backend/src/modules/analytics/dto/analytics.dto.ts

export type Timeframe = '7d' | '30d' | '90d' | '1y';

export class AnalyticsQueryDto {
  timeframe?: Timeframe;
}

export class TrackEventDto {
  eventType!: string;
  productId?: string;
  metadata?: Record<string, any>;
}

