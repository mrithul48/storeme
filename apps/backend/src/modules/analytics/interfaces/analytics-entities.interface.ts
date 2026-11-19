// apps/backend/src/modules/analytics/interfaces/analytics-entities.interface.ts

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

export interface TopProductAnalytics {
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

export interface StoreAnalyticsResponse {
  hasOrders: boolean;
  timeframe: string;
  metrics: AnalyticsMetrics;
  channels: AnalyticsChannels;
  topProducts: TopProductAnalytics[];
  salesOverTime: SalesBucket[];
}

