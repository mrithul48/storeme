import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { listCategories, listBrands } from "@/services/category.service";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);

  const [categories, brands, customColors] = await Promise.all([
    listCategories(store!.id),
    listBrands(store!.id),
    prisma.storeColor.findMany({
      where: { storeId: store!.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, hex: true },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Create New Product</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Add an item to your online store catalog with pricing, images, and inventory.
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        storeSettings={store?.settings}
        initialCustomColors={customColors}
      />
    </div>
  );
}
