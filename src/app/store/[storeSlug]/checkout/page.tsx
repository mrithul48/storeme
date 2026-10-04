import React from "react";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getStorefrontConfig } from "@/services/store.service";
import { CartProvider } from "@/context/cart-context";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CheckoutFormClient } from "./checkout-form-client";

type CheckoutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };

  return {
    title: `Checkout — ${store.name}`,
    description: `Complete your purchase at ${store.name}`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);

  if (!store) notFound();

  return (
    <CartProvider storeSlug={store.slug}>
      {/* Razorpay Standard Checkout SDK */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <StoreHeader store={store} />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <CheckoutFormClient store={store} />
        </main>

        <StoreFooter store={store} />
      </div>
    </CartProvider>
  );
}
