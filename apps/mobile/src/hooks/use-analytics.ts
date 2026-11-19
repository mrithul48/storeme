// apps/mobile/src/hooks/use-analytics.ts
// TanStack Query hooks for merchant analytics and store reports

import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getStoreStats, getOrdersSummary } from "../api/analytics";
import { AnalyticsTimeframe } from "../types";

export const ANALYTICS_QUERY_KEY = ["analytics"];
export const STORE_STATS_QUERY_KEY = ["store-stats"];
export const ORDERS_SUMMARY_QUERY_KEY = ["orders-summary"];

export function useAnalytics(timeframe: AnalyticsTimeframe = "30d") {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, timeframe],
    queryFn: () => getAnalytics(timeframe),
    staleTime: 30000,
  });
}

export function useStoreStats() {
  return useQuery({
    queryKey: STORE_STATS_QUERY_KEY,
    queryFn: () => getStoreStats(),
    staleTime: 30000,
  });
}

export function useOrdersSummary() {
  return useQuery({
    queryKey: ORDERS_SUMMARY_QUERY_KEY,
    queryFn: () => getOrdersSummary(),
    staleTime: 30000,
  });
}

