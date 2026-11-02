import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId, getDashboardStats } from "@/services/store.service";
import { listOrders } from "@/services/order.service";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Plus,
  ArrowUpRight,
  IndianRupee,
  Store as StoreIcon,
} from "lucide-react";
import { RecentOrdersMobile, MobileOrderItem } from "@/components/dashboard/recent-orders-mobile";

type OrderItem = {
  id: string;
  orderNumber: string;
  total: number | string | any;
  status: string;
  paymentStatus: string;
  orderChannel?: string | null;
  paymentMethod?: string | null;
  createdAt: Date;
  itemCount: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
};

export default async function DashboardPage() {
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
    listOrders(store.id, { limit: 6, sortOrder: "desc" }),
  ]);

  const recentOrders = ordersData.data;

  const serializedRecentOrders: MobileOrderItem[] = recentOrders.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    orderChannel: o.orderChannel || null,
    paymentMethod: o.paymentMethod || null,
    total: Number(o.total),
    createdAt: new Date(o.createdAt).toISOString(),
    itemCount: o.itemCount,
    customer: {
      name: o.customer.name,
      email: o.customer.email,
      phone: o.customer.phone,
    },
  }));

  const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    DELIVERED: "success",
    CONFIRMED: "info",
    SHIPPED: "info",
    PROCESSING: "warning",
    PENDING: "warning",
    CANCELLED: "danger",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pt-3.5 sm:pt-0">
      {/* Welcome Banner & Quick Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#101A3D] via-[#172653] to-[#1C3066] border border-[#202D55] shadow-xl shadow-black/20">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FF] tracking-tight">
            Welcome back, {session?.user?.name || "Store Owner"}
          </h1>
          <p className="text-xs sm:text-sm text-[#A5B2D1]">
            Here is an overview of what is happening in{" "}
            <span className="font-bold text-[#F5F7FF] uppercase">{store.name}</span> today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/dashboard/products/new" className="flex-1 sm:flex-initial">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-36 justify-center text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap shadow-sm shadow-[#4169E1]/25"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
              <span>Add Product</span>
            </Button>
          </Link>
          <Link href={`/store/${store.slug}`} target="_blank" className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-36 justify-center text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap"
            >
              <StoreIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-[#638BFF] shrink-0" />
              <span>Live Store</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid — 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between border border-[#202D55] bg-[#101A3D] hover:bg-[#172653]/60 hover:border-[#4169E1]/40 transition-all shadow-sm">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#7181A8] uppercase tracking-wider truncate block">
              Total Revenue
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#F5F7FF] truncate">
              {formatCurrency(stats.revenue)}
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#22C55E] font-semibold truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Paid transactions</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#172653] border border-[#202D55] text-[#638BFF] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <IndianRupee className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between border border-[#202D55] bg-[#101A3D] hover:bg-[#172653]/60 hover:border-[#4169E1]/40 transition-all shadow-sm">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#7181A8] uppercase tracking-wider truncate block">
              Total Orders
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#F5F7FF] truncate">{stats.totalOrders}</p>
            <p className="text-[10px] sm:text-[11px] text-[#F59E0B] font-medium truncate">
              {stats.pendingOrders} pending
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Active Products */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between border border-[#202D55] bg-[#101A3D] hover:bg-[#172653]/60 hover:border-[#4169E1]/40 transition-all shadow-sm">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#7181A8] uppercase tracking-wider truncate block">
              Catalog Items
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#F5F7FF] truncate">{stats.activeProducts}</p>
            <p className="text-[10px] sm:text-[11px] text-[#7181A8] font-medium truncate">
              {stats.totalProducts} listed
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>

        {/* Customers */}
        <Card className="p-3.5 sm:p-5 flex items-center justify-between border border-[#202D55] bg-[#101A3D] hover:bg-[#172653]/60 hover:border-[#4169E1]/40 transition-all shadow-sm">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-[#7181A8] uppercase tracking-wider truncate block">
              Total Customers
            </span>
            <p className="text-lg sm:text-2xl font-black text-[#F5F7FF] truncate">{stats.totalCustomers}</p>
            <p className="text-[10px] sm:text-[11px] text-[#8BA8FF] font-medium truncate">
              Store buyers
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#8BA8FF]/15 border border-[#8BA8FF]/30 text-[#8BA8FF] flex items-center justify-center shrink-0 ml-1.5 sm:ml-2">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FF] tracking-tight">Recent Orders</h2>
            <p className="text-xs text-[#7181A8]">Latest incoming purchases from your store.</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-[#638BFF] hover:text-[#8BA8FF] inline-flex items-center gap-1 transition-colors"
          >
            View all orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="p-0 overflow-hidden border border-[#202D55] bg-[#101A3D] shadow-sm">
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-[#7181A8]/50 mx-auto" />
              <p className="text-sm font-semibold text-[#F5F7FF]">No orders yet</p>
              <p className="text-xs text-[#7181A8] max-w-sm mx-auto">
                Share your store link with customers to start receiving orders!
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Mobile View: Standalone separate bars per order */}
            <div className="md:hidden">
              <RecentOrdersMobile
                orders={serializedRecentOrders}
                statusVariantMap={statusVariantMap}
              />
            </div>

            {/* Desktop View: Full Table inside Card */}
            <Card className="hidden md:block p-0 overflow-hidden border border-[#202D55] bg-[#101A3D] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0A1030] text-xs font-semibold text-[#7181A8] uppercase border-b border-[#202D55]">
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
                  <tbody className="divide-y divide-[#172347]">
                    {recentOrders.map((order: OrderItem) => (
                      <tr key={order.id} className="hover:bg-[#172653]/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-[#638BFF]">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#F5F7FF]">{order.customer.name}</p>
                          <p className="text-xs text-[#7181A8]">{order.customer.email}</p>
                        </td>
                        <td className="px-6 py-4 text-[#A5B2D1]">{order.itemCount} items</td>
                        <td className="px-6 py-4 font-bold text-[#F5F7FF]">
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
                        <td className="px-6 py-4 text-xs text-[#7181A8]">
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
