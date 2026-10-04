// src/services/customer.service.ts
// Business logic for merchant customer management

import { prisma } from "@/lib/db";

export async function listStoreCustomers(
  storeId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const { page = 1, limit = 20, search } = params;
  const skip = (page - 1) * limit;

  const where = {
    storeId,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  const formatted = customers.map((c) => {
    const totalSpent = c.orders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalOrders: c.orders.length,
      totalSpent,
      lastOrderDate: c.orders[0]?.createdAt || null,
      createdAt: c.createdAt,
    };
  });

  return {
    data: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
