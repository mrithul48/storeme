import React from "react";
import { notFound, redirect } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { RegisterForm } from "./register-form";
import { getStoreLink } from "@/lib/store-url";

type RegisterPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: RegisterPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `Create Account — ${store.name}`,
    description: `Register for a customer account at ${store.name}.`,
  };
}

export default async function CustomerRegisterPage({ params }: RegisterPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const currentCustomer = await getCurrentCustomer(store.id);
  if (currentCustomer) {
    redirect(getStoreLink(storeSlug, "/account"));
  }

  const googleEnabled = Boolean(
    store.authConfig?.googleEnabled && store.authConfig?.googleClientId
  );

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          <StoreHeader
            store={store}
            showAccountIcon={(store.homePage as { showAccountIcon?: boolean })?.showAccountIcon !== false}
          />

          <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div
              className="w-full max-w-md p-8 rounded-2xl border shadow-xl transition-all"
              style={{
                backgroundColor: "var(--store-surface, #0f172a)",
                borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                color: "var(--store-page-text, #f8fafc)",
              }}
            >
              <div className="text-center mb-8">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  Create Account
                </h1>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--store-page-muted, #94a3b8)" }}
                >
                  Join {store.name} to track orders and save favorites
                </p>
              </div>

              <RegisterForm storeSlug={storeSlug} googleEnabled={googleEnabled} />
            </div>
          </main>

          <CartDrawer storeSlug={store.slug} />
          <WishlistDrawer storeSlug={store.slug} />
          <StoreFooter store={store as Parameters<typeof StoreFooter>[0]["store"]} />
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}
