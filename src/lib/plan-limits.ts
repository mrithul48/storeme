// src/lib/plan-limits.ts
// Centralized server-side plan and feature entitlement enforcement

import { prisma } from "@/lib/db";

export type PlanFeature =
  | "CUSTOM_DOMAIN"
  | "ADVANCED_ANALYTICS"
  | "TRANSACTIONAL_EMAIL"
  | "WHATSAPP_RECEIPTS";

export interface PlanAccessResult {
  allowed: boolean;
  planName: string;
  reason?: string;
}

/**
 * Get active subscription and plan for a store
 */
export async function getStoreSubscription(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  return store?.subscription ?? null;
}

/**
 * Authoritative backend feature access check
 */
export async function checkPlanAccess(
  storeId: string,
  feature: PlanFeature
): Promise<PlanAccessResult> {
  const subscription = await getStoreSubscription(storeId);
  const plan = subscription?.plan;
  const planName = plan?.name || "Growth Plan";
  const isScalePro = planName.toLowerCase().includes("scale") || planName.toLowerCase().includes("pro");

  switch (feature) {
    case "CUSTOM_DOMAIN":
      // Development-only bypass when explicitly configured in env
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.CUSTOM_DOMAIN_TEST_BYPASS === "true"
      ) {
        return { allowed: true, planName: `${planName} (Dev Bypass Active)` };
      }
      if (!isScalePro) {
        return {
          allowed: false,
          planName,
          reason: "Custom domain linking requires the Scale Pro plan (₹499/mo).",
        };
      }
      return { allowed: true, planName };

    case "ADVANCED_ANALYTICS":
      // Available on Growth & Pro
      return { allowed: true, planName };

    case "TRANSACTIONAL_EMAIL":
      if (!isScalePro) {
        return {
          allowed: false,
          planName,
          reason: "Transactional Brevo email delivery requires the Scale Pro plan.",
        };
      }
      return { allowed: true, planName };

    case "WHATSAPP_RECEIPTS":
      return {
        allowed: false,
        planName,
        reason: "WhatsApp automated receipts API is coming soon in the Enterprise tier.",
      };

    default:
      return { allowed: true, planName };
  }
}

/**
 * Validate product creation limits
 */
export async function checkProductLimit(storeId: string): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number }> {
  const [subscription, currentCount] = await Promise.all([
    getStoreSubscription(storeId),
    prisma.product.count({ where: { storeId } }),
  ]);

  const maxAllowed = subscription?.plan?.maxProducts ?? 100;
  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}
