import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
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

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      storeId: store.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      customer: true,
      payment: true,
    },
  });

  if (!order) notFound();

  // Serialize Prisma Decimal and Date objects into plain JSON primitives
  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCharge: order.shippingCharge ? Number(order.shippingCharge) : 0,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
    payment: order.payment
      ? {
          ...order.payment,
          amount: Number(order.payment.amount),
          createdAt: order.payment.createdAt.toISOString(),
          updatedAt: order.payment.updatedAt.toISOString(),
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

          <WishlistDrawer storeSlug={store.slug} />
          <StoreFooter store={store as any} />
        </StoreThemeWrapper>
      </WishlistProvider>
    </CartProvider>
  );
}
