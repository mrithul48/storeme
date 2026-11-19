// apps/backend/src/modules/analytics/repositories/analytics.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: DatabaseService) {}

  async countTotalHistoricalOrders(storeId: string): Promise<number> {
    const row = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1`,
      [storeId],
    );
    return row ? parseInt(row.count, 10) : 0;
  }

  async getAggregatesInTimeframe(storeId: string, sinceDate: Date) {
    const [ordersCount, statusCounts, paidRevenue, channelCounts] = await Promise.all([
      this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1 AND "createdAt" >= $2`,
        [storeId, sinceDate],
      ),
      this.db.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1 AND "createdAt" >= $2 GROUP BY status`,
        [storeId, sinceDate],
      ),
      this.db.queryOne<{ total: string; count: string }>(
        `SELECT COALESCE(SUM(total), 0)::text as total, COUNT(*)::text as count
         FROM "Order"
         WHERE "storeId" = $1 AND "paymentStatus" = 'PAID' AND "createdAt" >= $2`,
        [storeId, sinceDate],
      ),
      this.db.query<{ channel: string; count: string }>(
        `SELECT "orderChannel" as channel, COUNT(*)::text as count
         FROM "Order"
         WHERE "storeId" = $1 AND "createdAt" >= $2
         GROUP BY "orderChannel"`,
        [storeId, sinceDate],
      ),
    ]);

    const statusMap = new Map<string, number>();
    for (const s of statusCounts) {
      statusMap.set(s.status, parseInt(s.count, 10));
    }

    const channelMap = new Map<string, number>();
    for (const c of channelCounts) {
      channelMap.set(c.channel, parseInt(c.count, 10));
    }

    return {
      totalOrders: ordersCount ? parseInt(ordersCount.count, 10) : 0,
      deliveredOrders: statusMap.get('DELIVERED') || 0,
      pendingOrders: statusMap.get('PENDING') || 0,
      cancelledOrders: statusMap.get('CANCELLED') || 0,
      totalRevenue: paidRevenue ? parseFloat(paidRevenue.total) : 0,
      paidCount: paidRevenue ? parseInt(paidRevenue.count, 10) : 0,
      codCount: channelMap.get('COD') || 0,
      onlineCount: channelMap.get('ONLINE_PAYMENT') || 0,
      whatsappCount: channelMap.get('WHATSAPP') || 0,
    };
  }

  async getTopProducts(storeId: string, sinceDate: Date) {
    return this.db.query<{
      productId: string;
      name: string;
      unitsSold: number;
      revenue: number;
    }>(
      `SELECT oi."productId",
              MAX(COALESCE(p.name, oi."productName")) as name,
              COALESCE(SUM(oi.quantity), 0)::int as "unitsSold",
              COALESCE(SUM(oi.subtotal), 0)::float as revenue
       FROM "OrderItem" oi
       JOIN "Order" o ON oi."orderId" = o.id
       LEFT JOIN "Product" p ON p.id = oi."productId"
       WHERE o."storeId" = $1 AND o."createdAt" >= $2
       GROUP BY oi."productId"
       ORDER BY revenue DESC
       LIMIT 5`,
      [storeId, sinceDate],
    );
  }

  async getTimeframeOrders(storeId: string, sinceDate: Date) {
    return this.db.query<{
      createdAt: Date;
      total: number;
      paymentStatus: string;
    }>(
      `SELECT "createdAt", total, "paymentStatus"
       FROM "Order"
       WHERE "storeId" = $1 AND "createdAt" >= $2
       ORDER BY "createdAt" ASC`,
      [storeId, sinceDate],
    );
  }
}

