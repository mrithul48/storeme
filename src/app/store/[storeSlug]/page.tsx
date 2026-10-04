import React from "react";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getPublicProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { CartProvider } from "@/context/cart-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreFooter } from "@/components/storefront/store-footer";
import { Package, Sparkles } from "lucide-react";

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
};

export async function generateMetadata({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);

  if (!store) {
    return { title: "Store Not Found" };
  }

  return {
    title: `${store.name} — Online Store`,
    description: store.company?.description || `Welcome to ${store.name}. Browse our catalog and order online.`,
  };
}

export default async function StorefrontPage({ params, searchParams }: StorePageProps) {
  const { storeSlug } = await params;
  const { category: categoryId, search, sort } = await searchParams;

  const store = await getStorefrontConfig(storeSlug);

  if (!store) {
    notFound();
  }

  // Fetch store categories and products
  const [categories, productData] = await Promise.all([
    listCategories(store.id),
    getPublicProducts(store.id, {
      limit: 40,
      categoryId: categoryId || undefined,
      search: search || undefined,
      sortBy: sort === "price-asc" || sort === "price-desc" ? "price" : "createdAt",
      sortOrder: sort === "price-asc" ? "asc" : "desc",
    }),
  ]);

  const products = productData.data.map((p) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
  }));
  const themeColor = store.theme?.primaryColor || "#3b82f6";
  const heroHeading = store.homePage?.heroHeading || `Welcome to ${store.name}`;
  const heroSubheading = store.homePage?.heroSubtitle || store.company?.description;

  return (
    <CartProvider storeSlug={store.slug}>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {/* Storefront Header */}
        <StoreHeader store={store} />

        {/* Hero Section */}
        {store.homePage?.heroEnabled !== false && (
          <section className="relative overflow-hidden py-16 md:py-24 border-b border-slate-900 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
            {/* Ambient background glow */}
            <div
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[120px] rounded-full opacity-20 pointer-events-none"
              style={{ backgroundColor: themeColor }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Online Store</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
                {heroHeading}
              </h1>

              {heroSubheading && (
                <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  {heroSubheading}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Catalog Section */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Category Tabs Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <a
                href={`/store/${store.slug}`}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  !categoryId
                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                All Products
              </a>
              {categories.map((cat) => {
                const isActive = categoryId === cat.id;
                return (
                  <a
                    key={cat.id}
                    href={`/store/${store.slug}?category=${cat.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {cat.name} ({cat._count.products})
                  </a>
                );
              })}
            </div>
          )}

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/80 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400">
                <Package className="w-8 h-8 stroke-1" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No products found</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  There are no products listed in this category yet. Check back soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={store.slug}
                  storeName={store.name}
                  whatsappNumber={store.company?.whatsapp || store.company?.phone}
                  themeColor={themeColor}
                />
              ))}
            </div>
          )}
        </main>

        {/* Cart Drawer */}
        <CartDrawer storeSlug={store.slug} />

        {/* Footer */}
        <StoreFooter store={store as any} />
      </div>
    </CartProvider>
  );
}
