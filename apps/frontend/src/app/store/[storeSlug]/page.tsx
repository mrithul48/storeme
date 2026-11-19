import React from "react";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { listProducts, getProduct } from "@/services/product.service";
import { listCategories, getCategory } from "@/services/category.service";
import { listBrands } from "@/services/brand.service";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { BrandSection } from "@/components/storefront/brand-section";
import { CategorySection } from "@/components/storefront/category-section";
import { NewArrivalsSection } from "@/components/storefront/new-arrivals-section";
import { OfferBannersSection } from "@/components/storefront/offer-banners-section";
import { BestSellersSection } from "@/components/storefront/best-sellers-section";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { AllProductsSection } from "@/components/storefront/all-products-section";
import { getStoreLink } from "@/lib/store-url";
import { StorefrontDrawers } from "@/components/storefront/storefront-drawers";

// Cache page at edge/server with ISR (revalidates every 60 seconds)
export const revalidate = 60;

// ─── Types ──────────────────────────────────────────────────────────────────

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<{ category?: string; search?: string; sort?: string }>;
};

// ─── Radius helpers ──────────────────────────────────────────────────────────

const CARD_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
};

function getCardRadiusClass(radius?: string | null) {
  return CARD_RADIUS_MAP[radius ?? "LG"] ?? "rounded-2xl";
}

// ─── Product normalization ───────────────────────────────────────────────────

type NormInput = {
  id: string;
  name: string;
  slug: string;
  price: { toNumber?: () => number } | number | string;
  salePrice?: { toNumber?: () => number } | number | string | null;
  stock: number;
  images?: any;
  variants?: any[];
  category?: { name: string } | null;
  _count?: { orderItems: number };
};

const normalizeProduct = (p: NormInput) => {
  let images = p.images;
  if (typeof images === "string") {
    try {
      images = JSON.parse(images);
    } catch {
      images = [{ url: images }];
    }
  } else if (Array.isArray(images)) {
    images = images.map((img: any) =>
      typeof img === "string" ? { url: img } : img
    );
  } else if (!images && (p as any).variants?.[0]?.images) {
    images = (p as any).variants[0].images;
  }

  return {
    ...p,
    images: images || [],
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
  };
};

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

