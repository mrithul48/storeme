import React from "react";
import { prisma } from "@/lib/db";
import { AdminStoresClient } from "./admin-stores-client";

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      subscription: { include: { plan: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Store Management</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage all merchant storefronts, track subscription tiers, and control operational status.
        </p>
      </div>

      <AdminStoresClient initialStores={stores as any} />
    </div>
  );
}
