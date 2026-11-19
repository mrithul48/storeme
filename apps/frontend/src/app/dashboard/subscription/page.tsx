import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { getPublicPlans, PlanItem } from "@/services/plan.service";
import { SubscriptionClient } from "./subscription-client";

export default async function DashboardSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get merchant store with populated subscription details
  const store = await getStoreByOwnerId(session.user.id);

  if (!store) {
    redirect("/onboarding");
  }

  // Fetch all active plans
  const plans = await getPublicPlans();

  const formattedPlans: PlanItem[] = plans.map((p) => ({
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
  }));

  const formattedSubscription = store.subscription
    ? {
        id: store.subscription.id,
        status: store.subscription.status,
        billingPeriod: store.subscription.billingPeriod,
        currentPeriodStart: store.subscription.currentPeriodStart,
        currentPeriodEnd: store.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: store.subscription.cancelAtPeriodEnd,
        plan: store.subscription.plan
          ? {
              id: store.subscription.plan.id,
              name: store.subscription.plan.name,
              price: Number(store.subscription.plan.price),
              yearlyPrice: store.subscription.plan.yearlyPrice
                ? Number(store.subscription.plan.yearlyPrice)
                : null,
              maxProducts: store.subscription.plan.maxProducts,
              customDomainAccess: store.subscription.plan.customDomainAccess,
              advancedAnalytics: store.subscription.plan.advancedAnalytics,
              premiumThemes: store.subscription.plan.premiumThemes,
              features: Array.isArray(store.subscription.plan.features)
                ? (store.subscription.plan.features as string[])
                : [],
            }
          : null,
      }
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Subscription & Billing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your SaaS plan, review feature entitlements, monitor product limits, and view past billing receipts.
        </p>
      </div>

      <SubscriptionClient
        storeId={store.id}
        storeName={store.name}
        currentSubscription={formattedSubscription}
        productCount={store._count?.products ?? 0}
        availablePlans={formattedPlans}
        payments={[]}
      />
    </div>
  );
}

