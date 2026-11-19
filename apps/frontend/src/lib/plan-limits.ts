// src/lib/plan-limits.ts
// Centralized server-side plan and feature entitlement enforcement

import { pgPool } from "@/lib/db-pg";

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
  const result = await pgPool.query(
    `SELECT sub.*, 
            json_build_object(
              'id', p.id,
              'name', p.name,
              'slug', p.slug,
              'price', p.price,
              'maxProducts', p."maxProducts",
              'maxOrdersPerMonth', p."maxOrdersPerMonth",
              'customDomainAccess', p."customDomainAccess",
              'advancedAnalytics', p."advancedAnalytics",
              'prioritySupport', p."prioritySupport",
              'features', p.features
            ) as plan
     FROM "Subscription" sub
     LEFT JOIN "Plan" p ON p.id = sub."planId"
     WHERE sub."storeId" = $1 LIMIT 1`,
    [storeId]
  );

  return result.rows[0] ?? null;
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
  const hasCustomDomain = plan?.customDomainAccess ?? (planName.toLowerCase().includes("scale") || planName.toLowerCase().includes("pro"));
  const hasAdvancedAnalytics = plan?.advancedAnalytics ?? true;
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
      if (!hasCustomDomain) {
        return {
          allowed: false,
          planName,
          reason: "Custom domain linking requires a plan with Custom Domain Access enabled (Scale Pro).",
        };
      }
      return { allowed: true, planName };

    case "ADVANCED_ANALYTICS":
      if (!hasAdvancedAnalytics) {
        return {
          allowed: false,
          planName,
          reason: "Advanced Analytics is not included in your current plan.",
        };
      }
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
  const [subscription, countResult] = await Promise.all([
    getStoreSubscription(storeId),
    pgPool.query(`SELECT COUNT(*)::text as count FROM "Product" WHERE "storeId" = $1`, [storeId]),
  ]);

  const currentCount = parseInt(countResult.rows[0]?.count || "0", 10);
  const maxAllowed = subscription?.plan?.maxProducts ?? 100;
  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}
