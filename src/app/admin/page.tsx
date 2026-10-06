import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingBag, Users, IndianRupee, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default async function PlatformAdminDashboardPage() {
  // Execute optimized aggregate queries in parallel
  const [
    totalStores,
    activeStores,
    totalUsers,
    totalOrders,
    activeSubscriptions,
    revenueAggregate,
    recentStores,
    recentOrders,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.store.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { email: true, name: true } },
        subscription: { include: { plan: true } },
        _count: { select: { orders: true, products: true } },
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        store: { select: { name: true, slug: true } },
        customer: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalRevenue = revenueAggregate._sum.total ? Number(revenueAggregate._sum.total) : 0;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      desc: "Gross platform settled volume",
      icon: IndianRupee,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total Stores",
      value: totalStores,
      desc: `${activeStores} currently active`,
      icon: Store,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total Platform Users",
      value: totalUsers,
      desc: "Registered merchant accounts",
      icon: Users,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Cross-Store Orders",
      value: totalOrders,
      desc: "Processed across all tenants",
      icon: ShoppingBag,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      desc: "Merchant SaaS subscribers",
      icon: ShieldCheck,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Global multi-tenant overview, store fleet metrics, and cross-tenant orders.
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-5 space-y-3 bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Stores & Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Stores */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-400" />
              Latest Stores Registered
            </h2>
            <Link
              href="/admin/stores"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              View all stores
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
            <div className="divide-y divide-slate-800/60">
              {recentStores.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-1 min-w-0 pr-4">
                    <p className="font-bold text-sm text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      Owner: {s.owner.name || s.owner.email}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{s._count.products} products</span>
                      <span>•</span>
                      <span>{s._count.orders} orders</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "danger"}>
                      {s.status}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {s.subscription?.plan?.name || "Free/Default"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Platform Orders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Cross-Store Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              View all orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
            <div className="divide-y divide-slate-800/60">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No orders across the platform yet.
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-blue-400">
                          #{o.orderNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          on {o.store.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate">
                        {o.customer?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="font-bold text-sm text-white">
                        {formatCurrency(Number(o.total))}
                      </span>
                      <Badge variant={o.paymentStatus === "PAID" ? "success" : "warning"}>
                        {o.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
