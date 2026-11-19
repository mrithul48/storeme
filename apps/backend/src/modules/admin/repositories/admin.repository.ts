// apps/backend/src/modules/admin/repositories/admin.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AdminAuditLogEntity } from '../interfaces/admin-entities.interface';

@Injectable()
export class AdminRepository {
  constructor(private readonly db: DatabaseService) {}

  async createAuditLog(data: {
    adminId: string;
    adminEmail: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details?: Record<string, unknown>;
    ipAddress: string | null;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO "AdminAuditLog" (id, "adminId", "adminEmail", action, "entityType", "entityId", details, "ipAddress", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        data.adminId,
        data.adminEmail,
        data.action,
        data.entityType,
        data.entityId,
        data.details ? JSON.stringify(data.details) : null,
        data.ipAddress,
      ],
    );
  }

  async getOverviewMetrics() {
    const [
      totalMerchants,
      activeStores,
      suspendedStores,
      totalStores,
      totalCustomers,
      totalOrders,
      activeSubs,
      expiredSubs,
      paidSubs,
    ] = await Promise.all([
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "User" WHERE role = 'USER'`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Store" WHERE status = 'ACTIVE'`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Store" WHERE status = 'SUSPENDED'`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Store"`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Customer"`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Order"`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Subscription" WHERE status = 'ACTIVE'`),
      this.db.queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM "Subscription" WHERE status = 'EXPIRED'`),
      this.db.queryOne<{ total: string; count: string }>(
        `SELECT COALESCE(SUM(amount), 0)::text as total, COUNT(*)::text as count
         FROM "Payment"
         WHERE "subscriptionId" IS NOT NULL AND status = 'PAID'`,
      ),
    ]);

