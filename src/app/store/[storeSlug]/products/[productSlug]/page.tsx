import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontConfig } from "@/services/store.service";
import { getProductBySlug } from "@/services/product.service";
import { CartProvider } from "@/context/cart-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { ProductDetailClient } from "./product-detail-client";
import { ChevronRight, ArrowLeft } from "lucide-react";

type ProductPageProps = {
  params: Promise<{ storeSlug: string; productSlug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { storeSlug, productSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };

  const product = await getProductBySlug(store.id, productSlug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — ${store.name}`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at ${store.name}`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { storeSlug, productSlug } = await params;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const product = await getProductBySlug(store.id, productSlug);
  if (!product) notFound();

  return (
    <CartProvider storeSlug={store.slug}>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <StoreHeader store={store} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href={`/store/${store.slug}`} className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {product.category && (
              <>
                <Link
                  href={`/store/${store.slug}?category=${product.category.id}`}
                  className="hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </>
            )}
            <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Interactive Client Component for gallery, cart, quantity */}
          <ProductDetailClient
            product={product}
            store={store}
          />
        </main>

        <CartDrawer storeSlug={store.slug} />
        <StoreFooter store={store as any} />
      </div>
    </CartProvider>
  );
}
