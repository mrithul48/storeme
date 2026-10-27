// src/app/dashboard/store-design/page.tsx
// Live Store Design dashboard — server component that loads initial data

import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreByOwnerId } from "@/services/store.service";
import { prisma } from "@/lib/db";
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

  // Load homepage config, categories, products for dropdowns
  const [homePage, categories, products] = await Promise.all([
    prisma.homePage.findUnique({ where: { storeId: store.id } }),
    prisma.category.findMany({
      where: { storeId: store.id, status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { storeId: store.id, status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

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
