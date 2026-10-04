import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { ProductsTableClient } from "./products-table-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ProductsPageProps = {
  searchParams: Promise<{ search?: string; category?: string }>;
};

export default async function DashboardProductsPage({ searchParams }: ProductsPageProps) {
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);
  const { search, category: categoryId } = await searchParams;

  const [productsData, categories] = await Promise.all([
    listProducts(store!.id, {
      search,
      categoryId,
      limit: 50,
    }),
    listCategories(store!.id),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Products</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your store catalog, pricing, inventory levels, and visibility.
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Product
          </Button>
        </Link>
      </div>

      <ProductsTableClient
        initialProducts={productsData.data}
        categories={categories}
      />
    </div>
  );
}
