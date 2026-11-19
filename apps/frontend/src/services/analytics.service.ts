// apps/frontend/src/services/analytics.service.ts
// Real merchant analytics consuming centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";

export type Timeframe = "7d" | "30d" | "90d" | "1y";

export interface AnalyticsMetrics {
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface AnalyticsChannels {
  cod: number;
  online: number;
  whatsapp: number;
}

export interface TopProductMetric {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface SalesBucket {
  date: string;
  revenue: number;
  orders: number;
}

export interface StoreAnalyticsResult {
  hasOrders: boolean;
  timeframe: Timeframe;
  metrics: AnalyticsMetrics;
  channels: AnalyticsChannels;
  topProducts: TopProductMetric[];
  salesOverTime: SalesBucket[];
}

/**
 * Get store analytics dashboard summary and metrics via NestJS REST API
 */
export async function getStoreAnalytics(
  storeId: string,
  timeframe: Timeframe = "30d"
): Promise<StoreAnalyticsResult> {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/analytics", {
    storeId,
    internalUser: serverUser,
    params: { timeframe },
  });

  return unwrapData<StoreAnalyticsResult>(res);
}

/**
 * Track an analytics event (storefront page view, add to cart, checkout start)
 */
export async function trackAnalyticsEvent(
  storeId: string,
  data: { eventType: string; productId?: string; metadata?: Record<string, any> }
) {
  const res = await apiClient.post<any>("/api/v1/analytics/events", data, {
    storeId,
  });

  return unwrapData<any>(res);
}
