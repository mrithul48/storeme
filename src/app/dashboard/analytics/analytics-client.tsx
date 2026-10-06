"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  CreditCard,
  Banknote,
  Package,
  Calendar,
} from "lucide-react";

interface AnalyticsData {
  hasOrders: boolean;
  timeframe: string;
  metrics: {
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  channels: {
    cod: number;
    online: number;
    whatsapp: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }>;
  salesOverTime: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export function AnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
  const router = useRouter();
  const [data] = useState(initialData);
  const currentTimeframe = data.timeframe;

  const handleTimeframeChange = (tf: string) => {
    router.push(`/dashboard/analytics?timeframe=${tf}`);
  };

  if (!data.hasOrders) {
    return (
      <Card className="py-20 text-center space-y-4 bg-slate-900/60 border-slate-800 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <TrendingUp className="w-8 h-8 stroke-1" />
        </div>
        <h3 className="text-lg font-bold text-white">No sales data yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Once your first order arrives, analytics for sales, revenue, top products, and channels will appear here.
        </p>
      </Card>
    );
  }

  const { metrics, channels, topProducts, salesOverTime } = data;
  const totalChannelOrders = channels.cod + channels.online + channels.whatsapp || 1;

  // Chart scaling calculations
  const maxRevenue = Math.max(...salesOverTime.map((s) => s.revenue), 100);

  return (
    <div className="space-y-8">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Reporting Period:</span>
        </div>

        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          {[
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "90d", label: "Last 90 Days" },
            { id: "1y", label: "Past Year" },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => handleTimeframeChange(tf.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTimeframe === tf.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue (Paid)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-500">From verified settled payments</p>
        </Card>

        <Card className="p-5 space-y-2 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Order Value</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(metrics.averageOrderValue)}
          </p>
          <p className="text-[11px] text-slate-500">Paid revenue / paid order count</p>
        </Card>

        <Card className="p-5 space-y-2 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Orders Placed</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{metrics.totalOrders}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="text-emerald-400">{metrics.deliveredOrders} delivered</span>
            <span>•</span>
            <span className="text-amber-400">{metrics.pendingOrders} pending</span>
          </div>
        </Card>

        <Card className="p-5 space-y-2 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Order Fulfillment Rate</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {metrics.totalOrders > 0
              ? `${Math.round((metrics.deliveredOrders / metrics.totalOrders) * 100)}%`
              : "0%"}
          </p>
          <p className="text-[11px] text-slate-500">{metrics.cancelledOrders} cancelled orders</p>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-6 space-y-6 bg-slate-900/60 border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Sales Over Time</h3>
            <p className="text-xs text-slate-400">Daily revenue trends from settled customer orders</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400">
            Peak: {formatCurrency(maxRevenue)}
          </span>
        </div>

        {/* Lightweight Responsive Bar Chart */}
        <div className="space-y-2">
          <div className="h-48 flex items-end gap-2 pt-6">
            {salesOverTime.map((item, idx) => {
              const heightPct = Math.max(Math.round((item.revenue / maxRevenue) * 100), item.orders > 0 ? 8 : 2);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-white pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {item.date}: {formatCurrency(item.revenue)} ({item.orders} orders)
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      item.revenue > 0
                        ? "bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400"
                        : "bg-slate-800/40"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Date Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-2 px-1">
            <span>{salesOverTime[0]?.date || ""}</span>
            {salesOverTime.length > 2 && (
              <span>{salesOverTime[Math.floor(salesOverTime.length / 2)]?.date || ""}</span>
            )}
            <span>{salesOverTime[salesOverTime.length - 1]?.date || ""}</span>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Channels Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Channels */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-6 bg-slate-900/60 border-slate-800">
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white">Order Channels</h3>
              <p className="text-xs text-slate-400">Volume distribution across checkout channels</p>
            </div>

            <div className="space-y-4">
              {/* COD */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Banknote className="w-4 h-4" />
                    Cash on Delivery
                  </span>
                  <span className="text-white">
                    {channels.cod} ({Math.round((channels.cod / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(channels.cod / totalChannelOrders) * 100}%` }}
                  />
                </div>
              </div>

              {/* Online Payment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <CreditCard className="w-4 h-4" />
                    Online Payment
                  </span>
                  <span className="text-white">
                    {channels.online} ({Math.round((channels.online / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(channels.online / totalChannelOrders) * 100}%` }}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Orders
                  </span>
                  <span className="text-white">
                    {channels.whatsapp} ({Math.round((channels.whatsapp / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(channels.whatsapp / totalChannelOrders) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Top Performing Products
              </h3>
              <p className="text-xs text-slate-400">Ranked by actual customer order sales</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No product sales recorded in this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {topProducts.map((prod, index) => (
                  <div key={prod.productId} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{prod.name}</p>
                        <p className="text-[11px] text-slate-400">{prod.unitsSold} units ordered</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(prod.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
