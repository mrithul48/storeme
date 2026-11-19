import React from "react";
import { prisma } from "@/lib/db";
import { AdminPlansClient } from "./admin-plans-client";
import { PlanItem } from "@/services/plan.service";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { subscriptions: { where: { status: "ACTIVE" } } },
      },
    },
  });

  const formatted: PlanItem[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    yearlyPrice: p.yearlyPrice ? Number(p.yearlyPrice) : null,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    maxProducts: p.maxProducts,
    maxOrders: p.maxOrders,
    maxImages: p.maxImages,
    maxMonthlyOrders: p.maxMonthlyOrders,
    customDomainAccess: p.customDomainAccess,
    advancedAnalytics: p.advancedAnalytics,
    premiumThemes: p.premiumThemes,
    sortOrder: p.sortOrder,
    isFeatured: p.isFeatured,
    isPublic: p.isPublic,
    badge: p.badge,
    status: p.status as "ACTIVE" | "COMING_SOON" | "DEPRECATED",
    activeSubscriptionsCount: p._count.subscriptions,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SaaS Subscription Plans CMS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Centrally configure subscription plans, pricing tiers, product limits, feature entitlements, and landing page visibility.
        </p>
      </div>

      <AdminPlansClient initialPlans={formatted} />
    </div>
  );
}

