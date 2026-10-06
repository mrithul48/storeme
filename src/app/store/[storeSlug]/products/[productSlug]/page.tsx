import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontConfig } from "@/services/store.service";
import { getProductBySlug } from "@/services/product.service";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
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

  const baseUrl =
    store.customDomain && store.domainStatus === "CONNECTED"
      ? `https://${store.customDomain}/products/${product.slug}`
      : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/${store.slug}/products/${product.slug}`;

  const description =
    product.description?.slice(0, 160) || `Buy ${product.name} at ${store.name}`;

  return {
    title: `${product.name} — ${store.name}`,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: `${product.name} — ${store.name}`,
      description,
      url: baseUrl,
      siteName: store.name,
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { storeSlug, productSlug } = await params;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const product = await getProductBySlug(store.id, productSlug);
  if (!product) notFound();

  const showAccountIcon = (store as any).homePage?.showAccountIcon ?? true;

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme} className="min-h-screen flex flex-col">
          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs opacity-70">
              <Link href={`/store/${store.slug}`} className="hover:opacity-100 transition-opacity flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Store</span>
              </Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              {product.category && (
                <>
                  <Link
                    href={`/store/${store.slug}/shop?category=${product.category.id}`}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {product.category.name}
                  </Link>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </>
              )}
              <span className="truncate max-w-xs font-medium">{product.name}</span>
            </nav>

            {/* Interactive Client Component for gallery, cart, quantity */}
            <ProductDetailClient
              product={{
                ...product,
                price: Number(product.price),
                salePrice: product.salePrice ? Number(product.salePrice) : null,
              }}
              store={store}
            />
          </main>

          <CartDrawer storeSlug={store.slug} />
          <WishlistDrawer storeSlug={store.slug} />
          <StoreFooter store={store as any} />
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}
