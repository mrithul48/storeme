import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { listOrders } from "@/services/order.service";
import { OrdersTableClient } from "./orders-table-client";

type OrdersPageProps = {
  searchParams: Promise<{ search?: string; status?: string }>;
};

export default async function DashboardOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const { search, status } = await searchParams;

  const ordersData = await listOrders(store!.id, {
    search,
    status,
    limit: 50,
    sortOrder: "desc",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Orders</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Track customer purchases, fulfill packages, and update order statuses.
        </p>
      </div>

      <OrdersTableClient
        initialOrders={ordersData.data}
        storeSlug={store!.slug}
      />
    </div>
  );
}
