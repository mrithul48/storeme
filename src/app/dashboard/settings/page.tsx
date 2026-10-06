import React from "react";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { StoreSettingsClient } from "./store-settings-client";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Store Settings & Branding</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize your storefront appearance, business contact information, theme palette, and preferences.
        </p>
      </div>

      <StoreSettingsClient store={store!} />
    </div>
  );
}
