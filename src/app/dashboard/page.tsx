import React from "react";
import Link from "next/link";
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
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Store as StoreIcon,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);

  const [stats, ordersData] = await Promise.all([
    getDashboardStats(store!.id),
    listOrders(store!.id, { limit: 5, sortOrder: "desc" }),
  ]);

  const recentOrders = ordersData.data;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-blue-500/20 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Welcome back, {session?.user?.name || "Store Owner"}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Here is an overview of what is happening in <span className="text-white font-semibold">{store!.name}</span> today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/products/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Button>
          </Link>
          <Link href={`/store/${store!.slug}`} target="_blank">
            <Button variant="outline" size="md">
              <StoreIcon className="w-4 h-4 mr-1.5" />
              Live Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl font-black text-white">
              {formatCurrency(stats.revenue)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paid transactions</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
            <p className="text-[11px] text-amber-400 font-medium">
              {stats.pendingOrders} pending fulfillment
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

        {/* Active Products */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Catalog Items
            </span>
            <p className="text-2xl font-black text-white">{stats.activeProducts}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {stats.totalProducts} total products listed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </Card>

        {/* Customers */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <p className="text-2xl font-black text-white">{stats.totalCustomers}</p>
            <p className="text-[11px] text-purple-400 font-medium">
              Direct store buyers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <p className="text-xs text-slate-400">Latest incoming purchases from your store.</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            View all orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card className="p-0 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No orders yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your store link with customers to start receiving orders!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/60">
                  {recentOrders.map((order: OrderItem) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-400">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-200">{order.customer.name}</p>
                        <p className="text-xs text-slate-400">{order.customer.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{order.itemCount} items</td>
                      <td className="px-6 py-4 font-bold text-white">
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
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
