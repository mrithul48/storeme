import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { getStoreAnalytics, Timeframe } from "@/services/analytics.service";
import { AnalyticsClient } from "./analytics-client";

type AnalyticsPageProps = {
  searchParams: Promise<{ timeframe?: string }>;
};

export default async function DashboardAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const { timeframe } = await searchParams;

  const validTimeframe = (["7d", "30d", "90d", "1y"].includes(timeframe || "")
    ? timeframe
    : "30d") as Timeframe;

  const analyticsData = await getStoreAnalytics(store!.id, validTimeframe);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pt-3.5 sm:pt-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Merchant Analytics</h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Real database revenue metrics, order channel distribution, and top product insights.
        </p>
      </div>

      <AnalyticsClient key={validTimeframe} initialData={analyticsData} />
    </div>
  );
}
