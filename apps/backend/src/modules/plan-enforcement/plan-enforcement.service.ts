// apps/backend/src/modules/plan-enforcement/plan-enforcement.service.ts
import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface PlanLimitStatus {
  allowed: boolean;
  currentProducts: number;
  maxProducts: number;
  planName: string;
  customDomainAccess: boolean;
  advancedAnalytics: boolean;
  premiumThemes: boolean;
}

interface SubscriptionWithPlanRow {
  sub_id: string;
  sub_status: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_maxProducts: number;
  plan_customDomainAccess: boolean;
  plan_advancedAnalytics: boolean;
  plan_premiumThemes: boolean;
}

@Injectable()
export class PlanEnforcementService {
  private readonly logger = new Logger(PlanEnforcementService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Retrieve active subscription and plan for a store.
   * If no subscription exists, falls back to default free/growth limits.
   */
  async getStoreSubscriptionAndPlan(storeId: string) {
    const row = await this.db.queryOne<SubscriptionWithPlanRow>(
      `SELECT s.id as sub_id, s.status as sub_status,
              p.id as plan_id, p.name as plan_name, p.price as plan_price,
              p."maxProducts" as "plan_maxProducts",
              p."customDomainAccess" as "plan_customDomainAccess",
              p."advancedAnalytics" as "plan_advancedAnalytics",
              p."premiumThemes" as "plan_premiumThemes"
       FROM "Subscription" s
       LEFT JOIN "Plan" p ON s."planId" = p.id
       WHERE s."storeId" = $1
       ORDER BY s."createdAt" DESC
       LIMIT 1`,
      [storeId],
    );

    if (!row) return null;

    return {
      id: row.sub_id,
      status: row.sub_status,
      plan: {
        id: row.plan_id,
        name: row.plan_name,
        price: Number(row.plan_price),
        maxProducts: row.plan_maxProducts,
        customDomainAccess: row.plan_customDomainAccess,
        advancedAnalytics: row.plan_advancedAnalytics,
        premiumThemes: row.plan_premiumThemes,
      },
    };
  }

  /**
   * Get store plan usage and limits summary
   */
  async getStoreLimitsSummary(storeId: string): Promise<PlanLimitStatus> {
    const [sub, countRow] = await Promise.all([
      this.getStoreSubscriptionAndPlan(storeId),
      this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM "Product" WHERE "storeId" = $1`,
        [storeId],
      ),
    ]);

    const currentProducts = countRow ? parseInt(countRow.count, 10) : 0;
    const plan = sub?.plan;
    const maxProducts = plan?.maxProducts ?? 100;
    const planName = plan?.name || 'Growth Plan';
    const isScalePro = planName.toLowerCase().includes('scale') || planName.toLowerCase().includes('pro');

    const customDomainAccess = plan?.customDomainAccess ?? isScalePro;
    const advancedAnalytics = plan?.advancedAnalytics ?? true;
    const premiumThemes = plan?.premiumThemes ?? isScalePro;

    return {
      allowed: currentProducts < maxProducts,
      currentProducts,
      maxProducts,
      planName,
      customDomainAccess,
      advancedAnalytics,
      premiumThemes,
    };
  }

  /**
   * Enforce product creation limit.
   * Throws ForbiddenException (403) when product limit is reached.
   */
  async validateProductCreation(storeId: string): Promise<void> {
    const limits = await this.getStoreLimitsSummary(storeId);
    if (!limits.allowed) {
      throw new ForbiddenException(
        `Product limit reached (${limits.currentProducts}/${limits.maxProducts}) for your current plan '${limits.planName}'. Please upgrade your subscription to add more products.`,
      );
    }
  }

  /**
   * Enforce custom domain linking permission.
   * Throws ForbiddenException (403) if custom domain is not permitted.
   */
  async validateCustomDomainAccess(storeId: string): Promise<void> {
    // Development-only bypass if explicitly configured
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.CUSTOM_DOMAIN_TEST_BYPASS === 'true'
    ) {
      return;
    }

    const limits = await this.getStoreLimitsSummary(storeId);
    if (!limits.customDomainAccess) {
      throw new ForbiddenException(
        `Custom domain linking requires the Scale Pro plan (₹499/mo). Your current plan is '${limits.planName}'.`,
      );
    }
  }
}
