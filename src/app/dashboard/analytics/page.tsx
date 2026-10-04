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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Merchant Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real database revenue metrics, order channel distribution, and top product insights.
        </p>
      </div>

      <AnalyticsClient initialData={analyticsData} />
    </div>
  );
}
