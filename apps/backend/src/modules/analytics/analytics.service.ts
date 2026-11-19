// apps/backend/src/modules/analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { Timeframe, TrackEventDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  async getStoreAnalytics(storeId: string, timeframe: Timeframe = '30d') {
    const now = new Date();
    const sinceDate = new Date(now);

    switch (timeframe) {
      case '7d':
        sinceDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        sinceDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        sinceDate.setFullYear(now.getFullYear() - 1);
        break;
      case '30d':
      default:
        sinceDate.setDate(now.getDate() - 30);
        break;
    }

    // 1. Check total historical orders to determine empty state
    const allTimeOrderCount = await this.analyticsRepo.countTotalHistoricalOrders(storeId);
    if (allTimeOrderCount === 0) {
      return {
        hasOrders: false,
        timeframe,
        metrics: {
          totalOrders: 0,
          deliveredOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        },
        channels: { cod: 0, online: 0, whatsapp: 0 },
        topProducts: [],
        salesOverTime: [],
      };
    }

    // 2. Parallel queries
    const [aggregates, topProducts, timeframeOrders] = await Promise.all([
      this.analyticsRepo.getAggregatesInTimeframe(storeId, sinceDate),
      this.analyticsRepo.getTopProducts(storeId, sinceDate),
      this.analyticsRepo.getTimeframeOrders(storeId, sinceDate),
    ]);

    const averageOrderValue = aggregates.paidCount > 0 ? Math.round(aggregates.totalRevenue / aggregates.paidCount) : 0;

    // 3. Group sales over time into date buckets
    const salesMap = new Map<string, { date: string; revenue: number; orders: number }>();
    const bucketDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 12 : 12;
    const intervalMs = (now.getTime() - sinceDate.getTime()) / bucketDays;

    for (let i = 0; i < bucketDays; i++) {
      const d = new Date(sinceDate.getTime() + i * intervalMs);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }

    for (const o of timeframeOrders) {
      const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const bucket = salesMap.get(key) || { date: key, revenue: 0, orders: 0 };
      bucket.orders += 1;
      if (o.paymentStatus === 'PAID') {
        bucket.revenue += Number(o.total);
      }
      salesMap.set(key, bucket);
    }

    const salesOverTime = Array.from(salesMap.values());

    return {
      hasOrders: true,
      timeframe,
      metrics: {
        totalOrders: aggregates.totalOrders,
        deliveredOrders: aggregates.deliveredOrders,
        pendingOrders: aggregates.pendingOrders,
        cancelledOrders: aggregates.cancelledOrders,
        totalRevenue: aggregates.totalRevenue,
        averageOrderValue,
      },
      channels: {
        cod: aggregates.codCount,
        online: aggregates.onlineCount,
        whatsapp: aggregates.whatsappCount,
      },
      topProducts,
      salesOverTime,
    };
  }

  async trackEvent(storeId: string, dto: TrackEventDto) {
    this.logger.log(`[ANALYTICS_EVENT] Store: ${storeId}, Event: ${dto.eventType}, Product: ${dto.productId || 'N/A'}`);
    return {
      success: true,
      recorded: true,
      timestamp: new Date().toISOString(),
    };
  }
}