export default async function StorefrontPage({ params }: StorePageProps) {
  const { storeSlug } = await params;

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
  const offerBanners = Array.isArray(hp?.offerBanners)
    ? (hp.offerBanners as Array<{
        url: string;
        publicId: string;
        linkType?: string | null;
        linkValue?: string | null;
        borderRadius?: string | null;
      }>)
    : [];
  const bestSellerEnabled = (hp?.bestSellerEnabled as boolean) ?? true;

  const testimonialSectionEnabled = (hp?.testimonialSectionEnabled as boolean) ?? false;
  const testimonials = Array.isArray(hp?.testimonials)
    ? (hp.testimonials as Array<{
        id: string;
        name: string;
        description: string;
        rating: number;
        bgColor?: string | null;
        sortOrder: number;
      }>)
    : [];

  const allProductsEnabled = (hp?.allProductsEnabled as boolean) ?? true;

  const productCardRadius = (hp?.productCardRadius as string) ?? "LG";
  const showSalePrice = (hp?.showSalePrice as boolean) ?? true;
  const showOriginalPrice = (hp?.showOriginalPrice as boolean) ?? true;

  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;

  const themeColor = store.theme?.primaryColor || "#3b82f6";

  // ── Database queries — run in parallel ───────────────────────────────────

  const needFullCatalog = allProductsEnabled || bestSellerEnabled;
  const needNewArrivalsOnly = newArrivalEnabled && !needFullCatalog;

  // Collect offer banner references for batched lookups (avoiding N+1 queries)
  const bannerCategoryIds = offerBanners
    .filter((b) => b.linkType === "CATEGORY" && b.linkValue)
    .map((b) => b.linkValue as string);
  const bannerProductIds = offerBanners
    .filter((b) => b.linkType === "PRODUCT" && b.linkValue)
    .map((b) => b.linkValue as string);

  const [categories, brands, productsRes, bannerCategories, bannerProducts] = await Promise.all([
    categorySectionEnabled
      ? listCategories(store.id, { status: "ACTIVE" })
      : Promise.resolve([]),

    brandSectionEnabled
      ? listBrands(store.id, { status: "ACTIVE" })
      : Promise.resolve([]),

    needFullCatalog || needNewArrivalsOnly
      ? listProducts(store.id, { limit: needFullCatalog ? 40 : 4, status: "ACTIVE" })
      : Promise.resolve({ data: [] }),

    bannerCategoryIds.length > 0
      ? Promise.all(bannerCategoryIds.map((id) => getCategory(store.id, id).catch(() => null))).then((cats) =>
          cats.filter((c): c is { id: string; slug: string } => !!c && !!c.slug)
        )
      : Promise.resolve([]),

    bannerProductIds.length > 0
      ? Promise.all(bannerProductIds.map((id) => getProduct(store.id, id).catch(() => null))).then((prods) =>
          prods.filter((p): p is { id: string; slug: string } => !!p && !!p.slug)
        )
      : Promise.resolve([]),
  ]);

  const productsData = productsRes.data || [];

  // Fast in-memory resolution of banner links
  const categoryMap = new Map(bannerCategories.map((c) => [c.id, c.slug]));
  const productMap = new Map(bannerProducts.map((p) => [p.id, p.slug]));

  const offerBannerLinks = offerBanners.map((b) => {
    if (!b.linkValue || !b.linkType) return null;
    if (b.linkType === "CATEGORY") {
      const exists = categoryMap.has(b.linkValue);
      return exists ? `/store/${store.slug}?category=${b.linkValue}` : null;
    }
    if (b.linkType === "PRODUCT") {
      const slug = productMap.get(b.linkValue);
      return slug ? `/store/${store.slug}/products/${slug}` : null;
    }
    return null;
  });

  // Single-pass product normalization
  const normalizedProducts = productsData.map(normalizeProduct);

  // New arrivals: 4 newest active products
  const newArrivals = newArrivalEnabled ? normalizedProducts.slice(0, 4) : [];

  // Best sellers: top 4 ordered products
  const bestSellers = bestSellerEnabled
    ? [...normalizedProducts]
        .sort((a, b) => (b._count?.orderItems ?? 0) - (a._count?.orderItems ?? 0))
        .slice(0, 4)
    : [];

  // All products: first 8 products
  const allProducts = allProductsEnabled ? normalizedProducts.slice(0, 8) : [];

  // ─── Render ─────────────────────────────────────────────────────────────────

  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const shopUrl = getStoreLink(storeSlug, "/shop");
  const cardRadiusClass = getCardRadiusClass(productCardRadius);
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          {/* Header */}
          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

          {/* Hero Slider */}
          {heroEnabled && heroBanners.length > 0 && (
            <HeroSlider banners={heroBanners} themeColor={themeColor} />
          )}

          {/* Brand Section */}
          {brandSectionEnabled && (
            <BrandSection
              brands={brands}
              brandShape={brandShape}
              shopUrl={shopUrl}
            />
          )}

          {/* Category Section */}
          {categorySectionEnabled && (
            <CategorySection
              categories={categories}
              categoryShape={categoryShape}
              categoryRadius={categoryRadius}
              shopUrl={shopUrl}
            />
          )}

          {/* New Arrivals */}
          {newArrivalEnabled && (
            <NewArrivalsSection
              products={newArrivals}
              storeSlug={store.slug}
              storeName={store.name}
              whatsappNumber={whatsappNumber}
              themeColor={themeColor}
              cardRadiusClass={cardRadiusClass}
              showSalePrice={showSalePrice}
              showOriginalPrice={showOriginalPrice}
            />
          )}

          {/* Offer Banners */}
          <OfferBannersSection
            banners={offerBanners}
            bannerLinks={offerBannerLinks}
          />

          {/* Best Sellers */}
          {bestSellerEnabled && (
            <BestSellersSection
              products={bestSellers}
              storeSlug={store.slug}
              storeName={store.name}
              shopUrl={shopUrl}
              whatsappNumber={whatsappNumber}
              themeColor={themeColor}
              cardRadiusClass={cardRadiusClass}
              showSalePrice={showSalePrice}
              showOriginalPrice={showOriginalPrice}
            />
          )}

          {/* Testimonials */}
          {testimonialSectionEnabled && (
            <TestimonialsSection
              testimonials={testimonials}
              themeColor={themeColor}
            />
          )}

          {/* All Products */}
          {allProductsEnabled && (
            <AllProductsSection
              products={allProducts}
              storeSlug={store.slug}
              storeName={store.name}
              shopUrl={shopUrl}
              whatsappNumber={whatsappNumber}
              themeColor={themeColor}
              cardRadiusClass={cardRadiusClass}
              showSalePrice={showSalePrice}
              showOriginalPrice={showOriginalPrice}
            />
          )}

          {/* Drawers (lazy-loaded client-side) */}
          <StorefrontDrawers storeSlug={store.slug} />

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
