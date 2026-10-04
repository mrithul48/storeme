import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { getProduct } from "@/services/product.service";
import { listCategories, listBrands } from "@/services/category.service";
import { ProductForm } from "@/components/dashboard/product-form";

type EditProductProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductProps) {
  const { id } = await params;
  const session = await auth();
  const store = await getStoreByOwnerId(session!.user.id);

  const [product, categories, brands] = await Promise.all([
    getProduct(store!.id, id),
    listCategories(store!.id),
    listBrands(store!.id),
  ]);

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Edit Product</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Update product details, media, inventory or pricing.
        </p>
      </div>

      <ProductForm
        productId={id}
        initialData={serializedProduct}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
