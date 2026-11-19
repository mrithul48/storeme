// apps/backend/src/modules/customers/repositories/customers.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  CustomerEntity,
  CustomerOrderSummary,
  CustomerListItem,
  CustomerDetail,
} from '../interfaces/customer-entities.interface';

@Injectable()
export class CustomersRepository {
  constructor(private readonly db: DatabaseService) {}

  async listStoreCustomers(
    storeId: string,
    options: { search?: string; skip: number; limit: number },
  ): Promise<{ customers: CustomerListItem[]; total: number }> {
    const whereClauses: string[] = [`c."storeId" = $1`];
    const params: unknown[] = [storeId];
    let idx = 2;

    if (options.search) {
      whereClauses.push(`(c.name ILIKE $${idx} OR c.email ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const whereStr = whereClauses.join(' AND ');

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Customer" c WHERE ${whereStr}`,
      params,
    );
    const total = countRow ? parseInt(countRow.count, 10) : 0;

    const customers = await this.db.query<CustomerEntity>(
      `SELECT c.* FROM "Customer" c
       WHERE ${whereStr}
       ORDER BY c."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, options.limit, options.skip],
    );

    if (customers.length === 0) {
      return { customers: [], total };
    }

    const customerIds = customers.map((c) => c.id);
    const orders = await this.db.query<{
      id: string;
      customerId: string;
      total: number;
      status: string;
      paymentStatus: string;
      createdAt: Date;
    }>(
      `SELECT id, "customerId", total, status, "paymentStatus", "createdAt"
       FROM "Order"
       WHERE "customerId" = ANY($1)
       ORDER BY "createdAt" DESC`,
      [customerIds],
    );

    const orderMap = new Map<string, typeof orders>();
    for (const ord of orders) {
      const list = orderMap.get(ord.customerId) || [];
      list.push(ord);
      orderMap.set(ord.customerId, list);
    }

    const formatted: CustomerListItem[] = customers.map((c) => {
      const cOrders = orderMap.get(c.id) || [];
      const totalSpent = cOrders
        .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
        .reduce((sum, o) => sum + Number(o.total), 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders: cOrders.length,
        totalSpent,
        lastOrderDate: cOrders[0]?.createdAt || null,
        createdAt: c.createdAt,
      };
    });

    return { customers: formatted, total };
  }

  async getCustomerById(storeId: string, customerId: string): Promise<CustomerDetail | null> {
    const customer = await this.db.queryOne<CustomerEntity>(
      `SELECT * FROM "Customer" WHERE id = $1 AND "storeId" = $2 LIMIT 1`,
      [customerId, storeId],
    );

    if (!customer) return null;

    const orders = await this.db.query<CustomerOrderSummary>(
      `SELECT id, total, status, "paymentStatus", "createdAt"
       FROM "Order"
       WHERE "customerId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 50`,
      [customerId],
    );

    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      ...customer,
      totalOrders: orders.length,
      totalSpent,
      lastOrderDate: orders[0]?.createdAt || null,
      orders,
    };
  }
}

