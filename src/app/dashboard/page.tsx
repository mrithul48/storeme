import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId, getDashboardStats } from "@/services/store.service";
import { listOrders } from "@/services/order.service";

type OrderItem = Awaited<ReturnType<typeof listOrders>>["data"][number];
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Store as StoreIcon,
} from "lucide-react";

import { RecentOrdersMobile } from "@/components/dashboard/recent-orders-mobile";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  let store = session.user.id ? await getStoreByOwnerId(session.user.id) : null;
  if (!store && session.user.email) {
    store = await getStoreByOwnerId(session.user.email);
  }

  if (!store) {
    redirect("/onboarding");
  }

  const [stats, ordersData] = await Promise.all([
    getDashboardStats(store.id),
    listOrders(store.id, { limit: 5, sortOrder: "desc" }),
  ]);

  const recentOrders = ordersData.data;
  const serializedRecentOrders = JSON.parse(JSON.stringify(recentOrders));

  const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    DELIVERED: "success",
    CONFIRMED: "info",
    PROCESSING: "warning",
    SHIPPED: "info",
    PENDING: "warning",
    CANCELLED: "danger",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner & Quick Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-600/50 to-indigo-500/90 border border-blue-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Welcome back, {session?.user?.name || "Store Owner"}
          </h1>
          <p className="text-xs sm:text-sm text-white">
            Here is an overview of what is happening in{" "}
          <span className="font-bold uppercase">{store.name}</span> today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/products/new" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="md" className="w-full sm:w-36 justify-center">
              <Plus className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Add Product</span>
            </Button>
          </Link>
          <Link href={`/store/${store.slug}`} target="_blank" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="md" className="w-full sm:w-36 justify-center">
              <StoreIcon className="w-4 h-4 mr-1.5 text-[#2563EB] shrink-0" />
              <span>Live Store</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid — 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Total Revenue
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">
              {formatCurrency(stats.revenue)}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Paid transactions</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <IndianRupee className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Total Orders
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">{stats.totalOrders}</p>
            <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium truncate">
              {stats.pendingOrders} pending
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Active Products */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Catalog Items
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">{stats.activeProducts}</p>
            <p className="text-[10px] sm:text-[11px] text-[#64748B] font-medium truncate">
              {stats.totalProducts} listed
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Customers */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate block">
              Total Customers
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">{stats.totalCustomers}</p>
            <p className="text-[10px] sm:text-[11px] text-purple-600 font-medium truncate">
              Store buyers
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Recent Orders</h2>
            <p className="text-xs text-[#64748B]">Latest incoming purchases from your store.</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 inline-flex items-center gap-1"
          >
            View all orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#0F172A]">No orders yet</p>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Share your store link with customers to start receiving orders!
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Mobile View: Standalone separate bars per order (no outside box/padding) */}
            <div className="md:hidden">
              <RecentOrdersMobile
                orders={serializedRecentOrders}
                statusVariantMap={statusVariantMap}
              />
            </div>

            {/* Desktop View: Full Table inside Card (completely untouched) */}
            <Card className="hidden md:block p-0 overflow-hidden border border-slate-200/90 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Order #</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order: OrderItem) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-[#2563EB]">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#0F172A]">{order.customer.name}</p>
                          <p className="text-xs text-[#64748B]">{order.customer.email}</p>
                        </td>
                        <td className="px-6 py-4 text-[#64748B]">{order.itemCount} items</td>
                        <td className="px-6 py-4 font-bold text-[#0F172A]">
                          {formatCurrency(Number(order.total))}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariantMap[order.status] || "neutral"}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#64748B]">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
