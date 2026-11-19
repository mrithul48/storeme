import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { StoreSettingsClient } from "./store-settings-client";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const serializedStore = store ? JSON.parse(JSON.stringify(store)) : null;

  return (
    <div className="space-y-6 max-w-7xl pt-3.5 sm:pt-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FF]">Store Settings & Branding</h1>
        <p className="text-xs sm:text-sm text-[#A5B2D1]">
          Customize your storefront appearance, business contact information, theme palette, and preferences.
        </p>
      </div>

      <StoreSettingsClient store={serializedStore!} />
    </div>
  );
}
