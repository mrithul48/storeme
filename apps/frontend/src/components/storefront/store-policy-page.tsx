import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Info, HelpCircle } from "lucide-react";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { getStoreLink } from "@/lib/store-url";
import type { getStorefrontConfig } from "@/services/store.service";

type StorefrontConfig = NonNullable<Awaited<ReturnType<typeof getStorefrontConfig>>>;

export interface PolicyPointItem {
  id: string;
  heading: string;
  description: string;
  sortOrder?: number;
}

interface StorePolicyPageProps {
  store: StorefrontConfig;
  policyType: "delivery" | "refund" | "privacy";
  defaultHeading: string;
  icon: React.ElementType;
  heading: string | null | undefined;
  description?: string | null | undefined;
  points?: PolicyPointItem[] | null;
}

export function StorePolicyPage({
  store,
  defaultHeading,
  icon: Icon,
  heading,
  description,
  points,
}: StorePolicyPageProps) {
  const hp = store.homePage as Record<string, unknown> | null;
  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  const displayHeading = heading?.trim() || defaultHeading;

  // Filter valid points that have at least a heading or a description
  const activePoints = Array.isArray(points)
    ? points.filter(
        (p) =>
          (p?.heading && p.heading.trim().length > 0) ||
          (p?.description && p.description.trim().length > 0)
      )
    : [];

  const hasLegacyContent = Boolean(description && description.trim().length > 0);
  const hasContent = activePoints.length > 0 || hasLegacyContent;

  const homeLink = getStoreLink(store.slug, "/");
  const shopLink = getStoreLink(store.slug, "/shop");
  const contactLink = getStoreLink(store.slug, "/contact");

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          <StoreHeader
            store={store as Parameters<typeof StoreHeader>[0]["store"]}
            showAccountIcon={showAccountIcon}
          />

          <main className="flex-1 pb-20">
            {/* ── Breadcrumb Bar ─────────────────────────────────────────── */}
            <div
              className="border-b"
              style={{
                borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))",
                backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.4))",
              }}
            >
      
            </div>

            {/* ── Hero Title Section ─────────────────────────────────────── */}
            <section
              className="relative py-12 sm:py-16 border-b overflow-hidden"
              style={{
                borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))",
                backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.2))",
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-3">
              

                    <h1
                      className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
                      style={{ color: "var(--store-page-heading, #ffffff)" }}
                    >
                      {displayHeading}
                    </h1>

                    <p
                      className="text-xs sm:text-sm max-w-2xl leading-relaxed"
                      style={{ color: "var(--store-page-muted, #94a3b8)" }}
                    >
                      Official policy terms for <strong className="font-semibold"  style={{ color: "var(--store-page-muted, #94a3b8)" }}>{store.name}</strong>
                    </p>
                  </div>

                  <Link
                    href={shopLink}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all self-start sm:self-auto hover:opacity-80 active:scale-95"
                    style={{
                      borderColor: "var(--store-border, rgba(255, 255, 255, 0.15))",
                      backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.6))",
                      color: "var(--store-page-text, #ffffff)",
                    }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Shop</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Policy Content Body ───────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              {hasContent ? (
                <div className="space-y-6">
                  {/* Multiple Policy Points structured view */}
                  {activePoints.length > 0 && (
                    <div className="space-y-4">
                      {activePoints.map((pt, idx) => (
                        <div
                          key={pt.id || idx}
                          className="p-6 sm:p-8 border rounded-2xl shadow-sm transition-all"
                          style={{
                            backgroundColor: "var(--store-surface, #0f172a)",
                            borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))",
                            borderRadius: "var(--store-image-radius, 16px)",
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border mt-0.5"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                borderColor: "rgba(59, 130, 246, 0.25)",
                                color: "var(--store-primary, #60a5fa)",
                              }}
                            >
                              {String(idx + 1).padStart(2, "0")}
                            </div>

                            <div className="space-y-2.5 flex-1 min-w-0">
                              {pt.heading && (
                                <h2
                                  className="text-lg sm:text-md font-bold  tracking-tight"
                                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                                >
                                  {pt.heading}
                                </h2>
                              )}

                              {pt.description && (
                                <p
                                  className="text-sm  leading-relaxed whitespace-pre-line break-words font-normal"
                                  style={{
                                    color: "var(--store-page-paragraph, var(--store-page-text, #cbd5e1))",
                                  }}
                                >
                                  {pt.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback Single Description if no points */}
                  {activePoints.length === 0 && hasLegacyContent && (
                    <div
                      className="p-6 sm:p-10 border rounded-2xl shadow-sm"
                      style={{
                        backgroundColor: "var(--store-surface, #0f172a)",
                        borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))",
                        borderRadius: "var(--store-image-radius, 16px)",
                      }}
                    >
                      <article className="prose prose-invert max-w-none">
                        <div
                          className="text-sm sm:text-base leading-relaxed whitespace-pre-line break-words font-normal"
                          style={{
                            color: "var(--store-page-paragraph, var(--store-page-text, #cbd5e1))",
                          }}
                        >
                          {description}
                        </div>
                      </article>
                    </div>
                  )}

                  {/* Support Callout */}
             
                </div>
              ) : (
                /* Graceful Unpublished State — No fabricated content */
                <div
                  className="p-8 sm:p-12 border rounded-2xl text-center max-w-lg mx-auto space-y-4"
                  style={{
                    backgroundColor: "var(--store-surface, #0f172a)",
                    borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))",
                    borderRadius: "var(--store-image-radius, 16px)",
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border"
                    style={{
                      backgroundColor: "rgba(148, 163, 184, 0.08)",
                      borderColor: "rgba(148, 163, 184, 0.15)",
                      color: "var(--store-page-muted, #94a3b8)",
                    }}
                  >
                    <Info className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h3
                      className="text-base sm:text-lg font-bold"
                      style={{ color: "var(--store-page-heading, #ffffff)" }}
                    >
                      Policy Details Unpublished
                    </h3>
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: "var(--store-page-muted, #94a3b8)" }}
                    >
                      The store owner has not yet published points for this policy. Please check back
                      later or contact store support for assistance.
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-center gap-3">
                    <Link
                      href={shopLink}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95"
                      style={{
                        backgroundColor: "var(--store-button-bg, #22c55e)",
                        color: "var(--store-button-text, #ffffff)",
                        borderRadius: "var(--store-button-radius, 8px)",
                      }}
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      href={contactLink}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90 active:scale-95"
                      style={{
                        borderColor: "var(--store-border, rgba(255, 255, 255, 0.15))",
                        backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.6))",
                        color: "var(--store-page-text, #ffffff)",
                        borderRadius: "var(--store-button-radius, 8px)",
                      }}
                    >
                      Contact Store
                    </Link>
                  </div>
                </div>
              )}
            </section>
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
