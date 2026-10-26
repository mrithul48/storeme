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

  const initialProducts = productsData.data.map((product) => ({
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-3.5 sm:pt-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 pr-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-xs sm:text-sm text-[#64748B] truncate sm:whitespace-normal">
            Manage your store catalog, pricing, inventory levels, and visibility.
          </p>
        </div>

        <Link href="/dashboard/products/new" className="shrink-0">
          <Button
            variant="primary"
            size="md"
            className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      <ProductsTableClient
        initialProducts={initialProducts}
        categories={categories}
        storeSettings={store?.settings ? JSON.parse(JSON.stringify(store.settings)) : null}
      />
    </div>
  );
}
