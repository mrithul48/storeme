import React from "react";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";

type ContactPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: ContactPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Not Found" };
  return {
    title: `Contact Us — ${store.name}`,
    description: `Get in touch with ${store.name}.`,
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ContactPage({ params }: ContactPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const hp = store.homePage as Record<string, unknown> | null;
  const whatsappEnabled = (hp?.whatsappEnabled as boolean) ?? false;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const headerDeliveryInfo = hp?.headerDeliveryInfo as string | null | undefined;
  const showAccountIcon = (hp?.showAccountIcon as boolean) ?? true;

  const company = store.company;

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

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <h1
                className="text-3xl md:text-5xl font-extrabold tracking-tight"
                style={{ color: "var(--store-page-heading, #ffffff)" }}
              >
                Contact Us
              </h1>
              <p
                className="mt-3 text-sm max-w-xl mx-auto"
                style={{ color: "var(--store-page-muted, #94a3b8)" }}
              >
                Have a question or need assistance? Send us a message and our team will get back to you shortly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* ── Contact Info ──────────────────────────────────────────── */}
              <div className="space-y-6">
                <div
                  className="p-6 rounded-2xl border space-y-4 shadow-sm"
                  style={{
                    backgroundColor: "var(--store-surface, #0f172a)",
                    borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                  }}
                >
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--store-page-heading, #ffffff)" }}
                  >
                    Contact Details
                  </h2>

                  {company?.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-3 text-sm hover:underline transition-colors"
                      style={{ color: "var(--store-page-text, #f8fafc)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}
                      >
                        <Mail className="w-4 h-4" />
                      </div>
                      {company.email}
                    </a>
                  )}

                  {company?.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="flex items-center gap-3 text-sm hover:underline transition-colors"
                      style={{ color: "var(--store-page-text, #f8fafc)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}
                      >
                        <Phone className="w-4 h-4" />
                      </div>
                      {company.phone}
                    </a>
                  )}

                  {company?.address && (
                    <div
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--store-page-text, #f8fafc)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="whitespace-pre-line">{company.address}</span>
                    </div>
                  )}
                </div>

                {/* Working hours */}
                {store.workingHours && store.workingHours.length > 0 && (
                  <div
                    className="p-6 rounded-2xl border space-y-4 shadow-sm"
                    style={{
                      backgroundColor: "var(--store-surface, #0f172a)",
                      borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: "var(--store-primary, #3b82f6)" }} />
                      <h2
                        className="text-base font-bold"
                        style={{ color: "var(--store-page-heading, #ffffff)" }}
                      >
                        Business Hours
                      </h2>
                    </div>

                    <div className="space-y-2">
                      {store.workingHours.map((wh) => (
                        <div
                          key={wh.dayOfWeek}
                          className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                          style={{ borderColor: "var(--store-border)" }}
                        >
                          <span style={{ color: "var(--store-page-muted, #94a3b8)" }}>
                            {DAY_NAMES[wh.dayOfWeek]}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "var(--store-page-text, #f8fafc)" }}
                          >
                            {wh.isOpen
                              ? `${wh.openTime || "09:00"} – ${wh.closeTime || "18:00"}`
                              : "Closed"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Enquiry Form ──────────────────────────────────────────── */}
              <div
                className="p-8 rounded-2xl border shadow-xl"
                style={{
                  backgroundColor: "var(--store-surface, #0f172a)",
                  borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                }}
              >
                <h2
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  Send us a Message
                </h2>
                <p
                  className="text-xs mb-6"
                  style={{ color: "var(--store-page-muted, #94a3b8)" }}
                >
                  Fill out the form below and we will get back to you as soon as possible.
                </p>

                <ContactForm storeSlug={storeSlug} themeColor={store.theme?.primaryColor || "#3b82f6"} />
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
