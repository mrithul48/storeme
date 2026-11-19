// apps/backend/src/modules/orders/repositories/orders.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IDbExecutor } from '../../../database/database.types';
import {
  OrderEntity,
  OrderItemEntity,
} from '../interfaces/order-entities.interface';

export interface OrderProductSnapshot {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  weight: number | null;
  stock: number;
  manageStockQuantity: boolean;
  manageStockAvailability: boolean;
  inStock: boolean;
  variants: Array<{
    id: string;
    color: string;
    stock: number;
    inStock: boolean;
    manageQuantity: boolean;
    manageAvailability: boolean;
  }>;
}

@Injectable()
export class OrdersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findProductsForOrder(storeId: string, productIds: string[]): Promise<OrderProductSnapshot[]> {
    if (productIds.length === 0) return [];

    const products = await this.db.query<{
      id: string;
      name: string;
      sku: string | null;
      price: number;
      salePrice: number | null;
      weight: number | null;
      stock: number;
      manageStockQuantity: boolean;
      manageStockAvailability: boolean;
      inStock: boolean;
    }>(
      `SELECT id, name, sku, price, "salePrice", weight, stock, "manageStockQuantity", "manageStockAvailability", "inStock"
       FROM "Product"
       WHERE id = ANY($1) AND "storeId" = $2 AND status = 'ACTIVE'`,
      [productIds, storeId],
    );

    if (products.length === 0) return [];

    const foundProductIds = products.map((p) => p.id);
    const variants = await this.db.query<{
      id: string;
      productId: string;
      color: string;
      stock: number;
      inStock: boolean;
      manageQuantity: boolean;
      manageAvailability: boolean;
    }>(
      `SELECT id, "productId", color, stock, "inStock", "manageQuantity", "manageAvailability"
       FROM "ProductVariant"
       WHERE "productId" = ANY($1)
       ORDER BY "sortOrder" ASC`,
      [foundProductIds],
    );

