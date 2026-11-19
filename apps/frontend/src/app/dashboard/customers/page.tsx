import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { listStoreCustomers } from "@/services/customer.service";
import { CustomersTableClient } from "./customers-table-client";

type CustomersPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function DashboardCustomersPage({ searchParams }: CustomersPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const ownerId = session.user.id || session.user.email || "";
  let store = await getStoreByOwnerId(ownerId);
  if (!store && session.user.email) {
    store = await getStoreByOwnerId(session.user.email);
  }

  if (!store) {
    redirect("/onboarding");
  }

  const { search } = await searchParams;

  const customersData = await listStoreCustomers(store.id, {
    search,
    limit: 50,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-3.5 sm:pt-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FF]">Customers Directory</h1>
        <p className="text-xs sm:text-sm text-[#A5B2D1]">
          View all buyers who have placed orders in your store, their order frequency, and lifetime spend.
        </p>
      </div>

      <CustomersTableClient initialCustomers={customersData.data} />
    </div>
  );
}
