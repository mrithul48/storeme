"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PackageCheck,
  MapPin,
  Receipt,
  ShoppingBag,
  ArrowRight,
  Copy,
  Check,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface OrderConfirmationClientProps {
  order: {
    id: string;
    orderNumber: string;
    createdAt: Date | string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    subtotal: any;
    total: any;
    notes?: string | null;
    shippingAddress?: any;
    customer: {
      name: string;
      email: string;
      phone?: string | null;
    };
    items: Array<{
      id: string;
      productName: string;
      productSku?: string | null;
      variantColor?: string | null;
      price: any;
      quantity: number;
      subtotal: any;
      product?: {
        images?: Array<{ url: string }>;
      } | null;
    }>;
  };
  store: {
    id: string;
    name: string;
    slug: string;
    theme?: any;
  };
}

export function OrderConfirmationClient({ order, store }: OrderConfirmationClientProps) {
  const [copied, setCopied] = useState(false);

  const shippingAddress = order.shippingAddress as Record<string, string> | null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusVariant =
    order.status === "DELIVERED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : order.status === "CONFIRMED"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : order.status === "CANCELLED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 sm:py-10">
      {/* ── Popup-Styled Elevated Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/90 overflow-hidden relative"
      >
        {/* Top celebratory gradient accent */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

        {/* ── Section 1: Animated Header Celebration ── */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-100 relative bg-gradient-to-b from-emerald-50/40 via-white to-white">
          {/* Animated pulsing rings behind checkmark */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400/25"
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/20"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.5, 0.1, 0.5],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Checkmark circle */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: 0.1,
              }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.35,
                    ease: "easeOut",
                  }}
                />
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-1.5"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Thank you for shopping with us. A confirmation has been sent to{" "}
              <span className="font-semibold text-slate-800">{order.customer.email}</span>.
            </p>
          </motion.div>

          {/* Order ID & Status Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-1"
          >
            <button
              onClick={handleCopyOrderNumber}
              title="Click to copy order number"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-mono font-bold text-slate-800 transition-all active:scale-95"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>#{order.orderNumber}</span>
              {copied ? (
                <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-sans font-semibold">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                <Copy className="w-3 h-3 text-slate-400 ml-0.5" />
              )}
            </button>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusVariant}`}
            >
              {order.status}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 px-2 py-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDateTime(order.createdAt)}
            </span>
          </motion.div>
        </div>

        {/* ── Section 2: Items Ordered ── */}
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              Items Ordered ({order.items.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            {order.items.map((item) => {
              const imgUrl = item.product?.images?.[0]?.url;
              return (
                <div key={item.id} className="p-3.5 sm:p-4 flex items-center gap-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex-shrink-0">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        <ShoppingBag className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.productName}
                    </p>
                    {item.variantColor && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Color: {item.variantColor}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatCurrency(Number(item.price))} × {item.quantity}
                    </p>
                  </div>

                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 whitespace-nowrap">
                    {formatCurrency(Number(item.subtotal))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Summary Receipt & Delivery Info ── */}
        <div className="px-5 sm:px-7 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Receipt Breakdown Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5 text-xs text-slate-600">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Payment Summary
            </h3>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(Number(order.subtotal))}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {Number((order as any).shippingCharge || 0) > 0 ? (
                <span className="font-semibold text-slate-900">
                  {formatCurrency(Number((order as any).shippingCharge))}
                </span>
              ) : (
                <span className="font-bold text-emerald-600">FREE</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span>Payment Method</span>
              <span className="font-mono text-[11px] font-semibold uppercase text-slate-800">
                {order.paymentMethod === "RAZORPAY"
                  ? "Online (Razorpay)"
                  : order.paymentMethod === "WHATSAPP"
                  ? "WhatsApp Order"
                  : "Cash on Delivery"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Payment Status</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
              <span>Total Amount</span>
              <span
                className="text-base sm:text-lg font-black"
                style={{ color: "var(--store-primary, #0f172a)" }}
              >
                {formatCurrency(Number(order.total))}
              </span>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-xs text-slate-600 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Delivery Details
              </h3>

              <div className="pt-2 space-y-1">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{order.customer.name}</p>
                <p className="text-slate-600">{order.customer.email}</p>
                {order.customer.phone && <p className="text-slate-600">{order.customer.phone}</p>}

                {shippingAddress && (
                  <div className="pt-1.5 text-slate-700">
                    <p className="font-medium">{shippingAddress.address}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div className="pt-1.5 text-[11px] text-slate-500 italic">
                    Note: "{order.notes}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[11px] text-slate-500">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard Delivery within 3-5 days</span>
            </div>
          </div>
        </div>

        {/* ── Section 4: Bottom Action (Continue Shopping) ── */}
        <div className="p-5 sm:p-7 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/store/${store.slug}`}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors order-2 sm:order-1"
          >
            ← Back to Store Home
          </Link>

          <Link
            href={`/store/${store.slug}/shop`}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <button
              type="button"
              className="w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--store-button-bg, #22c55e)",
                color: "var(--store-button-text, #ffffff)",
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
