import React from "react";
import { prisma } from "@/lib/db";
import { AdminPlansClient } from "./admin-plans-client";
import { PlanItem } from "@/services/plan.service";

export default async function AdminPlansPage() {
  let plans: any[] = [];
  try {
    plans = await (prisma.plan as any).findMany();
  } catch (e) {
    console.warn("Could not query plans from database:", e);
  }

  const formatted: PlanItem[] = plans.map((p: any) => {
    const feat =
      typeof p.features === "object" && p.features !== null
        ? (p.features as Record<string, any>)
        : {};
    const featureList = Array.isArray(p.features)
      ? (p.features as string[])
      : Array.isArray(feat.list)
      ? feat.list
      : [];

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price || 0),
      yearlyPrice: p.yearlyPrice ? Number(p.yearlyPrice) : null,
      features: featureList,
      maxProducts: p.maxProducts ?? null,
      maxOrders: p.maxOrders ?? null,
      maxImages: p.maxImages ?? null,
      maxMonthlyOrders: p.maxMonthlyOrders ?? p.maxOrders ?? null,
      customDomainAccess: Boolean(p.customDomainAccess ?? feat.customDomainAccess),
      advancedAnalytics: Boolean(p.advancedAnalytics ?? feat.advancedAnalytics),
      premiumThemes: Boolean(p.premiumThemes ?? feat.premiumThemes),
      sortOrder: Number(p.sortOrder ?? 0),
      isFeatured: Boolean(p.isFeatured ?? feat.isFeatured),
      isPublic: Boolean(p.isPublic ?? true),
      badge: (p.badge || feat.badge || null) as string | null,
      status: (p.status as "ACTIVE" | "COMING_SOON" | "DEPRECATED") || "ACTIVE",
      activeSubscriptionsCount: p._count?.subscriptions ?? 0,
    };
  });

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

