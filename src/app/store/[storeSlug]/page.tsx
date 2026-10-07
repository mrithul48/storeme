import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getStorefrontConfig } from "@/services/store.service";
import { prisma } from "@/lib/db";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { StoreFooter } from "@/components/storefront/store-footer";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { TestimonialsSlider } from "@/components/storefront/testimonials-slider";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { Package, Sparkles, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoreLink } from "@/lib/store-url";

// ─── Types ──────────────────────────────────────────────────────────────────

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
};

// ─── Radius helpers ──────────────────────────────────────────────────────────

const CARD_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
};

const CATEGORY_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
  FULL: "rounded-full",
};

const OFFER_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
};

function getCardRadiusClass(radius?: string | null) {
  return CARD_RADIUS_MAP[radius ?? "LG"] ?? "rounded-2xl";
}
function getCategoryRadiusClass(radius?: string | null) {
  return CATEGORY_RADIUS_MAP[radius ?? "MD"] ?? "rounded-xl";
}
function getOfferRadiusClass(radius?: string | null) {
  return OFFER_RADIUS_MAP[radius ?? "MD"] ?? "rounded-xl";
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };

  const baseUrl =
    store.customDomain && store.domainStatus === "CONNECTED"
      ? `https://${store.customDomain}`
      : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/${store.slug}`;

  const description =
    store.company?.description || `Welcome to ${store.name}. Browse our catalog and order online.`;

  return {
    title: `${store.name} — Online Store`,
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: baseUrl },
    openGraph: {
      title: `${store.name} — Online Store`,
      description,
      url: baseUrl,
      siteName: store.name,
      images: store.company?.logoUrl ? [{ url: store.company.logoUrl }] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function StorefrontPage({ params, searchParams }: StorePageProps) {
  const { storeSlug } = await params;
  const { category: categoryId, search, sort } = await searchParams;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;

  // ── Determine which sections are enabled ──────────────────────────────────

  const heroEnabled = (hp?.heroEnabled as boolean) ?? true;
  const heroBanners = Array.isArray(hp?.heroBanners)
    ? (hp.heroBanners as Array<{
        url: string;
        publicId: string;
        mobileUrl?: string | null;
        mobilePublicId?: string | null;
        sortOrder: number;
      }>)
    : [];

  const brandSectionEnabled = (hp?.brandSectionEnabled as boolean) ?? false;
  const brandShape = (hp?.brandShape as string) ?? "SQUARE";

  const categorySectionEnabled = (hp?.categorySectionEnabled as boolean) ?? true;
  const categoryShape = (hp?.categoryShape as string) ?? "SQUARE";
  const categoryRadius = (hp?.categoryRadius as string) ?? "MD";

  const newArrivalEnabled = (hp?.newArrivalEnabled as boolean) ?? true;
  const offerBanners = Array.isArray(hp?.offerBanners) ? hp.offerBanners as Array<{ url: string; publicId: string; linkType?: string | null; linkValue?: string | null; borderRadius?: string | null }> : [];
  const bestSellerEnabled = (hp?.bestSellerEnabled as boolean) ?? true;

  const testimonialSectionEnabled = (hp?.testimonialSectionEnabled as boolean) ?? false;
  const testimonials = Array.isArray(hp?.testimonials)
    ? hp.testimonials as Array<{ id: string; name: string; description: string; rating: number; bgColor?: string | null; sortOrder: number }>
    : [];

  const allProductsEnabled = (hp?.allProductsEnabled as boolean) ?? true;

  const productCardRadius = (hp?.productCardRadius as string) ?? "LG";
  const showSalePrice = (hp?.showSalePrice as boolean) ?? true;
  const showOriginalPrice = (hp?.showOriginalPrice as boolean) ?? true;

  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;
  const headerDeliveryInfo = hp?.headerDeliveryInfo as string | null | undefined;

  const themeColor = store.theme?.primaryColor || "#3b82f6";
  const primaryFont = store.theme?.primaryFont;
  const bgColor = store.theme?.backgroundColor || "#020617";
  const h1Color = store.theme?.h1Color;
  const paragraphColor = store.theme?.paragraphColor;

  // ── Database queries — run in parallel ───────────────────────────────────

  const [categories, brands, newArrivals, allProductsData, offerBannerLinks] = await Promise.all([
    // Categories for category section (active only)
    categorySectionEnabled
      ? prisma.category.findMany({
          where: { storeId: store.id, status: "ACTIVE" },
          select: { id: true, name: true, slug: true, imageUrl: true },
          orderBy: { sortOrder: "asc" },
        })
      : Promise.resolve([]),

    // Brands for brand section
    brandSectionEnabled
      ? prisma.brand.findMany({
          where: { storeId: store.id, status: "ACTIVE" },
          select: { id: true, name: true, slug: true, logoUrl: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),

    // New arrivals — 4 newest active products
    newArrivalEnabled
      ? prisma.product.findMany({
          where: { storeId: store.id, status: "ACTIVE" },
          select: {
            id: true, name: true, slug: true, price: true, salePrice: true, stock: true,
            images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : Promise.resolve([]),

    // All products / best seller section — use for both paginated and best seller
    (allProductsEnabled || bestSellerEnabled)
      ? prisma.product.findMany({
          where: { storeId: store.id, status: "ACTIVE" },
          select: {
            id: true, name: true, slug: true, price: true, salePrice: true, stock: true,
            images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true } },
            _count: { select: { orderItems: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 40,
        })
      : Promise.resolve([]),

    // Resolve offer banner link values for building URLs
    offerBanners.length > 0
      ? Promise.all(
          offerBanners.map(async (b) => {
            if (!b.linkValue || !b.linkType) return null;
            if (b.linkType === "CATEGORY") {
              const cat = await prisma.category.findFirst({
                where: { id: b.linkValue, storeId: store.id },
                select: { slug: true },
              });
              return cat ? `/store/${store.slug}?category=${b.linkValue}` : null;
            }
            if (b.linkType === "PRODUCT") {
              const prod = await prisma.product.findFirst({
                where: { id: b.linkValue, storeId: store.id },
                select: { slug: true },
              });
              return prod ? `/store/${store.slug}/products/${prod.slug}` : null;
            }
            return null;
          })
        )
      : Promise.resolve([]),
  ]);

  // Derive best sellers from allProductsData by orderItems count desc
  const bestSellers = [...allProductsData]
    .sort((a, b) => (b._count?.orderItems ?? 0) - (a._count?.orderItems ?? 0))
    .slice(0, 4);

  const allProducts = allProductsData.slice(0, 8);

  // Normalize products helper — accepts both newArrivals (no _count) and allProductsData (_count optional)
  type NormInput = {
    id: string; name: string; slug: string;
    price: { toNumber?: () => number } | number | string;
    salePrice?: { toNumber?: () => number } | number | string | null;
    stock: number;
    images?: Array<{ url: string; altText?: string | null }>;
    category?: { name: string } | null;
    _count?: { orderItems: number };
  };
  const normalizeProduct = (p: NormInput) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const shopUrl = getStoreLink(storeSlug, "/shop");
  const cardRadiusClass = getCardRadiusClass(productCardRadius);
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          {/* Delivery info bar */}
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

          {/* Header */}
          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

        {/* ── Hero Slider ───────────────────────────────────────────────── */}
        {heroEnabled && heroBanners.length > 0 && (
          <HeroSlider banners={heroBanners} themeColor={themeColor} />
        )}

        {/* ── Brand Section ───────────────────────────────────────────────── */}
        {brandSectionEnabled && brands.length > 0 && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg font-bold mb-6" style={{ color: "var(--store-page-heading, #ffffff)" }}>Our Brands</h2>
              <div className="flex flex-wrap gap-4 items-center">
                {brands.map((brand) => {
                  const isRound = brandShape === "ROUND";
                  const isRect = brandShape === "RECTANGLE";
                  return (
                    <Link
                      key={brand.id}
                      href={`${shopUrl}?brand=${brand.id}`}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 border border-slate-800 hover:border-blue-500/50 transition-all bg-slate-900/50 hover:bg-slate-800/60",
                        isRound ? "rounded-full w-20 h-20" : isRect ? "rounded-xl w-28 h-16" : "rounded-xl w-20 h-20"
                      )}
                    >
                      {brand.logoUrl ? (
                        <div className={cn("relative overflow-hidden", isRound ? "w-12 h-12 rounded-full" : "w-full h-8")}>
                          <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 text-center leading-tight">{brand.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Category Section ─────────────────────────────────────────────── */}
        {categorySectionEnabled && categories.length > 0 && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg font-bold mb-6" style={{ color: "var(--store-page-heading, #ffffff)" }}>Browse Categories</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {categories.map((cat) => {
                  const isRound = categoryShape === "ROUND";
                  const radiusClass = getCategoryRadiusClass(categoryRadius);
                  return (
                    <Link
                      key={cat.id}
                      href={`${shopUrl}?category=${cat.id}`}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 border border-slate-800 hover:border-blue-500/50 transition-all bg-slate-900/50 hover:bg-slate-800/60 text-center group",
                        isRound ? "rounded-full aspect-square" : cn(radiusClass, "aspect-square")
                      )}
                    >
                      {cat.imageUrl ? (
                        <div className={cn("relative overflow-hidden w-full aspect-square", radiusClass)}>
                          <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className={cn("w-full aspect-square bg-slate-800 flex items-center justify-center", radiusClass)}>
                          <span className="text-slate-400 text-xs font-bold">{cat.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-300 truncate w-full">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── New Arrivals ──────────────────────────────────────────────────── */}
        {newArrivalEnabled && newArrivals.length > 0 && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--store-page-heading, #ffffff)" }}>
                  <Sparkles className="w-5 h-5 text-blue-400" /> New Arrivals
                </h2>
                <Link href={getStoreLink(storeSlug, "/shop?newArrival=true")} className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--store-primary, #3b82f6)" }}>
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={normalizeProduct(product)}
                    storeSlug={store.slug}
                    storeName={store.name}
                    whatsappNumber={whatsappNumber}
                    themeColor={themeColor}
                    cardRadiusClass={cardRadiusClass}
                    showSalePrice={showSalePrice}
                    showOriginalPrice={showOriginalPrice}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Offer Banners ─────────────────────────────────────────────────── */}
        {offerBanners.filter((b) => b.url).length > 0 && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {offerBanners.map((banner, idx) => {
                  if (!banner.url) return null;
                  const linkUrl = (offerBannerLinks as (string | null)[])[idx];
                  const radiusClass = getOfferRadiusClass(banner.borderRadius);
                  const inner = (
                    <div className={cn("relative overflow-hidden aspect-[2/1] w-full", radiusClass)}>
                      <Image
                        src={banner.url}
                        alt={`Offer ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  );
                  return linkUrl ? (
                    <Link key={idx} href={linkUrl}>{inner}</Link>
                  ) : (
                    <div key={idx}>{inner}</div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Best Sellers ──────────────────────────────────────────────────── */}
        {bestSellerEnabled && bestSellers.length > 0 && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--store-page-heading, #ffffff)" }}>
                  <Star className="w-5 h-5 text-amber-400" /> Best Sellers
                </h2>
                <Link href={shopUrl} className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--store-primary, #3b82f6)" }}>
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={normalizeProduct(product)}
                    storeSlug={store.slug}
                    storeName={store.name}
                    whatsappNumber={whatsappNumber}
                    themeColor={themeColor}
                    cardRadiusClass={cardRadiusClass}
                    showSalePrice={showSalePrice}
                    showOriginalPrice={showOriginalPrice}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials ──────────────────────────────────────────────────── */}
        {testimonialSectionEnabled && testimonials.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto space-y-8">
              <h2 className="text-xl font-bold text-center" style={{ color: "var(--store-page-heading, #ffffff)" }}>What Our Customers Say</h2>
              <TestimonialsSlider testimonials={testimonials} themeColor={themeColor} />
            </div>
          </section>
        )}

        {/* ── All Products ──────────────────────────────────────────────────── */}
        {allProductsEnabled && (
          <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--store-border)" }}>
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--store-page-heading, #ffffff)" }}>All Products</h2>
                <Link href={shopUrl} className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--store-primary, #3b82f6)" }}>
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {allProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800/60 flex items-center justify-center">
                    <Package className="w-7 h-7 text-slate-500 stroke-1" />
                  </div>
                  <h3 className="text-base font-bold text-white">No products yet</h3>
                  <p className="text-sm text-slate-400">Products will appear here once added to the store.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={normalizeProduct(product)}
                      storeSlug={store.slug}
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
            </div>
          </section>
        )}

        {/* Cart drawer */}
        <CartDrawer storeSlug={store.slug} />

        {/* Wishlist drawer */}
        <WishlistDrawer storeSlug={store.slug} />

        {/* Footer */}
        <StoreFooter store={store as Parameters<typeof StoreFooter>[0]["store"]} />

        {/* WhatsApp floating button */}
        {whatsappEnabled && whatsappNumber && (
          <WhatsAppFloat phoneNumber={whatsappNumber} storeName={store.name} />
        )}
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}
