import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { listCategories, listBrands } from "@/services/category.service";
import { CategoriesBrandsClient } from "./categories-brands-client";

export default async function DashboardCategoriesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  let store = session.user.id ? await getStoreByOwnerId(session.user.id) : null;
  if (!store && session.user.email) {
    store = await getStoreByOwnerId(session.user.email);
  }

  if (!store) {
    redirect("/onboarding");
  }

  const [categories, brands] = await Promise.all([
    listCategories(store.id),
    listBrands(store.id),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Categories & Brands</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Organize your product catalog into searchable categories and brands for your storefront.
        </p>
      </div>

      <CategoriesBrandsClient
        initialCategories={categories}
        initialBrands={brands}
      />
    </div>
  );
}
