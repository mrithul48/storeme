import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store,
  ShoppingBag,
  Users,
  IndianRupee,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Layers,
  Settings,
} from "lucide-react";

export default async function PlatformAdminDashboardPage() {
  // Execute optimized aggregate queries in parallel
  const [
    totalStores,
    activeStores,
    totalMerchants,
    totalOrders,
    activeSubscriptions,
    mrrAggregate,
    revenueAggregate,
    recentStores,
    recentPayments,
    plansWithCounts,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: { select: { price: true, yearlyPrice: true } } },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.store.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, email: true, name: true, createdAt: true } },
        subscription: { include: { plan: true } },
        _count: { select: { orders: true, products: true } },
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            store: { select: { name: true, slug: true } },
            customer: { select: { name: true, email: true } },
          },
        },
      },
    }),
    prisma.plan.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: {
          select: { subscriptions: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Calculate MRR
  const mrr = mrrAggregate.reduce((acc, sub) => {
    if (!sub.plan) return acc;
    if (sub.billingPeriod === "YEARLY" && sub.plan.yearlyPrice) {
      return acc + Number(sub.plan.yearlyPrice) / 12;
    }
    return acc + Number(sub.plan.price);
  }, 0);

  const totalRevenue = revenueAggregate._sum.total ? Number(revenueAggregate._sum.total) : 0;

  const statCards = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(Math.round(mrr)),
      desc: "Normalized monthly SaaS MRR",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      desc: "Merchant SaaS subscribers",
      icon: ShieldCheck,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Total Merchants",
      value: totalMerchants,
      desc: "Registered merchant accounts",
      icon: Users,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Total Stores",
      value: totalStores,
      desc: `${activeStores} currently active`,
      icon: Store,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Gross Settled GMV",
      value: formatCurrency(totalRevenue),
      desc: "Gross platform settled volume",
      icon: IndianRupee,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-tenant SaaS oversight, subscription analytics, and platform governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/plans">
            <Button variant="outline" size="sm">
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Manage Plans
            </Button>
          </Link>
          <Link href="/admin/cms">
            <Button variant="primary" size="sm">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Landing Page CMS
            </Button>
          </Link>
        </div>
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

      {/* Subscription Plans Distribution */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Active Plan Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Active subscriptions across all published pricing tiers.
            </p>
          </div>
          <Link
            href="/admin/plans"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
          >
            Configure plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {plansWithCounts.map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{plan.name}</span>
                <Badge variant={plan.isFeatured ? "info" : "neutral"}>
                  ₹{Number(plan.price)}/mo
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-400">
                  {plan._count.subscriptions}
                </span>
                <span className="text-xs text-slate-500">active merchants</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Merchants & Recent Payments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Merchants */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Latest Merchants Registered
            </h2>
            <Link
              href="/admin/merchants"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              View all merchants
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
            <div className="divide-y divide-slate-800/60">
              {recentStores.map((s) => (
                <div
                  key={s.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <p className="font-bold text-sm text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      Owner: {s.owner?.name || s.owner?.email || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{s._count.products} products</span>
                      <span>•</span>
                      <span>{s._count.orders} orders</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "warning"}>
                      {s.status}
                    </Badge>
                    <span className="text-[11px] text-slate-500">
                      {s.subscription?.plan?.name || "Free"}
                    </span>
                  </div>
                </div>
              ))}
              {recentStores.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No registered stores found.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Billing & Gateway Payments */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Recent Gateway Transactions
            </h2>
            <Link
              href="/admin/transactions"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              View all transactions
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
            <div className="divide-y divide-slate-800/60">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <p className="font-bold text-sm text-slate-200 truncate">
                      {formatCurrency(Number(p.amount))}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Store: {p.order?.store?.name || "Platform Subscription"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatDateTime(p.createdAt)} • {p.razorpayPaymentId ? "Razorpay" : "Online Gateway"}
                    </p>
                  </div>
                  <Badge variant={p.status === "PAID" ? "success" : "neutral"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No payment transactions recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
