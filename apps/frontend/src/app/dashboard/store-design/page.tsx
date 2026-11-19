// src/app/dashboard/store-design/page.tsx
// Live Store Design dashboard — server component that loads initial data

import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreByOwnerId, getStoreHomePage } from "@/services/store.service";
import { listCategories } from "@/services/category.service";
import { listProducts } from "@/services/product.service";
import { StoreDesignClient } from "@/app/dashboard/store-design/store-design-client";

export const metadata = {
  title: "Live Store Design",
};

export default async function StoreDesignPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const store = await getStoreByOwnerId(session.user.id);
  if (!store) {
    redirect("/onboarding");
  }

  // Load homepage config, categories, products for dropdowns via services
  const [homePage, categories, productsResult] = await Promise.all([
    getStoreHomePage(store.id),
    listCategories(store.id),
    listProducts(store.id, { limit: 100, status: "ACTIVE" }),
  ]);

  const products = (productsResult?.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-3.5 sm:pt-0">
      <StoreDesignClient
        storeSlug={store.slug}
        homePage={homePage}
        categories={categories}
        products={products}
      />
    </div>
  );
}
