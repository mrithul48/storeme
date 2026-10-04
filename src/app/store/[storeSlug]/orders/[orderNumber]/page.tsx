import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import { formatCurrency, formatDateTime, buildWhatsAppUrl } from "@/lib/utils";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CartProvider } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, ArrowLeft, PackageCheck, MapPin, Receipt } from "lucide-react";

type OrderPageProps = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { storeSlug, orderNumber } = await params;

  const store = await getStorefrontConfig(storeSlug);
  if (!store) notFound();

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

  const whatsappNumber = store.company?.whatsapp || store.company?.phone;
  const shippingAddress = order.shippingAddress as Record<string, string> | null;

  const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    DELIVERED: "success",
    CONFIRMED: "info",
    PROCESSING: "warning",
    SHIPPED: "info",
    PENDING: "warning",
    CANCELLED: "danger",
  };

  return (
    <CartProvider storeSlug={store.slug}>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <StoreHeader store={store} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Back link */}
          <Link
            href={`/store/${store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>

          {/* Success Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank you for your order!
              </h1>
              <p className="text-sm text-slate-400">
                Your order has been placed successfully. A confirmation has been recorded.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-sm text-blue-400 font-semibold">
              <Receipt className="w-4 h-4" />
              <span>Order #{order.orderNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2 space-y-6">
              <Card className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-blue-400" />
                    Items Ordered ({order.items.length})
                  </h3>
                  <Badge variant={statusVariantMap[order.status] || "neutral"}>
                    {order.status}
                  </Badge>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {order.items.map((item) => {
                    const imgUrl = item.product?.images?.[0]?.url;
                    return (
                      <div key={item.id} className="py-3 flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                              -
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatCurrency(Number(item.price))} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {formatCurrency(Number(item.subtotal))}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200">{formatCurrency(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method</span>
                    <span className="text-slate-200 uppercase font-mono">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Status</span>
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                    <span>Total Paid / Due</span>
                    <span className="text-blue-400 text-xl">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Customer & Shipping Details */}
            <div className="space-y-6">
              <Card className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Delivery Details
                </h3>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white text-sm">{order.customer.name}</p>
                  <p className="text-slate-400">{order.customer.email}</p>
                  {order.customer.phone && <p className="text-slate-400">{order.customer.phone}</p>}

                  {shippingAddress && (
                    <div className="pt-3 border-t border-slate-800 text-slate-400 space-y-1">
                      <p className="text-slate-200 font-medium">{shippingAddress.address}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                      </p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="pt-3 border-t border-slate-800 text-slate-400">
                      <p className="font-semibold text-slate-300 mb-1">Customer Note:</p>
                      <p className="italic">"{order.notes}"</p>
                    </div>
                  )}

                  <p className="pt-3 text-[11px] text-slate-500 border-t border-slate-800">
                    Ordered on {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </Card>

              {/* WhatsApp Support CTA */}
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(
                    whatsappNumber,
                    `Hello ${store.name}! I have a question regarding my Order #${order.orderNumber}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/25 flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Track / Inquire on WhatsApp
                </a>
              )}
            </div>
          </div>
        </main>

        <StoreFooter store={store as any} />
      </div>
    </CartProvider>
  );
}
