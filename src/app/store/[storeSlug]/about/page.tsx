import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontConfig } from "@/services/store.service";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { StoreStatistics } from "@/components/storefront/store-statistics";
import { Eye, Target, Store as StoreIcon, ArrowRight } from "lucide-react";
import { getStoreLink } from "@/lib/store-url";

type AboutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: AboutPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Not Found" };
  return {
    title: `About Us — ${store.name}`,
    description: `Learn more about ${store.name}.`,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  const heading = (hp?.aboutHeading as string) || `About ${store.name}`;
  const content = (hp?.aboutContent as string) || store.company?.description || null;
  const imageUrl = hp?.aboutImageUrl as string | null | undefined;
  const vision = hp?.vision as string | null | undefined;
  const mission = hp?.mission as string | null | undefined;
  const badges = Array.isArray(hp?.badges)
    ? (hp.badges as Array<{
        id: string;
        count?: string;
        heading?: string;
        description?: string;
        text?: string;
        sortOrder: number;
      }>)
    : [];

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

          <main className="flex-1">
            {/* ── 1. Main About Section: Heading & Description (Left), Image (Right) ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Text Side: Heading, Description & Centered Button on Mobile, Left on Desktop */}
                <div className="space-y-6 order-2 lg:order-1 text-center lg:text-left">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
                    style={{ color: "var(--store-page-heading, #ffffff)" }}
                  >
                    {heading}
                  </h1>

                  <div className="space-y-4 max-w-xl mx-auto lg:mx-0">
                    {content ? (
                      <p
                        className="text-base sm:text-lg leading-relaxed whitespace-pre-line"
                        style={{ color: "var(--store-page-paragraph, var(--store-page-text, #f8fafc))" }}
                      >
                        {content}
                      </p>
                    ) : (
                      <p
                        className="text-base sm:text-lg leading-relaxed"
                        style={{ color: "var(--store-page-paragraph, var(--store-page-text, #f8fafc))" }}
                      >
                        Welcome to {store.name}. We are dedicated to providing you the best products with a focus on dependability, customer service, and quality.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-center lg:justify-start">
                    <Link
                      href={getStoreLink(storeSlug, "/shop")}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95"
                      style={{
                        backgroundColor: "var(--store-button-bg, #22c55e)",
                        color: "var(--store-button-text, #ffffff)",
                        borderRadius: "var(--store-button-radius, 10px)",
                      }}
                    >
                      <span>Explore Our Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Image Side: Appears First on Mobile, Right on Desktop */}
                <div
                  className="relative aspect-4/3 w-full overflow-hidden border shadow-lg bg-slate-900/40 order-1 lg:order-2"
                  style={{
                    borderRadius: "var(--store-image-radius, 10px)",
                    borderColor: "var(--store-border, rgba(255, 255, 255, 0.1))",
                  }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={heading}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : store.company?.logoUrl ? (
                    <Image
                      src={store.company.logoUrl}
                      alt={store.name}
                      fill
                      className="object-contain p-12"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                      <StoreIcon className="w-16 h-16 mb-2" />
                      <span className="font-bold text-base">{store.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── 2. Statistics Section (Separate Reusable Component) ── */}
            <StoreStatistics badges={badges} />

            {/* ── 3. Mission & Vision Section (Balanced 2-Column Layout) ── */}
            {(mission || vision) && (
              <section
                className="border-t py-14 sm:py-20 px-4 sm:px-6 lg:px-8"
                style={{ borderColor: "var(--store-border)" }}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Our Mission */}
                    {mission && (
                      <div
                        className="p-8 border space-y-4 transition-all"
                        style={{
                          backgroundColor: "var(--store-surface, #0f172a)",
                          borderColor: "var(--store-border, rgba(255, 255, 255, 0.1))",
                          borderRadius: "var(--store-image-radius, 10px)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center border"
                            style={{
                              backgroundColor: "rgba(34, 197, 94, 0.1)",
                              borderColor: "rgba(34, 197, 94, 0.2)",
                              borderRadius: "var(--store-image-radius, 10px)",
                            }}
                          >
                            <Target className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h2
                            className="text-xl font-bold tracking-tight"
                            style={{ color: "var(--store-page-heading, #ffffff)" }}
                          >
                            Our Mission
                          </h2>
                        </div>
                        <p
                          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
                          style={{ color: "var(--store-page-paragraph, var(--store-page-text, #94a3b8))" }}
                        >
                          {mission}
                        </p>
                      </div>
                    )}

                    {/* Our Vision */}
                    {vision && (
                      <div
                        className="p-8 border space-y-4 transition-all"
                        style={{
                          backgroundColor: "var(--store-surface, #0f172a)",
                          borderColor: "var(--store-border, rgba(255, 255, 255, 0.1))",
                          borderRadius: "var(--store-image-radius, 10px)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center border"
                            style={{
                              backgroundColor: "rgba(56, 189, 248, 0.1)",
                              borderColor: "rgba(56, 189, 248, 0.2)",
                              borderRadius: "var(--store-image-radius, 10px)",
                            }}
                          >
                            <Eye className="w-5 h-5 text-blue-400" />
                          </div>
                          <h2
                            className="text-xl font-bold tracking-tight"
                            style={{ color: "var(--store-page-heading, #ffffff)" }}
                          >
                            Our Vision
                          </h2>
                        </div>
                        <p
                          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
                          style={{ color: "var(--store-page-paragraph, var(--store-page-text, #94a3b8))" }}
                        >
                          {vision}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
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