    return {
      totalMerchants: totalMerchants ? parseInt(totalMerchants.count, 10) : 0,
      activeStores: activeStores ? parseInt(activeStores.count, 10) : 0,
      suspendedStores: suspendedStores ? parseInt(suspendedStores.count, 10) : 0,
      totalStores: totalStores ? parseInt(totalStores.count, 10) : 0,
      totalCustomers: totalCustomers ? parseInt(totalCustomers.count, 10) : 0,
      totalOrders: totalOrders ? parseInt(totalOrders.count, 10) : 0,
      activeSubscriptions: activeSubs ? parseInt(activeSubs.count, 10) : 0,
      expiredSubscriptions: expiredSubs ? parseInt(expiredSubs.count, 10) : 0,
      totalSubscriptionRevenue: paidSubs ? parseFloat(paidSubs.total) : 0,
      successfulPaymentsCount: paidSubs ? parseInt(paidSubs.count, 10) : 0,
    };
  }

  async getAllActiveSubscriptionsForMrr() {
    return this.db.query<{
      billingPeriod: string | null;
      plan_name: string;
      plan_price: number;
      plan_yearlyPrice: number | null;
    }>(
      `SELECT s."billingPeriod", p.name as plan_name, p.price as plan_price, p."yearlyPrice" as "plan_yearlyPrice"
       FROM "Subscription" s
       JOIN "Plan" p ON s."planId" = p.id
       WHERE s.status = 'ACTIVE'`,
    );
  }

  async getRecentMerchants(limit = 5) {
    const users = await this.db.query<{
      id: string;
      name: string;
      email: string;
      createdAt: Date;
    }>(
      `SELECT id, name, email, "createdAt"
       FROM "User"
       WHERE role = 'USER'
       ORDER BY "createdAt" DESC
       LIMIT $1`,
      [limit],
    );

    if (users.length === 0) return [];
    const userIds = users.map((u) => u.id);

    const stores = await this.db.query<{
      id: string;
      ownerId: string;
      name: string;
      slug: string;
      status: string;
    }>(
      `SELECT id, "ownerId", name, slug, status FROM "Store" WHERE "ownerId" = ANY($1)`,
      [userIds],
    );

    const storeMap = new Map<string, typeof stores[0]>();
    for (const s of stores) storeMap.set(s.ownerId, s);

    const storeIds = stores.map((s) => s.id);
    const subs = storeIds.length > 0
      ? await this.db.query<{
          storeId: string;
          status: string;
          plan_name: string;
          plan_price: number;
        }>(
          `SELECT s."storeId", s.status, p.name as plan_name, p.price as plan_price
           FROM "Subscription" s
           JOIN "Plan" p ON s."planId" = p.id
           WHERE s."storeId" = ANY($1)`,
          [storeIds],
        )
      : [];

    const subMap = new Map<string, typeof subs[0]>();
    for (const sub of subs) subMap.set(sub.storeId, sub);

    return users.map((u) => {
      const store = storeMap.get(u.id);
      const sub = store ? subMap.get(store.id) : null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        store: store
          ? {
              id: store.id,
              name: store.name,
              slug: store.slug,
              status: store.status,
              subscription: sub
                ? {
                    status: sub.status,
                    plan: { name: sub.plan_name, price: Number(sub.plan_price) },
                  }
                : null,
            }
          : null,
      };
    });
  }

  async getRecentPayments(limit = 6) {
    interface PayRow {
      id: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: Date;
      store_id: string | null;
      store_name: string | null;
      store_slug: string | null;
      plan_id: string | null;
      plan_name: string | null;
    }

    const rows = await this.db.query<PayRow>(
      `SELECT p.id, p.amount, p.currency, p.status, p."createdAt",
              st.id as store_id, st.name as store_name, st.slug as store_slug,
              pl.id as plan_id, pl.name as plan_name
       FROM "Payment" p
       LEFT JOIN "Subscription" sub ON p."subscriptionId" = sub.id
       LEFT JOIN "Store" st ON sub."storeId" = st.id
       LEFT JOIN "Plan" pl ON sub."planId" = pl.id
       WHERE p."subscriptionId" IS NOT NULL
       ORDER BY p."createdAt" DESC
       LIMIT $1`,
      [limit],
    );

    return rows.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      currency: r.currency,
      status: r.status,
      createdAt: r.createdAt,
      subscription: {
        store: r.store_id
          ? { id: r.store_id, name: r.store_name, slug: r.store_slug }
          : null,
        plan: r.plan_id
          ? { id: r.plan_id, name: r.plan_name }
          : null,
      },
    }));
  }

  async getMerchants(options: { search?: string; status?: string; skip: number; limit: number }) {
    const whereClauses: string[] = [`u.role = 'USER'`];
    const params: unknown[] = [];
    let idx = 1;

    if (options.status) {
      whereClauses.push(`s.status = $${idx++}`);
      params.push(options.status);
    }

    if (options.search) {
      whereClauses.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR s.name ILIKE $${idx} OR s.slug ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(DISTINCT u.id)::text as count
       FROM "User" u
       LEFT JOIN "Store" s ON s."ownerId" = u.id
       WHERE ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const users = await this.db.query<{
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      createdAt: Date;
    }>(
      `SELECT DISTINCT u.id, u.name, u.email, u.avatar, u."createdAt"
       FROM "User" u
       LEFT JOIN "Store" s ON s."ownerId" = u.id
       WHERE ${whereStr}
       ORDER BY u."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    if (users.length === 0) return { merchants: [], total };

    const userIds = users.map((u) => u.id);

    const stores = await this.db.query<{
      id: string;
      ownerId: string;
      name: string;
      slug: string;
      status: string;
      customDomain: string | null;
      domainStatus: string;
      createdAt: Date;
    }>(
      `SELECT id, "ownerId", name, slug, status, "customDomain", "domainStatus", "createdAt"
       FROM "Store" WHERE "ownerId" = ANY($1)`,
      [userIds],
    );

    const storeMap = new Map<string, typeof stores[0]>();
    for (const s of stores) storeMap.set(s.ownerId, s);

    const storeIds = stores.map((s) => s.id);

    // Counts & subs for stores
    const [counts, subs] = await Promise.all([
      storeIds.length > 0
        ? this.db.query<{ storeId: string; products: string; orders: string; customers: string }>(
            `SELECT s.id as "storeId",
                    (SELECT COUNT(*)::text FROM "Product" p WHERE p."storeId" = s.id) as products,
                    (SELECT COUNT(*)::text FROM "Order" o WHERE o."storeId" = s.id) as orders,
                    (SELECT COUNT(*)::text FROM "Customer" c WHERE c."storeId" = s.id) as customers
             FROM "Store" s WHERE s.id = ANY($1)`,
            [storeIds],
          )
        : [],
      storeIds.length > 0
        ? this.db.query<{
            id: string;
            storeId: string;
            status: string;
            billingPeriod: string;
            currentPeriodEnd: Date;
            plan_id: string;
            plan_name: string;
            plan_price: number;
            plan_yearlyPrice: number | null;
          }>(
            `SELECT s.id, s."storeId", s.status, s."billingPeriod", s."currentPeriodEnd",
                    p.id as plan_id, p.name as plan_name, p.price as plan_price, p."yearlyPrice" as "plan_yearlyPrice"
             FROM "Subscription" s
             JOIN "Plan" p ON s."planId" = p.id
             WHERE s."storeId" = ANY($1)
             ORDER BY s."createdAt" DESC`,
            [storeIds],
          )
        : [],
    ]);

    const countMap = new Map<string, { products: number; orders: number; customers: number }>();
    for (const c of counts) {
      countMap.set(c.storeId, {
        products: parseInt(c.products, 10),
        orders: parseInt(c.orders, 10),
        customers: parseInt(c.customers, 10),
      });
    }

    const subMap = new Map<string, typeof subs[0]>();
    for (const sub of subs) {
      if (!subMap.has(sub.storeId)) subMap.set(sub.storeId, sub);
    }

    const merchants = users.map((u) => {
      const store = storeMap.get(u.id);
      const storeCounts = store ? countMap.get(store.id) : null;
      const sub = store ? subMap.get(store.id) : null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt,
        store: store
          ? {
              id: store.id,
              name: store.name,
              slug: store.slug,
              status: store.status,
              customDomain: store.customDomain,
              domainStatus: store.domainStatus,
              createdAt: store.createdAt,
              subscription: sub
                ? {
                    id: sub.id,
                    status: sub.status,
                    billingPeriod: sub.billingPeriod,
                    currentPeriodEnd: sub.currentPeriodEnd,
                    plan: {
                      id: sub.plan_id,
                      name: sub.plan_name,
                      price: Number(sub.plan_price),
                      yearlyPrice: sub.plan_yearlyPrice !== null ? Number(sub.plan_yearlyPrice) : null,
                    },
                  }
                : null,
              _count: storeCounts || { products: 0, orders: 0, customers: 0 },
            }
          : null,
      };
    });

    return { merchants, total };
  }

  async findMerchantDetails(id: string) {
    let user = await this.db.queryOne<{
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `SELECT id, name, email, avatar, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1 LIMIT 1`,
      [id],
    );

    if (!user) {
      const store = await this.db.queryOne<{ ownerId: string }>(
        `SELECT "ownerId" FROM "Store" WHERE id = $1 LIMIT 1`,
        [id],
      );
      if (store) {
        user = await this.db.queryOne<{
          id: string;
          name: string;
          email: string;
          avatar: string | null;
          role: string;
          createdAt: Date;
          updatedAt: Date;
        }>(
          `SELECT id, name, email, avatar, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1 LIMIT 1`,
          [store.ownerId],
        );
      }
    }

    if (!user) return null;

    const store = await this.db.queryOne<{
      id: string;
      name: string;
      slug: string;
      status: string;
      customDomain: string | null;
      domainStatus: string;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `SELECT id, name, slug, status, "customDomain", "domainStatus", "createdAt", "updatedAt"
       FROM "Store" WHERE "ownerId" = $1 LIMIT 1`,
      [user.id],
    );

    if (!store) {
      return {
        ...user,
        store: null,
      };
    }

    const [company, settings, subRow, counts, revenueRow, recentOrders] = await Promise.all([
      this.db.queryOne(`SELECT * FROM "CompanyDetails" WHERE "storeId" = $1`, [store.id]),
      this.db.queryOne(`SELECT * FROM "StoreSettings" WHERE "storeId" = $1`, [store.id]),
      this.db.queryOne<{
        id: string;
        status: string;
        billingPeriod: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        plan_id: string;
        plan_name: string;
        plan_price: number;
        plan_yearlyPrice: number | null;
        plan_maxProducts: number | null;
      }>(
        `SELECT s.id, s.status, s."billingPeriod", s."currentPeriodStart", s."currentPeriodEnd",
                p.id as plan_id, p.name as plan_name, p.price as plan_price, p."yearlyPrice" as "plan_yearlyPrice",
                p."maxProducts" as "plan_maxProducts"
         FROM "Subscription" s
         JOIN "Plan" p ON s."planId" = p.id
         WHERE s."storeId" = $1
         ORDER BY s."createdAt" DESC LIMIT 1`,
        [store.id],
      ),
      this.db.queryOne<{ products: string; orders: string; customers: string; categories: string }>(
        `SELECT (SELECT COUNT(*)::text FROM "Product" WHERE "storeId" = $1) as products,
                (SELECT COUNT(*)::text FROM "Order" WHERE "storeId" = $1) as orders,
                (SELECT COUNT(*)::text FROM "Customer" WHERE "storeId" = $1) as customers,
                (SELECT COUNT(*)::text FROM "Category" WHERE "storeId" = $1) as categories`,
        [store.id],
      ),
      this.db.queryOne<{ total: string }>(
        `SELECT COALESCE(SUM(total), 0)::text as total FROM "Order" WHERE "storeId" = $1 AND "paymentStatus" = 'PAID'`,
        [store.id],
      ),
      this.db.query<{
        id: string;
        orderNumber: string;
        total: number;
        status: string;
        paymentStatus: string;
        createdAt: Date;
        customer_name: string | null;
        customer_email: string | null;
      }>(
        `SELECT o.id, o."orderNumber", o.total, o.status, o."paymentStatus", o."createdAt",
                c.name as customer_name, c.email as customer_email
         FROM "Order" o
         LEFT JOIN "Customer" c ON o."customerId" = c.id
         WHERE o."storeId" = $1
         ORDER BY o."createdAt" DESC
         LIMIT 5`,
        [store.id],
      ),
    ]);

    return {
      ...user,
      store: {
        ...store,
        company,
        settings,
        subscription: subRow
          ? {
              id: subRow.id,
              status: subRow.status,
              billingPeriod: subRow.billingPeriod,
              currentPeriodStart: subRow.currentPeriodStart,
              currentPeriodEnd: subRow.currentPeriodEnd,
              plan: {
                id: subRow.plan_id,
                name: subRow.plan_name,
                price: Number(subRow.plan_price),
                yearlyPrice: subRow.plan_yearlyPrice !== null ? Number(subRow.plan_yearlyPrice) : null,
                maxProducts: subRow.plan_maxProducts,
              },
            }
          : null,
        _count: {
          products: counts ? parseInt(counts.products, 10) : 0,
          orders: counts ? parseInt(counts.orders, 10) : 0,
          customers: counts ? parseInt(counts.customers, 10) : 0,
          categories: counts ? parseInt(counts.categories, 10) : 0,
        },
      },
      storeRevenue: revenueRow ? parseFloat(revenueRow.total) : 0,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        customer: { name: o.customer_name, email: o.customer_email },
      })),
      limits: subRow
        ? {
            maxProducts: subRow.plan_maxProducts,
            planName: subRow.plan_name,
            subscriptionStatus: subRow.status,
          }
        : { maxProducts: 0, planName: 'No Plan', subscriptionStatus: 'NONE' },
    };
  }

  async findMerchantForStatusUpdate(id: string) {
    let user = await this.db.queryOne<{ id: string; email: string; role: string; storeId: string | null }>(
      `SELECT u.id, u.email, u.role, s.id as "storeId"
       FROM "User" u
       LEFT JOIN "Store" s ON s."ownerId" = u.id
       WHERE u.id = $1 LIMIT 1`,
      [id],
    );

    if (!user) {
      const store = await this.db.queryOne<{ id: string; ownerId: string }>(
        `SELECT id, "ownerId" FROM "Store" WHERE id = $1 LIMIT 1`,
        [id],
      );
      if (store) {
        user = await this.db.queryOne<{ id: string; email: string; role: string; storeId: string | null }>(
          `SELECT u.id, u.email, u.role, $2::text as "storeId"
           FROM "User" u WHERE u.id = $1 LIMIT 1`,
          [store.ownerId, store.id],
        );
      }
    }

    return user;
  }

  async updateStoreStatus(storeId: string, status: string) {
    return this.db.queryOne<{ id: string; status: string }>(
      `UPDATE "Store" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, status`,
      [status, storeId],
    );
  }

  async getTransactions(options: { status?: string; search?: string; skip: number; limit: number }) {
    const whereClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (options.status) {
      whereClauses.push(`p.status = $${idx++}`);
      params.push(options.status);
    }

    if (options.search) {
      whereClauses.push(
        `(p."razorpayPaymentId" ILIKE $${idx} OR p."razorpayOrderId" ILIKE $${idx} OR st.name ILIKE $${idx} OR st.slug ILIKE $${idx})`,
      );
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM "Payment" p
       LEFT JOIN "Subscription" sub ON p."subscriptionId" = sub.id
       LEFT JOIN "Store" st ON sub."storeId" = st.id
       ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const summaryRow = await this.db.queryOne<{ totalVolume: string; totalPaidCount: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text as "totalVolume", COUNT(*)::text as "totalPaidCount"
       FROM "Payment" WHERE status = 'PAID'`,
    );

    interface TxRow {
      id: string;
      amount: number;
      currency: string;
      status: string;
      subscriptionId: string | null;
      orderId: string | null;
      razorpayPaymentId: string | null;
      razorpayOrderId: string | null;
      createdAt: Date;
      store_id: string | null;
      store_name: string | null;
      store_slug: string | null;
      owner_id: string | null;
      owner_name: string | null;
      owner_email: string | null;
      plan_id: string | null;
      plan_name: string | null;
      plan_price: number | null;
      plan_yearlyPrice: number | null;
      order_id: string | null;
      order_number: string | null;
      order_store_name: string | null;
      order_store_slug: string | null;
    }

    const rows = await this.db.query<TxRow>(
      `SELECT p.id, p.amount, p.currency, p.status, p."subscriptionId", p."orderId",
              p."razorpayPaymentId", p."razorpayOrderId", p."createdAt",
              st.id as store_id, st.name as store_name, st.slug as store_slug,
              u.id as owner_id, u.name as owner_name, u.email as owner_email,
              pl.id as plan_id, pl.name as plan_name, pl.price as plan_price, pl."yearlyPrice" as "plan_yearlyPrice",
              ord.id as order_id, ord."orderNumber" as order_number,
              ord_st.name as order_store_name, ord_st.slug as order_store_slug
       FROM "Payment" p
       LEFT JOIN "Subscription" sub ON p."subscriptionId" = sub.id
       LEFT JOIN "Store" st ON sub."storeId" = st.id
       LEFT JOIN "User" u ON st."ownerId" = u.id
       LEFT JOIN "Plan" pl ON sub."planId" = pl.id
       LEFT JOIN "Order" ord ON p."orderId" = ord.id
       LEFT JOIN "Store" ord_st ON ord."storeId" = ord_st.id
       ${whereStr}
       ORDER BY p."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    const formatted = rows.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      type: t.subscriptionId ? 'SUBSCRIPTION' : 'STORE_ORDER',
      razorpayPaymentId: t.razorpayPaymentId,
      razorpayOrderId: t.razorpayOrderId,
      createdAt: t.createdAt,
      store: t.store_id
        ? { id: t.store_id, name: t.store_name, slug: t.store_slug }
        : t.order_store_name
        ? { name: t.order_store_name, slug: t.order_store_slug }
        : null,
      plan: t.plan_id
        ? {
            id: t.plan_id,
            name: t.plan_name,
            price: Number(t.plan_price),
            yearlyPrice: t.plan_yearlyPrice !== null ? Number(t.plan_yearlyPrice) : null,
          }
        : null,
      customer: t.owner_id
        ? { id: t.owner_id, name: t.owner_name, email: t.owner_email }
        : null,
    }));

    return {
      transactions: formatted,
      total,
      summary: {
        totalVolume: summaryRow ? parseFloat(summaryRow.totalVolume) : 0,
        totalPaidCount: summaryRow ? parseInt(summaryRow.totalPaidCount, 10) : 0,
      },
    };
  }

  async getAuditLogs(options: { search?: string; skip: number; limit: number }) {
    const whereClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (options.search) {
      whereClauses.push(`(action ILIKE $${idx} OR "adminEmail" ILIKE $${idx} OR "entityType" ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "AdminAuditLog" ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const logs = await this.db.query<AdminAuditLogEntity>(
      `SELECT * FROM "AdminAuditLog"
       ${whereStr}
       ORDER BY "createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    return { logs, total };
  }
}