    const variantMap = new Map<string, typeof variants>();
    for (const v of variants) {
      const list = variantMap.get(v.productId) || [];
      list.push(v);
      variantMap.set(v.productId, list);
    }

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
      weight: p.weight !== null ? Number(p.weight) : null,
      variants: variantMap.get(p.id) || [],
    }));
  }

  async findStoreSettings(storeId: string) {
    return this.db.queryOne<{
      shippingType: string | null;
      shippingFixedCharge: number | null;
      shippingMinOrderAmount: number | null;
      shippingFallbackCharge: number | null;
      shippingDefaultWeight: number | null;
      shippingWeightRates: Array<{ upToKg?: number; maxWeight?: number; charge?: number; rate?: number }> | null;
    }>(
      `SELECT "shippingType", "shippingFixedCharge", "shippingMinOrderAmount", "shippingFallbackCharge", "shippingDefaultWeight", "shippingWeightRates"
       FROM "StoreSettings"
       WHERE "storeId" = $1`,
      [storeId],
    );
  }

  async upsertCustomer(
    storeId: string,
    data: { name: string; email: string; phone?: string | null },
  ): Promise<{ id: string; name: string; email: string | null; phone: string | null }> {
    const emailNorm = data.email.toLowerCase().trim();
    const existing = await this.db.queryOne<{ id: string; name: string; email: string | null; phone: string | null }>(
      `SELECT id, name, email, phone FROM "Customer" WHERE "storeId" = $1 AND LOWER(email) = $2 LIMIT 1`,
      [storeId, emailNorm],
    );

    if (existing) {
      await this.db.query(
        `UPDATE "Customer" SET name = $1, phone = COALESCE($2, phone), "updatedAt" = NOW() WHERE id = $3`,
        [data.name, data.phone || null, existing.id],
      );
      return { ...existing, name: data.name, phone: data.phone || existing.phone };
    }

    const row = await this.db.queryOne<{ id: string; name: string; email: string | null; phone: string | null }>(
      `INSERT INTO "Customer" (id, "storeId", name, email, phone, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING id, name, email, phone`,
      [storeId, data.name, emailNorm, data.phone || null],
    );
    return row!;
  }

  async createOrder(
    client: IDbExecutor,
    data: {
      id: string;
      storeId: string;
      orderNumber: string;
      customerId: string;
      subtotal: number;
      shippingCharge: number;
      total: number;
      status: string;
      paymentStatus: string;
      paymentMethod: string;
      orderChannel: string;
      notes: string | null;
      shippingAddress: Record<string, unknown>;
    },
  ): Promise<OrderEntity> {
    return (await client.queryOne<OrderEntity>(
      `INSERT INTO "Order" (
        id, "storeId", "orderNumber", "customerId", subtotal, "shippingCharge", total,
        status, "paymentStatus", "paymentMethod", "orderChannel", notes, "shippingAddress", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
      ) RETURNING *`,
      [
        data.id,
        data.storeId,
        data.orderNumber,
        data.customerId,
        data.subtotal,
        data.shippingCharge,
        data.total,
        data.status,
        data.paymentStatus,
        data.paymentMethod,
        data.orderChannel,
        data.notes,
        JSON.stringify(data.shippingAddress),
      ],
    ))!;
  }

  async createOrderItem(
    client: IDbExecutor,
    data: {
      id: string;
      orderId: string;
      productId: string;
      productName: string;
      productSku: string | null;
      variantId: string | null;
      variantColor: string | null;
      price: number;
      quantity: number;
      subtotal: number;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO "OrderItem" (
        id, "orderId", "productId", "productName", "productSku", "variantId", "variantColor", price, quantity, subtotal
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )`,
      [
        data.id,
        data.orderId,
        data.productId,
        data.productName,
        data.productSku,
        data.variantId,
        data.variantColor,
        data.price,
        data.quantity,
        data.subtotal,
      ],
    );
  }

  async decrementVariantStock(client: IDbExecutor, variantId: string, quantity: number): Promise<boolean> {
    const res = await client.query(
      `UPDATE "ProductVariant"
       SET stock = stock - $1, "updatedAt" = NOW()
       WHERE id = $2 AND stock >= $1`,
      [quantity, variantId],
    );
    return res.rowCount > 0;
  }

  async decrementProductStock(client: IDbExecutor, productId: string, quantity: number): Promise<boolean> {
    const res = await client.query(
      `UPDATE "Product"
       SET stock = stock - $1, "updatedAt" = NOW()
       WHERE id = $2 AND stock >= $1`,
      [quantity, productId],
    );
    return res.rowCount > 0;
  }

  async incrementVariantStock(client: IDbExecutor, variantId: string, quantity: number): Promise<void> {
    await client.query(
      `UPDATE "ProductVariant"
       SET stock = stock + $1, "inStock" = true, "updatedAt" = NOW()
       WHERE id = $2`,
      [quantity, variantId],
    );
  }

  async incrementProductStock(client: IDbExecutor, productId: string, quantity: number): Promise<void> {
    await client.query(
      `UPDATE "Product"
       SET stock = stock + $1, "inStock" = true, "updatedAt" = NOW()
       WHERE id = $2`,
      [quantity, productId],
    );
  }

  async findAll(
    storeId: string,
    options: {
      status?: string;
      paymentStatus?: string;
      orderChannel?: string;
      customerId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      skip: number;
      limit: number;
    },
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    const whereClauses: string[] = [`o."storeId" = $1`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.status) {
      whereClauses.push(`o.status = $${idx++}`);
      params.push(options.status);
    }
    if (options.paymentStatus) {
      whereClauses.push(`o."paymentStatus" = $${idx++}`);
      params.push(options.paymentStatus);
    }
    if (options.orderChannel) {
      whereClauses.push(`o."orderChannel" = $${idx++}`);
      params.push(options.orderChannel);
    }
    if (options.customerId) {
      whereClauses.push(`o."customerId" = $${idx++}`);
      params.push(options.customerId);
    }
    if (options.search) {
      whereClauses.push(`(o."orderNumber" ILIKE $${idx} OR c.name ILIKE $${idx} OR c.email ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }
    if (options.startDate) {
      whereClauses.push(`o."createdAt" >= $${idx++}`);
      params.push(new Date(options.startDate));
    }
    if (options.endDate) {
      whereClauses.push(`o."createdAt" <= $${idx++}`);
      params.push(new Date(options.endDate));
    }

    const whereStr = whereClauses.join(' AND ');

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM "Order" o
       LEFT JOIN "Customer" c ON o."customerId" = c.id
       WHERE ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const orders = await this.db.query<OrderEntity>(
      `SELECT o.*
       FROM "Order" o
       LEFT JOIN "Customer" c ON o."customerId" = c.id
       WHERE ${whereStr}
       ORDER BY o."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    if (orders.length === 0) return { orders: [], total };

    const populated = await this.populateOrderRelations(orders);
    return { orders: populated, total };
  }

  async findOne(storeId: string, idOrOrderNumber: string): Promise<OrderEntity | null> {
    const order = await this.db.queryOne<OrderEntity>(
      `SELECT * FROM "Order" WHERE (id = $1 OR "orderNumber" = $1) AND "storeId" = $2 LIMIT 1`,
      [idOrOrderNumber, storeId],
    );

    if (!order) return null;

    const [populated] = await this.populateOrderRelations([order]);
    return populated;
  }

  async findStorefrontOrder(orderNumber: string, storeId?: string, storeSlug?: string): Promise<OrderEntity | null> {
    let storeFilter = '';
    const params: unknown[] = [orderNumber];

    if (storeId) {
      storeFilter = 'AND o."storeId" = $2';
      params.push(storeId);
    } else if (storeSlug) {
      storeFilter = 'AND s.slug = $2';
      params.push(storeSlug);
    }

    const order = await this.db.queryOne<OrderEntity>(
      `SELECT o.*
         FROM "Order" o
    LEFT JOIN "Store" s ON s.id = o."storeId"
        WHERE (o.id = $1 OR o."orderNumber" = $1) ${storeFilter}
        LIMIT 1`,
      params,
    );

    if (!order) return null;

    const [populated] = await this.populateOrderRelations([order]);
    return populated;
  }

  async findByCustomerId(customerId: string, storeId?: string): Promise<OrderEntity[]> {
    const params: unknown[] = [customerId];
    let storeClause = '';
    if (storeId) {
      storeClause = 'AND "storeId" = $2';
      params.push(storeId);
    }

    const orders = await this.db.query<OrderEntity>(
      `SELECT * FROM "Order" WHERE "customerId" = $1 ${storeClause} ORDER BY "createdAt" DESC`,
      params,
    );

    return this.populateOrderRelations(orders);
  }

  async findReceipts(storeId: string, orderIds: string[]): Promise<{ store: any; orders: OrderEntity[] } | null> {
    if (orderIds.length === 0) return null;

    const [store, company, rawOrders] = await Promise.all([
      this.db.queryOne<{ id: string; name: string; slug: string }>(
        `SELECT id, name, slug FROM "Store" WHERE id = $1 LIMIT 1`,
        [storeId],
      ),
      this.db.queryOne<{ address: string | null; phone: string | null; email: string | null; businessType: string | null }>(
        `SELECT address, phone, email, "businessType" FROM "CompanyDetails" WHERE "storeId" = $1 LIMIT 1`,
        [storeId],
      ),
      this.db.query<OrderEntity>(
        `SELECT * FROM "Order" WHERE id = ANY($1) AND "storeId" = $2 ORDER BY "createdAt" DESC`,
        [orderIds, storeId],
      ),
    ]);

    if (!store) return null;

    const orders = await this.populateOrderRelations(rawOrders);

    return {
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        company: company || null,
      },
      orders,
    };
  }

  async updateStatus(
    client: IDbExecutor,
    id: string,
    status?: string,
    notes?: string | null,
    paymentStatus?: string | null,
  ): Promise<OrderEntity> {
    const setClauses: string[] = [`"updatedAt" = NOW()`];
    const params: unknown[] = [id];
    let idx = 2;

    if (status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      params.push(status);
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${idx++}`);
      params.push(notes);
    }
    if (paymentStatus !== undefined) {
      setClauses.push(`"paymentStatus" = $${idx++}`);
      params.push(paymentStatus);
    }

    const updated = await client.queryOne<OrderEntity>(
      `UPDATE "Order" SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      params,
    );

    const [populated] = await this.populateOrderRelations([updated!]);
    return populated;
  }

  async getRecent(storeId: string, limit = 5): Promise<OrderEntity[]> {
    const orders = await this.db.query<OrderEntity>(
      `SELECT * FROM "Order" WHERE "storeId" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
      [storeId, limit],
    );
    return this.populateOrderRelations(orders);
  }

  async getSummary(storeId: string) {
    const [counts, gross] = await Promise.all([
      this.db.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text as count FROM "Order" WHERE "storeId" = $1 GROUP BY status`,
        [storeId],
      ),
      this.db.queryOne<{ gross: string }>(
        `SELECT COALESCE(SUM(total), 0)::text as gross FROM "Order" WHERE "storeId" = $1 AND status != 'CANCELLED'`,
        [storeId],
      ),
    ]);

    const countMap = new Map<string, number>();
    let totalOrders = 0;
    for (const c of counts) {
      const cnt = parseInt(c.count, 10);
      countMap.set(c.status, cnt);
      totalOrders += cnt;
    }

    return {
      totalOrders,
      grossSales: gross ? parseFloat(gross.gross) : 0,
      pendingOrders: countMap.get('PENDING') || 0,
      confirmedOrders: countMap.get('CONFIRMED') || 0,
      processingOrders: countMap.get('PROCESSING') || 0,
      shippedOrders: countMap.get('SHIPPED') || 0,
      deliveredOrders: countMap.get('DELIVERED') || 0,
      cancelledOrders: countMap.get('CANCELLED') || 0,
    };
  }

  private async populateOrderRelations(orders: OrderEntity[]): Promise<OrderEntity[]> {
    if (orders.length === 0) return [];
    const orderIds = orders.map((o) => o.id);
    const customerIds = Array.from(new Set(orders.map((o) => o.customerId)));

    const [items, customers, payments] = await Promise.all([
      this.db.query<OrderItemEntity>(
        `SELECT id, "orderId", "productId", "productName", "productSku", "variantId", "variantColor", price, quantity, subtotal
         FROM "OrderItem"
         WHERE "orderId" = ANY($1)`,
        [orderIds],
      ),
      this.db.query<{ id: string; name: string; email: string | null; phone: string | null }>(
        `SELECT id, name, email, phone FROM "Customer" WHERE id = ANY($1)`,
        [customerIds],
      ),
      this.db.query<{ id: string; orderId: string; status: string; amount: number; currency: string; razorpayPaymentId?: string | null }>(
        `SELECT id, "orderId", status, amount, currency, "razorpayPaymentId" FROM "Payment" WHERE "orderId" = ANY($1)`,
        [orderIds],
      ),
    ]);

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const productImages = productIds.length > 0
      ? await this.db.query<{ productId: string; url: string; altText: string | null }>(
          `SELECT "productId", url, "altText" FROM "ProductImage" WHERE "productId" = ANY($1) ORDER BY "sortOrder" ASC`,
          [productIds],
        )
      : [];

    const imgMap = new Map<string, Array<{ url: string; altText: string | null }>>();
    for (const img of productImages) {
      const list = imgMap.get(img.productId) || [];
      list.push(img);
      imgMap.set(img.productId, list);
    }

    const itemMap = new Map<string, any[]>();
    for (const it of items) {
      const list = itemMap.get(it.orderId) || [];
      list.push({
        ...it,
        price: Number(it.price),
        subtotal: Number(it.subtotal),
        product: {
          images: imgMap.get(it.productId) || [],
        },
      });
      itemMap.set(it.orderId, list);
    }

    const custMap = new Map<string, { id: string; name: string; email: string | null; phone: string | null }>();
    for (const c of customers) custMap.set(c.id, c);

    const payMap = new Map<string, { id: string; status: string; amount: number; currency: string; razorpayPaymentId?: string | null }>();
    for (const p of payments) {
      payMap.set(p.orderId, {
        id: p.id,
        status: p.status,
        amount: Number(p.amount),
        currency: p.currency,
        razorpayPaymentId: p.razorpayPaymentId || null,
      });
    }

    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shippingCharge: Number(o.shippingCharge),
      total: Number(o.total),
      items: itemMap.get(o.id) || [],
      customer: custMap.get(o.customerId) || null,
      payment: payMap.get(o.id) || null,
    }));
  }
}

