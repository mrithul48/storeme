// apps/backend/src/modules/plans/repositories/plans.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  PlanEntity,
  PlanWithActiveSubscriptionsCount,
} from '../interfaces/plan-entities.interface';

@Injectable()
export class PlansRepository {
  constructor(private readonly db: DatabaseService) {}

  async getPublicPlans(): Promise<PlanEntity[]> {
    const plans = await this.db.query<PlanEntity>(
      `SELECT * FROM "Plan"
       WHERE status = 'ACTIVE' AND "isPublic" = true
       ORDER BY "sortOrder" ASC, price ASC`,
    );

    return plans.map((p) => ({
      ...p,
      price: Number(p.price),
      yearlyPrice: p.yearlyPrice !== null ? Number(p.yearlyPrice) : null,
      features: Array.isArray(p.features) ? p.features : [],
    }));
  }

  async getAllPlansForAdmin(): Promise<PlanWithActiveSubscriptionsCount[]> {
    interface AdminPlanRow extends PlanEntity {
      active_subs: string;
    }

    const rows = await this.db.query<AdminPlanRow>(
      `SELECT p.*,
              COUNT(s.id) FILTER (WHERE s.status = 'ACTIVE')::text as active_subs
       FROM "Plan" p
       LEFT JOIN "Subscription" s ON s."planId" = p.id
       GROUP BY p.id
       ORDER BY p."sortOrder" ASC, p."createdAt" DESC`,
    );

    return rows.map((p) => ({
      ...p,
      price: Number(p.price),
      yearlyPrice: p.yearlyPrice !== null ? Number(p.yearlyPrice) : null,
      features: Array.isArray(p.features) ? p.features : [],
      activeSubscriptionsCount: parseInt(p.active_subs || '0', 10),
      _count: { subscriptions: parseInt(p.active_subs || '0', 10) },
    }));
  }

  async findById(id: string): Promise<PlanWithActiveSubscriptionsCount | null> {
    interface PlanRow extends PlanEntity {
      active_subs: string;
    }

    const row = await this.db.queryOne<PlanRow>(
      `SELECT p.*,
              COUNT(s.id) FILTER (WHERE s.status = 'ACTIVE')::text as active_subs
       FROM "Plan" p
       LEFT JOIN "Subscription" s ON s."planId" = p.id
       WHERE p.id = $1
       GROUP BY p.id
       LIMIT 1`,
      [id],
    );

    if (!row) return null;

    return {
      ...row,
      price: Number(row.price),
      yearlyPrice: row.yearlyPrice !== null ? Number(row.yearlyPrice) : null,
      features: Array.isArray(row.features) ? row.features : [],
      activeSubscriptionsCount: parseInt(row.active_subs || '0', 10),
      _count: { subscriptions: parseInt(row.active_subs || '0', 10) },
    };
  }

  async findBySlug(slug: string): Promise<PlanEntity | null> {
    return this.db.queryOne<PlanEntity>(
      `SELECT * FROM "Plan" WHERE slug = $1 LIMIT 1`,
      [slug],
    );
  }

  async createPlan(data: Partial<PlanEntity> & { name: string; slug: string; price: number }): Promise<PlanEntity> {
    const created = await this.db.queryOne<PlanEntity>(
      `INSERT INTO "Plan" (
        id, name, slug, description, price, "yearlyPrice", features,
        "maxProducts", "maxOrders", "maxImages", "maxMonthlyOrders", "customDomainAccess",
        "advancedAnalytics", "premiumThemes", "sortOrder", "isFeatured", "isPublic",
        badge, status, limits, "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, COALESCE($11, false),
        COALESCE($12, false), COALESCE($13, false), COALESCE($14, 0), COALESCE($15, false), COALESCE($16, true),
        $17, COALESCE($18, 'ACTIVE'), $19, NOW()
      ) RETURNING *`,
      [
        data.name,
        data.slug,
        data.description ?? null,
        data.price,
        data.yearlyPrice ?? null,
        data.features ? JSON.stringify(data.features) : null,
        data.maxProducts ?? null,
        data.maxOrders ?? null,
        data.maxImages ?? null,
        data.maxMonthlyOrders ?? null,
        data.customDomainAccess ?? null,
        data.advancedAnalytics ?? null,
        data.premiumThemes ?? null,
        data.sortOrder ?? null,
        data.isFeatured ?? null,
        data.isPublic ?? null,
        data.badge ?? null,
        data.status ?? null,
        data.limits ? JSON.stringify(data.limits) : null,
      ],
    );

    return {
      ...created!,
      price: Number(created!.price),
      yearlyPrice: created!.yearlyPrice !== null ? Number(created!.yearlyPrice) : null,
      features: Array.isArray(created!.features) ? created!.features : [],
    };
  }

  async updatePlan(id: string, data: Partial<PlanEntity>): Promise<PlanEntity> {
    const columnMap: Record<string, string> = {
      name: 'name',
      slug: 'slug',
      description: 'description',
      price: 'price',
      yearlyPrice: '"yearlyPrice"',
      features: 'features',
      maxProducts: '"maxProducts"',
      maxOrders: '"maxOrders"',
      maxImages: '"maxImages"',
      maxMonthlyOrders: '"maxMonthlyOrders"',
      customDomainAccess: '"customDomainAccess"',
      advancedAnalytics: '"advancedAnalytics"',
      premiumThemes: '"premiumThemes"',
      sortOrder: '"sortOrder"',
      isFeatured: '"isFeatured"',
      isPublic: '"isPublic"',
      badge: 'badge',
      status: 'status',
      limits: 'limits',
    };

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [prop, col] of Object.entries(columnMap)) {
      if ((data as Record<string, unknown>)[prop] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        const val = (data as Record<string, unknown>)[prop];
        values.push(
          prop === 'features' || prop === 'limits'
            ? val !== null
              ? JSON.stringify(val)
              : null
            : val,
        );
      }
    }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);

    const updated = await this.db.queryOne<PlanEntity>(
      `UPDATE "Plan" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    return {
      ...updated!,
      price: Number(updated!.price),
      yearlyPrice: updated!.yearlyPrice !== null ? Number(updated!.yearlyPrice) : null,
      features: Array.isArray(updated!.features) ? updated!.features : [],
    };
  }

  async deprecatePlan(id: string): Promise<PlanEntity> {
    const updated = await this.db.queryOne<PlanEntity>(
      `UPDATE "Plan" SET status = 'DEPRECATED', "isPublic" = false, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return updated!;
  }
}

