// src/services/analytics.service.ts
// Real merchant analytics using optimized PostgreSQL/Prisma database aggregates

import { prisma } from "@/lib/db";

export type Timeframe = "7d" | "30d" | "90d" | "1y";

export async function getStoreAnalytics(storeId: string, timeframe: Timeframe = "30d") {
  const now = new Date();
  const sinceDate = new Date(now);

  switch (timeframe) {
    case "7d":
      sinceDate.setDate(now.getDate() - 7);
      break;
    case "90d":
      sinceDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      sinceDate.setFullYear(now.getFullYear() - 1);
      break;
    case "30d":
    default:
      sinceDate.setDate(now.getDate() - 30);
      break;
  }

  // 1. Check total historical orders to determine empty state
  const allTimeOrderCount = await prisma.order.count({ where: { storeId } });
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

  // 2. Parallel aggregate queries within the selected timeframe
  const [
    totalOrders,
    deliveredOrders,
    pendingOrders,
    cancelledOrders,
    paidRevenueAgg,
    codCount,
    onlineCount,
    whatsappCount,
    topProductGroups,
    timeframeOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { storeId, createdAt: { gte: sinceDate } },
    }),
    prisma.order.count({
      where: { storeId, status: "DELIVERED", createdAt: { gte: sinceDate } },
    }),
    prisma.order.count({
      where: { storeId, status: "PENDING", createdAt: { gte: sinceDate } },
    }),
    prisma.order.count({
      where: { storeId, status: "CANCELLED", createdAt: { gte: sinceDate } },
    }),
    prisma.order.aggregate({
      where: { storeId, paymentStatus: "PAID", createdAt: { gte: sinceDate } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({
      where: { storeId, orderChannel: "COD", createdAt: { gte: sinceDate } },
    }),
    prisma.order.count({
      where: { storeId, orderChannel: "ONLINE_PAYMENT", createdAt: { gte: sinceDate } },
    }),
    prisma.order.count({
      where: { storeId, orderChannel: "WHATSAPP", createdAt: { gte: sinceDate } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: {
        order: { storeId, createdAt: { gte: sinceDate } },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: sinceDate } },
      select: { createdAt: true, total: true, paymentStatus: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalRevenue = paidRevenueAgg._sum.total ? Number(paidRevenueAgg._sum.total) : 0;
  const paidCount = paidRevenueAgg._count || 0;
  const averageOrderValue = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

  // 3. Format Top Products with real data
  const topProducts = topProductGroups.map((p) => ({
    productId: p.productId,
    name: p.productName,
    unitsSold: p._sum.quantity || 0,
    revenue: p._sum.subtotal ? Number(p._sum.subtotal) : 0,
  }));

  // 4. Group sales over time into date buckets
  const salesMap = new Map<string, { date: string; revenue: number; orders: number }>();

  // Initialize buckets for the timeframe
  const bucketDays = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 12 : 12;
  const intervalMs = (now.getTime() - sinceDate.getTime()) / bucketDays;

  for (let i = 0; i < bucketDays; i++) {
    const d = new Date(sinceDate.getTime() + i * intervalMs);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    salesMap.set(key, { date: key, revenue: 0, orders: 0 });
  }

  // Populate buckets with real orders
  for (const o of timeframeOrders) {
    const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const bucket = salesMap.get(key) || { date: key, revenue: 0, orders: 0 };
    bucket.orders += 1;
    if (o.paymentStatus === "PAID") {
      bucket.revenue += Number(o.total);
    }
    salesMap.set(key, bucket);
  }

  const salesOverTime = Array.from(salesMap.values());

  return {
    hasOrders: true,
    timeframe,
    metrics: {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
    },
    channels: {
      cod: codCount,
      online: onlineCount,
      whatsapp: whatsappCount,
    },
    topProducts,
    salesOverTime,
  };
}
