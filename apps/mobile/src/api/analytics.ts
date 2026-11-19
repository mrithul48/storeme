// apps/mobile/src/api/analytics.ts
// Typed analytics and dashboard reporting API client for LaunchCommerce Mobile

import { apiClient } from "./client";
import {
  StoreAnalyticsResponse,
  StoreDashboardStats,
  OrderSummary,
  AnalyticsTimeframe,
} from "../types";

/**
 * Get store analytics for specified timeframe ('7d' | '30d' | '90d' | '1y')
 * Returns revenue, order counts, sales over time buckets, top products, and channels.
 * Endpoint: GET /api/v1/analytics
 */
export async function getAnalytics(
  timeframe: AnalyticsTimeframe = "30d"
): Promise<StoreAnalyticsResponse> {
  const result = await apiClient.get<StoreAnalyticsResponse>("/analytics", {
    params: { timeframe },
  });
  return result;
}

/**
 * Get high-level store KPI counts across lifetime
 * Returns total orders, pending, completed, total products, active products, total customers, revenue.
 * Endpoint: GET /api/v1/stores/current/stats
 */
export async function getStoreStats(): Promise<StoreDashboardStats> {
  const result = await apiClient.get<StoreDashboardStats>("/stores/current/stats");
  return result;
}

/**
 * Get comprehensive order lifecycle summary
 * Returns pending, confirmed, processing, shipped, delivered, cancelled counts and gross sales.
 * Endpoint: GET /api/v1/orders/summary
 */
export async function getOrdersSummary(): Promise<OrderSummary> {
  const result = await apiClient.get<OrderSummary>("/orders/summary");
  return result;
}

