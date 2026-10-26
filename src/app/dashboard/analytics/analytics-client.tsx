"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Check,
  MessageCircle,
  CreditCard,
  Banknote,
  Package,
  Calendar,
  ChevronDown,
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
  const [isPending, startTransition] = React.useTransition();
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialData.timeframe);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedTimeframe(initialData.timeframe);
  }, [initialData.timeframe]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleTimeframeChange = (tf: string) => {
    setSelectedTimeframe(tf);
    startTransition(() => {
      router.push(`/dashboard/analytics?timeframe=${tf}`);
    });
  };

  const data = initialData;
  const currentTimeframe = selectedTimeframe || data.timeframe;

  const timeframeOptions = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "1y", label: "Past Year" },
  ];
  const activeTimeframeLabel = timeframeOptions.find((t) => t.id === currentTimeframe)?.label || "Last 30 Days";

  if (!data.hasOrders) {
    return (
      <Card className="py-20 text-center space-y-4 border border-slate-200/90 shadow-sm max-w-xl mx-auto bg-white">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
          <TrendingUp className="w-8 h-8 stroke-1" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A]">No sales data yet</h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
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
    <div className={`space-y-8 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Calendar className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>Reporting Period:</span>
        </div>

        {/* Mobile Custom Dropdown Menu */}
        <div className="relative sm:hidden" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white text-xs font-semibold text-[#0F172A] border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <span>{activeTimeframeLabel}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#64748B] transition-transform duration-200",
                dropdownOpen && "rotate-180 text-[#2563EB]"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-900/10 p-1.5 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="text-[10px] font-bold text-[#94A3B8] px-2.5 py-1 uppercase tracking-wider">
                Select Range
              </div>
              {timeframeOptions.map((tf) => {
                const isActive = currentTimeframe === tf.id;
                return (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => {
                      handleTimeframeChange(tf.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-[#2563EB] font-bold"
                        : "text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                    )}
                  >
                    <span>{tf.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Segmented Control */}
        <div className="hidden sm:flex rounded-xl bg-slate-100 p-1 border border-slate-200">
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentTimeframe === tf.id
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Total Revenue
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Settled payments</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <IndianRupee className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Avg Order Value
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">
              {formatCurrency(metrics.averageOrderValue)}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-blue-600 font-semibold truncate">
              <span className="truncate">Per paid order</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Total Orders Placed */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Orders Placed
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">
              {metrics.totalOrders}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600 font-semibold truncate">
              <span className="truncate">{metrics.pendingOrders} pending</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Order Fulfillment Rate */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Fulfillment
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">
              {metrics.totalOrders > 0
                ? `${Math.round((metrics.deliveredOrders / metrics.totalOrders) * 100)}%`
                : "0%"}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-purple-600 font-semibold truncate">
              <span className="truncate">{metrics.deliveredOrders} delivered</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="min-w-0 pr-1">
            <h3 className="text-base font-bold text-[#0F172A]">Sales Over Time</h3>
            <p className="text-xs text-[#64748B] truncate sm:whitespace-normal">Daily revenue trends from settled customer orders</p>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
            Peak: {formatCurrency(maxRevenue)}
          </span>
        </div>

        {/* Lightweight Responsive Bar Chart */}
        <div className="space-y-2">
          <div className="overflow-x-auto pt-3 pb-2 -mx-1 px-1 sm:mx-0 sm:px-0">
            <div className="min-w-max sm:min-w-0 w-full">
              <div className="h-52 flex items-end gap-1.5 sm:gap-2 pt-12">
                {salesOverTime.map((item, idx) => {
                  const heightPct = Math.max(Math.round((item.revenue / maxRevenue) * 100), item.orders > 0 ? 8 : 2);
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[12px] sm:min-w-0 flex flex-col items-center gap-1 group relative h-full justify-end cursor-pointer"
                    >
                      {/* Tooltip on hover/active — with ample headroom so it is never clipped */}
                      <div
                        className={cn(
                          "absolute -top-9 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] text-white pointer-events-none whitespace-nowrap z-30 shadow-lg",
                          idx < 3
                            ? "left-0"
                            : idx > salesOverTime.length - 4
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2"
                        )}
                      >
                        {item.date}: {formatCurrency(item.revenue)} ({item.orders} orders)
                      </div>

                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
                          item.revenue > 0
                            ? "bg-gradient-to-t from-[#2563EB] to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 shadow-xs"
                            : "bg-slate-100"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Date Axis */}
              <div className="flex justify-between text-[10px] text-[#64748B] border-t border-slate-100 pt-2 px-1">
                <span>{salesOverTime[0]?.date || ""}</span>
                {salesOverTime.length > 2 && (
                  <span>{salesOverTime[Math.floor(salesOverTime.length / 2)]?.date || ""}</span>
                )}
                <span>{salesOverTime[salesOverTime.length - 1]?.date || ""}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Channels Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Order Channels */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border border-slate-200/90 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Order Channels</h3>
              <p className="text-xs text-[#64748B]">Volume distribution across checkout channels</p>
            </div>

            <div className="space-y-4">
              {/* COD */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    Cash on Delivery
                  </span>
                  <span className="text-[#0F172A] font-bold">
                    {channels.cod} ({Math.round((channels.cod / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(channels.cod / totalChannelOrders) * 100}%` }}
                  />
                </div>
              </div>

              {/* Online Payment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <CreditCard className="w-4 h-4 text-[#2563EB]" />
                    Online Payment
                  </span>
                  <span className="text-[#0F172A] font-bold">
                    {channels.online} ({Math.round((channels.online / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${(channels.online / totalChannelOrders) * 100}%` }}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    WhatsApp Orders
                  </span>
                  <span className="text-[#0F172A] font-bold">
                    {channels.whatsapp} ({Math.round((channels.whatsapp / totalChannelOrders) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
        <div className="lg:col-span-7">
          {/* Mobile View: Standalone separate bars per product with NO outside box/background */}
          <div className="sm:hidden space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2563EB]" />
                Top Performing Products
              </h3>
              <p className="text-xs text-[#64748B]">Ranked by actual customer order sales</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-slate-200/90 shadow-sm">
                No product sales recorded in this period.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((prod, index) => (
                  <div
                    key={prod.productId}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-100">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A] truncate">{prod.name}</p>
                        <p className="text-[11px] text-[#64748B]">{prod.unitsSold} units ordered</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {formatCurrency(prod.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View: Full Card container (completely preserved) */}
          <Card className="hidden sm:block p-6 space-y-4 border border-slate-200/90 shadow-sm rounded-2xl bg-white">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2563EB]" />
                Top Performing Products
              </h3>
              <p className="text-xs text-[#64748B]">Ranked by actual customer order sales</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No product sales recorded in this period.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((prod, index) => (
                  <div
                    key={prod.productId}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-100">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A] truncate">{prod.name}</p>
                        <p className="text-[11px] text-[#64748B]">{prod.unitsSold} units ordered</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[#0F172A]">
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
