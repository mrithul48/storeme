import React from "react";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { LoginForm } from "./login-form";
import { getStoreLink } from "@/lib/store-url";

type LoginPageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
};

export async function generateMetadata({ params }: LoginPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `Sign In — ${store.name}`,
    description: `Sign in to your customer account at ${store.name}.`,
  };
}

export default async function CustomerLoginPage({ params, searchParams }: LoginPageProps) {
  const { storeSlug } = await params;
  const { error, registered } = await searchParams;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  // If already logged in, redirect to account dashboard
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
                  Welcome Back
                </h1>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--store-page-muted, #94a3b8)" }}
                >
                  Sign in to your customer account at {store.name}
                </p>
              </div>

              {registered && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 text-center font-medium">
                  Account created successfully! You can now log in.
                </div>
              )}

              {error === "oauth_failed" && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 text-center font-medium">
                  Google sign-in was cancelled or failed. Please try again.
                </div>
              )}

              <LoginForm
                storeSlug={storeSlug}
                googleEnabled={googleEnabled}
              />
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
