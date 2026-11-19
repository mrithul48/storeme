// apps/backend/src/modules/subscriptions/repositories/subscriptions.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  SubscriptionEntity,
  PaymentEntity,
} from '../interfaces/subscription-entities.interface';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findStoreWithSubscriptionAndPlan(storeId: string) {
    interface Row {
      sub_id: string;
      sub_storeId: string;
      sub_planId: string;
      sub_status: string;
      sub_billingPeriod: string;
      sub_currentPeriodStart: Date;
      sub_currentPeriodEnd: Date;
      sub_cancelAtPeriodEnd: boolean;
      sub_cancelledAt: Date | null;
      sub_razorpaySubscriptionId: string | null;
      sub_razorpayPaymentId: string | null;
      plan_id: string;
      plan_name: string;
      plan_slug: string;
      plan_price: number;
      plan_yearlyPrice: number | null;
      plan_features: Record<string, unknown> | null;
    }

    const row = await this.db.queryOne<Row>(
      `SELECT s.id as sub_id, s."storeId" as "sub_storeId", s."planId" as "sub_planId",
              s.status as sub_status, s."billingPeriod" as "sub_billingPeriod",
              s."currentPeriodStart" as "sub_currentPeriodStart", s."currentPeriodEnd" as "sub_currentPeriodEnd",
              s."cancelAtPeriodEnd" as "sub_cancelAtPeriodEnd", s."cancelledAt" as "sub_cancelledAt",
              s."razorpaySubscriptionId" as "sub_razorpaySubscriptionId", s."razorpayPaymentId" as "sub_razorpayPaymentId",
              p.id as plan_id, p.name as plan_name, p.slug as plan_slug, p.price as plan_price,
              p."yearlyPrice" as "plan_yearlyPrice", p.features as plan_features
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
      storeId: row.sub_storeId,
      planId: row.sub_planId,
      status: row.sub_status,
      billingPeriod: row.sub_billingPeriod,
      currentPeriodStart: row.sub_currentPeriodStart,
      currentPeriodEnd: row.sub_currentPeriodEnd,
      cancelAtPeriodEnd: row.sub_cancelAtPeriodEnd,
      cancelledAt: row.sub_cancelledAt,
      razorpaySubscriptionId: row.sub_razorpaySubscriptionId,
      razorpayPaymentId: row.sub_razorpayPaymentId,
      plan: {
        id: row.plan_id,
        name: row.plan_name,
        slug: row.plan_slug,
        price: Number(row.plan_price),
        yearlyPrice: row.plan_yearlyPrice !== null ? Number(row.plan_yearlyPrice) : null,
        features: row.plan_features,
      },
    };
  }

  async findPaymentsBySubscriptionId(subscriptionId: string, limit = 10): Promise<PaymentEntity[]> {
    const rows = await this.db.query<PaymentEntity>(
      `SELECT id, amount, currency, status, "razorpayPaymentId", "createdAt"
       FROM "Payment"
       WHERE "subscriptionId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      [subscriptionId, limit],
    );
    return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
  }

  async findStoreWithOwner(storeId: string) {
    return this.db.queryOne<{
      id: string;
      slug: string;
      name: string;
      owner_name: string;
      owner_email: string;
    }>(
      `SELECT s.id, s.slug, s.name, u.name as owner_name, u.email as owner_email
       FROM "Store" s
       JOIN "User" u ON s."ownerId" = u.id
       WHERE s.id = $1 LIMIT 1`,
      [storeId],
    );
  }

  async findActivePlanById(planId: string) {
    return this.db.queryOne<{
      id: string;
      name: string;
      slug: string;
      price: number;
      yearlyPrice: number | null;
      status: string;
    }>(
      `SELECT id, name, slug, price, "yearlyPrice", status
       FROM "Plan" WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [planId],
    );
  }

  async findPlanById(planId: string) {
    return this.db.queryOne<{
      id: string;
      name: string;
      slug: string;
      price: number;
      yearlyPrice: number | null;
    }>(
      `SELECT id, name, slug, price, "yearlyPrice"
       FROM "Plan" WHERE id = $1 LIMIT 1`,
      [planId],
    );
  }

  async upsertSubscription(
    client: IDbExecutor,
    data: {
      storeId: string;
      planId: string;
      status: string;
      billingPeriod: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      cancelledAt: Date | null;
      razorpayPaymentId: string;
    },
  ): Promise<SubscriptionEntity> {
    return (await client.queryOne<SubscriptionEntity>(
      `INSERT INTO "Subscription" (
        id, "storeId", "planId", status, "billingPeriod", "currentPeriodStart",
        "currentPeriodEnd", "cancelAtPeriodEnd", "cancelledAt", "razorpayPaymentId", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      )
      ON CONFLICT ("storeId") DO UPDATE SET
        "planId" = EXCLUDED."planId",
        status = EXCLUDED.status,
        "billingPeriod" = EXCLUDED."billingPeriod",
        "currentPeriodStart" = EXCLUDED."currentPeriodStart",
        "currentPeriodEnd" = EXCLUDED."currentPeriodEnd",
        "cancelAtPeriodEnd" = EXCLUDED."cancelAtPeriodEnd",
        "cancelledAt" = EXCLUDED."cancelledAt",
        "razorpayPaymentId" = EXCLUDED."razorpayPaymentId",
        "updatedAt" = NOW()
      RETURNING *`,
      [
        data.storeId,
        data.planId,
        data.status,
        data.billingPeriod,
        data.currentPeriodStart,
        data.currentPeriodEnd,
        data.cancelAtPeriodEnd,
        data.cancelledAt,
        data.razorpayPaymentId,
      ],
    ))!;
  }

  async createPayment(
    client: IDbExecutor,
    data: {
      subscriptionId: string;
      amount: number;
      currency: string;
      status: string;
      razorpayOrderId?: string | null;
      razorpayPaymentId?: string | null;
      razorpaySignature?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<PaymentEntity> {
    return (await client.queryOne<PaymentEntity>(
      `INSERT INTO "Payment" (
        id, "subscriptionId", amount, currency, status, provider,
        "razorpayOrderId", "razorpayPaymentId", "razorpaySignature", metadata, "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'razorpay',
        $5, $6, $7, $8, NOW()
      ) RETURNING *`,
      [
        data.subscriptionId,
        data.amount,
        data.currency,
        data.status,
        data.razorpayOrderId ?? null,
        data.razorpayPaymentId ?? null,
        data.razorpaySignature ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    ))!;
  }

  async cancelSubscription(storeId: string) {
    return this.db.queryOne<SubscriptionEntity>(
      `UPDATE "Subscription"
       SET "cancelAtPeriodEnd" = true, "cancelledAt" = NOW(), "updatedAt" = NOW()
       WHERE "storeId" = $1
       RETURNING *`,
      [storeId],
    );
  }
}

