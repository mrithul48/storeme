import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { StoreSettingsClient } from "./store-settings-client";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const serializedStore = store ? JSON.parse(JSON.stringify(store)) : null;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Store Settings & Branding</h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Customize your storefront appearance, business contact information, theme palette, and preferences.
        </p>
      </div>

      <StoreSettingsClient store={serializedStore!} />
    </div>
  );
}
