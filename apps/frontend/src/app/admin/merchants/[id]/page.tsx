import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Store,
  Users,
  CreditCard,
  Package,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Globe,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default async function AdminMerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, createdAt: true } },
      company: true,
      subscription: {
        include: { plan: true },
      },
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        },
      },
    },
  });

  if (!store) {
    notFound();
  }

  // Get settled revenue and recent orders for this store
  const [revenueSum, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId: id, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId: id },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
      },
    }),
  ]);

  const settledRevenue = revenueSum._sum.total ? Number(revenueSum._sum.total) : 0;
  const plan = store.subscription?.plan;
  const isSuspended = store.status === "SUSPENDED";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/merchants"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Merchants
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {store.name}
            </h1>
            <Badge variant={isSuspended ? "danger" : "success"}>
              {store.status}
            </Badge>
          </div>
          <p className="text-xs font-mono text-slate-500">
            Store ID: {store.id} • Slug: /{store.slug}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/store/${store.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1 text-blue-400" />
              Visit Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Settled Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatCurrency(settledRevenue)}
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Products Catalog</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">{store._count.products}</p>
            <span className="text-xs text-slate-500">
              / {plan?.maxProducts ? `${plan.maxProducts} max` : "Unlimited"}
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{store._count.orders}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Current SaaS Plan</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-white">
            {plan?.name || "Growth Plan"}
          </p>
        </Card>
      </div>

      {/* Two Columns: Merchant Info & Plan Entitlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant & Store Profile */}
        <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            Store & Owner Profile
          </h2>

          <div className="space-y-3 text-xs divide-y divide-slate-800/60">
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Owner Name</span>
              <span className="font-semibold text-white">{store.owner.name || "Merchant"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Owner Email</span>
              <span className="font-mono text-slate-200">{store.owner.email}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Custom Domain</span>
              <span className="font-mono text-slate-200">
                {store.customDomain || "Not configured"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Business Type</span>
              <span className="text-slate-200">
                {store.company?.businessType || "Retail Store"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Registration Date</span>
              <span className="text-slate-200">{formatDateTime(store.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Plan Entitlements & Subscription Details */}
        <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            SaaS Subscription Entitlements
          </h2>

          <div className="space-y-3 text-xs divide-y divide-slate-800/60">
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Plan Name</span>
              <span className="font-bold text-white">{plan?.name || "Growth Plan"}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Subscription Status</span>
              <Badge variant={store.subscription?.status === "ACTIVE" ? "success" : "warning"}>
                {store.subscription?.status || "ACTIVE"}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Billing Period</span>
              <span className="font-mono text-slate-200">
                {store.subscription?.billingPeriod || "YEARLY"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Custom Domain Entitlement</span>
              <Badge variant={plan?.customDomainAccess ? "success" : "neutral"}>
                {plan?.customDomainAccess ? "Enabled" : "Disabled (Plan Restriction)"}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Advanced Analytics Entitlement</span>
              <Badge variant={plan?.advancedAnalytics ? "success" : "neutral"}>
                {plan?.advancedAnalytics ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          Recent Orders from Store
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase">
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-white">
                    {o.orderNumber}
                  </td>
                  <td className="p-3">
                    <div>{o.customer?.name || "Customer"}</div>
                    <div className="text-[11px] text-slate-500">{o.customer?.email}</div>
                  </td>
                  <td className="p-3 font-bold text-white">
                    {formatCurrency(Number(o.total))}
                  </td>
                  <td className="p-3">
                    <Badge variant={o.paymentStatus === "PAID" ? "success" : "neutral"}>
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="info">{o.status}</Badge>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {formatDateTime(o.createdAt)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No orders recorded for this merchant yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

