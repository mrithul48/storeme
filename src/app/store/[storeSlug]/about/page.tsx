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
import { Eye, Target, Store as StoreIcon } from "lucide-react";
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
  const headerDeliveryInfo = hp?.headerDeliveryInfo as string | null | undefined;
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  const heading = (hp?.aboutHeading as string) || `About ${store.name}`;
  const content = (hp?.aboutContent as string) || store.company?.description || null;
  const imageUrl = hp?.aboutImageUrl as string | null | undefined;
  const vision = hp?.vision as string | null | undefined;
  const mission = hp?.mission as string | null | undefined;
  const badges = Array.isArray(hp?.badges)
    ? (hp.badges as Array<{ id: string; icon?: string | null; text: string; sortOrder: number }>)
    : [];

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

          <main className="flex-1">
            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div
              className="border-b py-12 px-4 text-center"
              style={{ borderColor: "var(--store-border)" }}
            >
              <div className="max-w-3xl mx-auto space-y-2">
                <h1
                  className="text-3xl md:text-5xl font-extrabold tracking-tight"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  {heading}
                </h1>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: "var(--store-page-muted, #94a3b8)" }}
                >
                  Discover our story, mission, and the passion behind {store.name}
                </p>
              </div>
            </div>

            {/* ── Content + Image ─────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className="space-y-6">
                  {content ? (
                    <p
                      className="text-base leading-relaxed whitespace-pre-line"
                      style={{ color: "var(--store-page-text, #f8fafc)" }}
                    >
                      {content}
                    </p>
                  ) : (
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: "var(--store-page-text, #f8fafc)" }}
                    >
                      Welcome to {store.name}. We are dedicated to providing you the best products with a focus on dependability, customer service, and quality.
                    </p>
                  )}

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {[...badges].sort((a, b) => a.sortOrder - b.sortOrder).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                          style={{
                            backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.6))",
                            borderColor: "var(--store-border, rgba(255, 255, 255, 0.1))",
                            color: "var(--store-page-text, #f8fafc)",
                          }}
                        >
                          {badge.icon ? (
                            <div className="relative w-7 h-7 flex-shrink-0">
                              <Image src={badge.icon} alt={badge.text} fill className="object-contain" />
                            </div>
                          ) : (
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                              style={{
                                backgroundColor: "var(--store-button-bg, #22c55e)",
                                color: "var(--store-button-text, #ffffff)",
                              }}
                            >
                              ✓
                            </div>
                          )}
                          <span className="text-xs font-semibold">{badge.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      href={getStoreLink(storeSlug, "/shop")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-95"
                      style={{
                        backgroundColor: "var(--store-button-bg, #22c55e)",
                        color: "var(--store-button-text, #ffffff)",
                        borderRadius: "var(--store-button-radius, 10px)",
                      }}
                    >
                      Explore Our Products
                    </Link>
                  </div>
                </div>

                {/* Image */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border shadow-xl bg-slate-900/40" style={{ borderColor: "var(--store-border)" }}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={heading}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : store.company?.logoUrl ? (
                    <Image
                      src={store.company.logoUrl}
                      alt={store.name}
                      fill
                      className="object-contain p-12"
                      sizes="(max-width: 768px) 100vw, 50vw"
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

            {/* ── Vision & Mission ────────────────────────────────────────── */}
            {(vision || mission) && (
              <section className="border-t py-14 px-4 sm:px-6 lg:px-8" style={{ borderColor: "var(--store-border)" }}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  {vision && (
                    <div
                      className="p-8 rounded-2xl border space-y-3"
                      style={{
                        backgroundColor: "var(--store-surface, #0f172a)",
                        borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold" style={{ color: "var(--store-page-heading, #ffffff)" }}>Our Vision</h2>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--store-page-text, #94a3b8)" }}>
                        {vision}
                      </p>
                    </div>
                  )}

                  {mission && (
                    <div
                      className="p-8 rounded-2xl border space-y-3"
                      style={{
                        backgroundColor: "var(--store-surface, #0f172a)",
                        borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold" style={{ color: "var(--store-page-heading, #ffffff)" }}>Our Mission</h2>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--store-page-text, #94a3b8)" }}>
                        {mission}
                      </p>
                    </div>
                  )}
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
