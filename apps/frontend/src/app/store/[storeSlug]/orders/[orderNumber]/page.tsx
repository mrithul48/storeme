import React from "react";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/services/store.service";
import { getStorefrontOrder } from "@/services/order.service";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StorefrontDrawers } from "@/components/storefront/storefront-drawers";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { OrderConfirmationClient } from "./order-confirmation-client";

type OrderPageProps = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

export async function generateMetadata({ params }: OrderPageProps) {
  const { storeSlug, orderNumber } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Order Not Found" };

  return {
    title: `Order #${orderNumber} Confirmed — ${store.name}`,
    description: `Thank you for your order at ${store.name}`,
  };
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { storeSlug, orderNumber } = await params;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const showAccountIcon = (store as any).homePage?.showAccountIcon ?? true;

  const order = await getStorefrontOrder(orderNumber, storeSlug, store.id);
  if (!order) notFound();

  // Serialize into plain JSON primitives
  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCharge: order.shippingCharge ? Number(order.shippingCharge) : 0,
    total: Number(order.total),
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
    items: (order.items || []).map((item: any) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
    customer: order.customer ?? null,
    payment: order.payment
      ? {
          ...order.payment,
          amount: Number(order.payment.amount),
          createdAt: new Date(order.payment.createdAt).toISOString(),
          updatedAt: new Date(order.payment.updatedAt).toISOString(),
        }
      : null,
  };

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme} className="min-h-screen flex flex-col bg-slate-50/60">
          <StoreHeader store={store} showAccountIcon={showAccountIcon} />

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <OrderConfirmationClient order={serializedOrder as any} store={store as any} />
          </main>

          <StorefrontDrawers storeSlug={store.slug} />
          <StoreFooter store={store as any} />
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}
