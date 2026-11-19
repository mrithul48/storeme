import React from "react";
import { prisma } from "@/lib/db";
import { AdminMerchantsClient, MerchantItem } from "./admin-merchants-client";

export default async function AdminMerchantsPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      subscription: {
        include: { plan: { select: { name: true, price: true } } },
      },
      _count: { select: { products: true, orders: true } },
    },
  });

  const formatted: MerchantItem[] = stores.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    status: s.status as "ACTIVE" | "SUSPENDED",
    createdAt: s.createdAt,
    owner: s.owner,
    subscription: s.subscription
      ? {
          id: s.subscription.id,
          status: s.subscription.status,
          billingPeriod: s.subscription.billingPeriod,
          plan: s.subscription.plan
            ? {
                name: s.subscription.plan.name,
                price: Number(s.subscription.plan.price),
              }
            : null,
        }
      : null,
    _count: s._count,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Merchants Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Supervise tenant stores, enforce compliance, view subscription plans, and suspend or reactivate accounts.
        </p>
      </div>

      <AdminMerchantsClient initialMerchants={formatted} />
    </div>
  );
}

