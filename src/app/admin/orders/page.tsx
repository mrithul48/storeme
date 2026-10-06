import React from "react";
import { prisma } from "@/lib/db";
import { AdminOrdersClient } from "./admin-orders-client";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      store: { select: { id: true, name: true, slug: true } },
      customer: { select: { name: true, email: true, phone: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Cross-Tenant Orders</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Global platform order transaction log across all merchant storefronts.
        </p>
      </div>

      <AdminOrdersClient initialOrders={orders as any} />
    </div>
  );
}
