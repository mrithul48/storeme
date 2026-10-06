import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStorefrontConfig } from "@/services/store.service";
import { prisma } from "@/lib/db";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopClient } from "./shop-client";
import { Package, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getStoreLink } from "@/lib/store-url";
import { Prisma } from "@prisma/client";

type ShopPageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    newArrival?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: ShopPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `Shop — ${store.name}`,
    description: `Browse all products from ${store.name}.`,
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { storeSlug } = await params;
  const {
    category,
    brand,
    search,
    sort,
    minPrice,
    maxPrice,
    availability,
    newArrival,
    page,
  } = await searchParams;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const themeColor = store.theme?.primaryColor || "#3b82f6";
  const productCardRadius = (hp?.productCardRadius as string) ?? "LG";
  const showSalePrice = (hp?.showSalePrice as boolean) ?? true;
  const showOriginalPrice = (hp?.showOriginalPrice as boolean) ?? true;
  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const headerDeliveryInfo = hp?.headerDeliveryInfo as string | null | undefined;
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  const isNewArrival = newArrival === "true";
  const pageNum = parseInt(page || "1", 10) || 1;
  const LIMIT = 16;
  const skip = (pageNum - 1) * LIMIT;

  const validSort = ["price-asc", "price-desc", "newest", "oldest"];
  const safeSort = isNewArrival ? "newest" : (validSort.includes(sort || "") ? sort! : "newest");

  const orderBy =
    safeSort === "price-asc" ? { price: "asc" as const }
    : safeSort === "price-desc" ? { price: "desc" as const }
    : safeSort === "oldest" ? { createdAt: "asc" as const }
    : { createdAt: "desc" as const };

  const where: Prisma.ProductWhereInput = {
    storeId: store.id,
    status: "ACTIVE",
    ...(category ? { categoryId: category } : {}),
    ...(brand ? { brandId: brand } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    } : {}),
    ...(minPrice || maxPrice ? {
      price: {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      },
    } : {}),
    ...(availability === "in-stock" ? { stock: { gt: 0 } } : {}),
    ...(availability === "out-of-stock" ? { stock: { lte: 0 } } : {}),
  };

  const [products, totalCount, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        stock: true,
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        category: { select: { name: true } },
      },
      orderBy,
      skip,
      take: LIMIT,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { storeId: store.id, status: "ACTIVE" },
      select: { id: true, name: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    store.settings?.brandsEnabled
      ? prisma.brand.findMany({
          where: { storeId: store.id, status: "ACTIVE" },
          select: { id: true, name: true, _count: { select: { products: true } } },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const normalizedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
  }));

  const totalPages = Math.ceil(totalCount / LIMIT);

  const CARD_RADIUS_MAP: Record<string, string> = {
    NONE: "rounded-none",
    SM: "rounded-lg",
    MD: "rounded-xl",
    LG: "rounded-2xl",
  };
  const cardRadiusClass = CARD_RADIUS_MAP[productCardRadius] ?? "rounded-2xl";

  const hasAnyFilter = Boolean(
    category ||
    brand ||
    search ||
    minPrice ||
    maxPrice ||
    availability ||
    isNewArrival ||
    (sort && sort !== "newest")
  );

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          {headerDeliveryInfo && (
            <div
              className="w-full py-2 px-4 text-center text-xs font-semibold"
              style={{
                backgroundColor: "var(--store-primary, #3b82f6)",
                color: "#ffffff",
              }}
            >
              {headerDeliveryInfo}
            </div>
          )}

          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title & Breadcrumbs */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4" style={{ borderColor: "var(--store-border)" }}>
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  {isNewArrival ? (
                    <>
                      <Sparkles className="w-6 h-6 text-amber-400" />
                      New Arrivals
                    </>
                  ) : (
                    "Shop All Products"
                  )}
                </h1>
                <p
                  className="text-xs sm:text-sm mt-1"
                  style={{ color: "var(--store-page-muted, #94a3b8)" }}
                >
                  {isNewArrival
                    ? "Explore the latest additions to our store collection."
                    : `Browse our full catalog (${totalCount} item${totalCount !== 1 ? "s" : ""})`}
                </p>
              </div>

              {hasAnyFilter && (
                <Link
                  href={getStoreLink(storeSlug, "/shop")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
                  style={{
                    borderColor: "var(--store-border)",
                    color: "var(--store-page-text)",
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </Link>
              )}
            </div>

            <div className="flex gap-8">
              {/* ── Left Sidebar Filters (Desktop) ────────────────────── */}
              <aside className="hidden md:block w-64 flex-shrink-0 space-y-6">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Categories</h3>
                    <div className="space-y-1">
                      <Link
                        href={buildShopUrl(storeSlug, { brand, search, sort, minPrice, maxPrice, availability, newArrival })}
                        className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          !category
                            ? "bg-blue-600/15 text-blue-400 font-bold"
                            : "opacity-80 hover:bg-black/5 hover:opacity-100"
                        }`}
                      >
                        All Categories
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={buildShopUrl(storeSlug, { category: cat.id, brand, search, sort, minPrice, maxPrice, availability, newArrival })}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            category === cat.id
                              ? "bg-blue-600/15 text-blue-400 font-bold"
                              : "opacity-80 hover:bg-black/5 hover:opacity-100"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-[11px] opacity-50">{cat._count.products}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Brands</h3>
                    <div className="space-y-1">
                      <Link
                        href={buildShopUrl(storeSlug, { category, search, sort, minPrice, maxPrice, availability, newArrival })}
                        className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          !brand
                            ? "bg-blue-600/15 text-blue-400 font-bold"
                            : "opacity-80 hover:bg-black/5 hover:opacity-100"
                        }`}
                      >
                        All Brands
                      </Link>
                      {brands.map((b) => (
                        <Link
                          key={b.id}
                          href={buildShopUrl(storeSlug, { category, brand: b.id, search, sort, minPrice, maxPrice, availability, newArrival })}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            brand === b.id
                              ? "bg-blue-600/15 text-blue-400 font-bold"
                              : "opacity-80 hover:bg-black/5 hover:opacity-100"
                          }`}
                        >
                          <span>{b.name}</span>
                          <span className="text-[11px] opacity-50">{b._count.products}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Filter */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Availability</h3>
                  <div className="space-y-1">
                    {[
                      { value: undefined, label: "All Items" },
                      { value: "in-stock", label: "In Stock Only" },
                      { value: "out-of-stock", label: "Out of Stock" },
                    ].map((opt) => (
                      <Link
                        key={opt.label}
                        href={buildShopUrl(storeSlug, { category, brand, search, sort, minPrice, maxPrice, availability: opt.value, newArrival })}
                        className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          availability === opt.value || (!availability && !opt.value)
                            ? "bg-blue-600/15 text-blue-400 font-bold"
                            : "opacity-80 hover:bg-black/5 hover:opacity-100"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sort By Filter */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Sort By</h3>
                  <div className="space-y-1">
                    {[
                      { value: "newest", label: "Newest First" },
                      { value: "price-asc", label: "Price: Low to High" },
                      { value: "price-desc", label: "Price: High to Low" },
                      { value: "oldest", label: "Oldest First" },
                    ].map((opt) => (
                      <Link
                        key={opt.value}
                        href={buildShopUrl(storeSlug, { category, brand, search, sort: opt.value, minPrice, maxPrice, availability, newArrival: opt.value === "newest" && isNewArrival ? "true" : undefined })}
                        className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          safeSort === opt.value
                            ? "bg-blue-600/15 text-blue-400 font-bold"
                            : "opacity-80 hover:bg-black/5 hover:opacity-100"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>

              {/* ── Product Grid Section ─────────────────────────────── */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Search Bar + Mobile filter drawer trigger */}
                <ShopClient
                  storeSlug={storeSlug}
                  categories={categories}
                  brands={brands}
                  activeCategory={category}
                  activeBrand={brand}
                  activeSearch={search}
                  activeSort={safeSort}
                  activeAvailability={availability}
                  activeMinPrice={minPrice}
                  activeMaxPrice={maxPrice}
                  isNewArrival={isNewArrival}
                />

                {/* Product Count & Active Search note */}
                <div className="flex items-center justify-between text-xs opacity-70">
                  <span>
                    {totalCount === 0
                      ? "No products found"
                      : `${totalCount} product${totalCount !== 1 ? "s" : ""} found`}
                    {search && (
                      <span> for &ldquo;<strong>{search}</strong>&rdquo;</span>
                    )}
                  </span>
                </div>

                {normalizedProducts.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border space-y-4"
                    style={{
                      backgroundColor: "var(--store-surface, #0f172a)",
                      borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Package className="w-7 h-7 stroke-1" />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className="text-base font-bold"
                        style={{ color: "var(--store-page-heading, #ffffff)" }}
                      >
                        No products match your criteria
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--store-page-muted, #94a3b8)" }}
                      >
                        Try selecting another category or clearing your active filters.
                      </p>
                    </div>
                    <Link
                      href={getStoreLink(storeSlug, "/shop")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                      style={{
                        backgroundColor: "var(--store-button-bg, #22c55e)",
                        color: "var(--store-button-text, #ffffff)",
                      }}
                    >
                      Reset All Filters
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {normalizedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storeSlug={storeSlug}
                        storeName={store.name}
                        whatsappNumber={whatsappNumber}
                        themeColor={themeColor}
                        cardRadiusClass={cardRadiusClass}
                        showSalePrice={showSalePrice}
                        showOriginalPrice={showOriginalPrice}
                      />
                    ))}
                  </div>
                )}

                {/* ── Pagination ─────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {pageNum > 1 && (
                      <Link
                        href={buildShopUrl(storeSlug, { category, brand, search, sort, minPrice, maxPrice, availability, newArrival, page: String(pageNum - 1) })}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-black/5"
                        style={{ borderColor: "var(--store-border)" }}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </Link>
                    )}

                    <span className="text-xs px-3 py-2 opacity-60">
                      Page {pageNum} of {totalPages}
                    </span>

                    {pageNum < totalPages && (
                      <Link
                        href={buildShopUrl(storeSlug, { category, brand, search, sort, minPrice, maxPrice, availability, newArrival, page: String(pageNum + 1) })}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-black/5"
                        style={{ borderColor: "var(--store-border)" }}
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          <CartDrawer storeSlug={store.slug} />
          <WishlistDrawer storeSlug={store.slug} />
          <StoreFooter store={store as Parameters<typeof StoreFooter>[0]["store"]} />

          {whatsappEnabled && whatsappNumber && (
            <WhatsAppFloat phoneNumber={whatsappNumber} storeName={store.name} />
          )}
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildShopUrl(
  storeSlug: string,
  params: {
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    newArrival?: string;
    page?: string;
  }
) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.brand) sp.set("brand", params.brand);
  if (params.search) sp.set("search", params.search);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.minPrice) sp.set("minPrice", params.minPrice);
  if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
  if (params.availability) sp.set("availability", params.availability);
  if (params.newArrival) sp.set("newArrival", params.newArrival);
  if (params.page && params.page !== "1") sp.set("page", params.page);

  const qs = sp.toString();
  return getStoreLink(storeSlug, `/shop${qs ? `?${qs}` : ""}`);
}
