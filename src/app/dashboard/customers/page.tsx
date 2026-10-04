import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { listStoreCustomers } from "@/services/customer.service";
import { CustomersTableClient } from "./customers-table-client";

type CustomersPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function DashboardCustomersPage({ searchParams }: CustomersPageProps) {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const { search } = await searchParams;

  const customersData = await listStoreCustomers(store!.id, {
    search,
    limit: 50,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Customers Directory</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          View all buyers who have placed orders in your store, their order frequency, and lifetime spend.
        </p>
      </div>

      <CustomersTableClient initialCustomers={customersData.data} />
    </div>
  );
}
