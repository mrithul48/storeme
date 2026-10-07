import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WishlistDrawer } from "@/components/storefront/wishlist-drawer";
import { StoreThemeWrapper } from "@/components/storefront/store-theme-wrapper";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, User, ShoppingBag, ArrowRight } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { getStoreLink } from "@/lib/store-url";
import { Prisma, OrderItem } from "@prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      take: 3;
    };
  };
}>;

type AccountPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: AccountPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) return { title: "Store Not Found" };
  return {
    title: `My Account — ${store.name}`,
    description: `Manage your orders and account at ${store.name}.`,
  };
}

export default async function CustomerAccountPage({ params }: AccountPageProps) {
  const { storeSlug } = await params;
  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

  const customer = await getCurrentCustomer(store.id);
  if (!customer) {
    redirect(getStoreLink(storeSlug, "/account/login"));
  }

  // Fetch tenant-scoped customer orders
  const orders = await prisma.order.findMany({
    where: {
      customerId: customer.id,
      storeId: store.id,
    },
    include: {
      items: {
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    REFUNDED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <CartProvider storeSlug={store.slug}>
      <WishlistProvider storeSlug={store.slug}>
        <StoreThemeWrapper theme={store.theme}>
          <StoreHeader
            store={store}
            showAccountIcon={(store.homePage as { showAccountIcon?: boolean })?.showAccountIcon !== false}
          />

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header with Customer Info & Logout */}
            <div
              className="p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
              style={{
                backgroundColor: "var(--store-surface, #0f172a)",
                borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                color: "var(--store-page-text, #f8fafc)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                  }}
                >
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h1
                    className="text-xl font-bold tracking-tight"
                    style={{ color: "var(--store-page-heading, #ffffff)" }}
                  >
                    {customer.name}
                  </h1>
                  <p
                    className="text-xs"
                    style={{ color: "var(--store-page-muted, #94a3b8)" }}
                  >
                    {customer.email}
                    {customer.username && ` · @${customer.username}`}
                    {customer.phone && ` · ${customer.phone}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={getStoreLink(storeSlug, "/shop")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-slate-800/40"
                  style={{
                    borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                    color: "var(--store-page-text, #f8fafc)",
                  }}
                >
                  Continue Shopping
                </Link>
                <LogoutButton storeSlug={storeSlug} />
              </div>
            </div>

            {/* Orders Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-bold flex items-center gap-2"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  <Package className="w-5 h-5 text-blue-400" />
                  Order History ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center p-12 rounded-2xl border text-center space-y-3"
                  style={{
                    backgroundColor: "var(--store-surface, #0f172a)",
                    borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-6 h-6 stroke-1" />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm"
                      style={{ color: "var(--store-page-heading, #ffffff)" }}
                    >
                      No orders yet
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--store-page-muted, #94a3b8)" }}
                    >
                      Browse our catalog and make your first purchase!
                    </p>
                  </div>
                  
                  <Link
                    href={getStoreLink(storeSlug, "/shop")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                    style={{
                      backgroundColor: "var(--store-button-bg, #22c55e)",
                      color: "var(--store-button-text, #ffffff)",
                    }}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: OrderWithItems) => {
                    const statusClass =
                      STATUS_COLORS[order.status] ??
                      "bg-slate-500/10 text-slate-400 border-slate-500/20";
                    const orderUrl = getStoreLink(storeSlug, `/orders/${order.orderNumber}`);

                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border transition-all hover:border-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        style={{
                          backgroundColor: "var(--store-surface, #0f172a)",
                          borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                        }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="font-mono text-sm font-bold"
                              style={{ color: "var(--store-page-text, #ffffff)" }}
                            >
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${statusClass}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p
                            className="text-xs"
                            style={{ color: "var(--store-page-muted, #94a3b8)" }}
                          >
                            Placed on {formatDate(order.createdAt)} · {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                          <div
                            className="text-xs"
                            style={{ color: "var(--store-page-muted, #94a3b8)" }}
                          >
                            {order.items.map((i: OrderItem) => i.productName).join(", ")}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                          <div className="text-right">
                            <span
                              className="text-base font-bold block"
                              style={{ color: "var(--store-page-text, #ffffff)" }}
                            >
                              {formatCurrency(Number(order.total))}
                            </span>
                            <span
                              className="text-[11px] uppercase tracking-wider"
                              style={{ color: "var(--store-page-muted, #94a3b8)" }}
                            >
                              {order.paymentMethod || "COD"}
                            </span>
                          </div>

                          <Link
                            href={orderUrl}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-slate-800/40"
                            style={{
                              borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                              color: "var(--store-primary, #3b82f6)",
                            }}
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
