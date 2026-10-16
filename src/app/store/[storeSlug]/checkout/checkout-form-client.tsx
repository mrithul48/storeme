"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, ArrowRight, CreditCard, Banknote, ShieldCheck, AlertCircle, MessageCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutFormClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
    settings?: {
      ordersEnabled?: boolean;
      codEnabled?: boolean;
      onlinePaymentEnabled?: boolean;
      whatsappOrderEnabled?: boolean;
    } | null;
    company?: {
      whatsapp?: string | null;
      phone?: string | null;
    } | null;
    merchantPaymentConfig?: { isActive: boolean }[];
  };
}

export function CheckoutFormClient({ store }: CheckoutFormClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codEnabled = store.settings?.codEnabled !== false;
  // Online payment is only functional if the merchant has a connected Razorpay account
  const merchantRazorpayConnected = (store.merchantPaymentConfig ?? []).some((c) => c.isActive);
  const onlineEnabled = store.settings?.onlinePaymentEnabled !== false && merchantRazorpayConnected;
  const whatsappEnabled = Boolean(store.settings?.whatsappOrderEnabled);

  const defaultMethod: "COD" | "RAZORPAY" | "WHATSAPP" = codEnabled
    ? "COD"
    : onlineEnabled
    ? "RAZORPAY"
    : whatsappEnabled
    ? "WHATSAPP"
    : "COD";

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY" | "WHATSAPP">(defaultMethod);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!codEnabled && !onlineEnabled && !whatsappEnabled) {
      setError("Orders are currently unavailable for this store.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/stores/${store.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            variantId: i.variantId,
            variantColor: i.variantColor,
          })),
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      const orderNumber = data.order.orderNumber;
      const orderId = data.order.id;

      // WhatsApp Order flow: Order is created in DB, now redirect to WhatsApp
      if (paymentMethod === "WHATSAPP" && data.whatsappUrl) {
        clearCart();
        if (typeof window !== "undefined") {
          window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        }
        router.push(`/store/${store.slug}/orders/${orderNumber}`);
        return;
      }

      // Handle Razorpay Online Payment
      if (paymentMethod === "RAZORPAY" && data.razorpayOrder) {
        if (!window.Razorpay) {
          throw new Error("Payment gateway SDK is loading. Please try again in a moment.");
        }

        const options = {
          key: data.razorpayOrder.keyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: store.name,
          description: `Order #${orderNumber}`,
          order_id: data.razorpayOrder.id,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#3b82f6",
          },
          handler: async function (response: any) {
            try {
              // Verify payment on server
              const verifyRes = await fetch(`/api/stores/${store.slug}/checkout/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                router.push(`/store/${store.slug}/orders/${orderNumber}`);
              } else {
                setError("Payment verification failed. Please contact store support.");
              }
            } catch (err) {
              console.error("Payment verification error:", err);
              router.push(`/store/${store.slug}/orders/${orderNumber}`);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              router.push(`/store/${store.slug}/orders/${orderNumber}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // COD Success
      clearCart();
      router.push(`/store/${store.slug}/orders/${orderNumber}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred during checkout.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">
          Add some products before proceeding to checkout.
        </p>
        <Link href={`/store/${store.slug}`}>
          <Button
            variant="primary"
            style={{
              backgroundColor: "var(--store-button-bg, #22c55e)",
              color: "var(--store-button-text, #ffffff)",
              borderRadius: "var(--store-button-radius, 10px)",
            }}
          >
            Browse Store
          </Button>
        </Link>
      </div>
    );
  }

  const inputClasses =
    "w-full h-11 px-3.5 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";
  const inputStyle: React.CSSProperties = {
    border: "1px solid #000000",
    backgroundColor: "transparent",
    borderRadius: "var(--store-input-radius, 10px)",
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={`/store/${store.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
        Checkout
      </h1>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Customer Information & Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Contact Information */}
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
            style={{ borderRadius: "var(--store-image-radius, 16px)" }}
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: "var(--store-primary, #3b82f6)" }}
              >
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">Full Name *</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">Phone Number *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClasses}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Card 2: Delivery Address */}
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
            style={{ borderRadius: "var(--store-image-radius, 16px)" }}
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: "var(--store-primary, #3b82f6)" }}
              >
                2
              </span>
              Delivery Address
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">Street Address *</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
                className={inputClasses}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">City *</label>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">State *</label>
                <input
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">Postal Code *</label>
                <input
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-800">Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Enter order notes (optional)"
                className="w-full p-3.5 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-y"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Card 3: Payment Method Selection */}
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
            style={{ borderRadius: "var(--store-image-radius, 16px)" }}
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: "var(--store-primary, #3b82f6)" }}
              >
                3
              </span>
              Choose Order & Payment Method
            </h2>

            {!codEnabled && !onlineEnabled && !whatsappEnabled ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-medium">
                No payment or order methods are currently enabled for this store. Please contact the seller.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {codEnabled && (
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-blue-600 bg-blue-50/70 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                    style={{
                      borderRadius: "var(--store-input-radius, 10px)",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">Cash on Delivery</h4>
                      <p className="text-[11px] text-slate-500">Pay when your order arrives</p>
                    </div>
                  </label>
                )}

                {onlineEnabled && (
                  <label
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === "RAZORPAY"
                        ? "border-blue-600 bg-blue-50/70 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                    style={{
                      borderRadius: "var(--store-input-radius, 10px)",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">Pay Online</h4>
                      <p className="text-[11px] text-slate-500">UPI, Cards, NetBanking (Razorpay)</p>
                    </div>
                  </label>
                )}

                {whatsappEnabled && (
                  <label
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === "WHATSAPP"
                        ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                    style={{
                      borderRadius: "var(--store-input-radius, 10px)",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "WHATSAPP"}
                      onChange={() => setPaymentMethod("WHATSAPP")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">WhatsApp Order</h4>
                      <p className="text-[11px] text-slate-500">Creates order and sends details via WhatsApp</p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 sticky top-24"
            style={{ borderRadius: "var(--store-image-radius, 16px)" }}
          >
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({items.length} items)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => {
                const activePrice =
                  item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
                    ? item.salePrice
                    : item.price;
                return (
                  <div key={item.productId} className="flex gap-3 text-xs items-center pt-2.5 first:pt-0">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          -
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      {item.variantColor && (
                        <p className="text-[11px] text-slate-500 font-medium">Color: {item.variantColor}</p>
                      )}
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(activePrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg font-extrabold" style={{ color: "var(--store-primary, #3b82f6)" }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={!codEnabled && !onlineEnabled && !whatsappEnabled}
              className="w-full mt-3 shadow-sm font-bold text-sm h-12"
              style={{
                backgroundColor: "var(--store-button-bg, #22c55e)",
                color: "var(--store-button-text, #ffffff)",
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              {paymentMethod === "RAZORPAY"
                ? `Pay ${formatCurrency(subtotal)} Online`
                : paymentMethod === "WHATSAPP"
                ? `Order via WhatsApp (${formatCurrency(subtotal)})`
                : `Place COD Order (${formatCurrency(subtotal)})`}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit SSL encrypted secure checkout</span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Navbar: Left side Price, Right side Proceed Button */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] lg:hidden"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
          }}
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {/* Left side: Price & items summary */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Total Amount
              </span>
              <span
                className="text-base sm:text-lg font-black leading-tight"
                style={{ color: "var(--store-primary, #0f172a)" }}
              >
                {formatCurrency(subtotal)}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                FREE Delivery • {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Right side: Proceed / Place Order Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={!codEnabled && !onlineEnabled && !whatsappEnabled}
              className="px-5 py-2.5 h-11 shadow-md font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 flex-1 max-w-[200px]"
              style={{
                backgroundColor: "var(--store-button-bg, #22c55e)",
                color: "var(--store-button-text, #ffffff)",
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              <span>
                {paymentMethod === "RAZORPAY"
                  ? "Pay Online"
                  : paymentMethod === "WHATSAPP"
                  ? "Order WhatsApp"
                  : "Place Order"}
              </span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
