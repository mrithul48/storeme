"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, CreditCard, Banknote, ShieldCheck, AlertCircle, MessageCircle } from "lucide-react";

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
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
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
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-sm text-slate-400">
          Add some products before proceeding to checkout.
        </p>
        <Link href={`/store/${store.slug}`}>
          <Button variant="primary">Browse Store</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/store/${store.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Checkout
      </h1>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Information & Address */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <Input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                <Input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
              <Input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Delivery Address
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Street Address *</label>
              <Input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat / Street / Landmark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">City *</label>
                <Input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">State *</label>
                <Input
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Postal Code *</label>
                <Input
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="PIN / Zip Code"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300">Order Notes (Optional)</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Special delivery instructions or notes for the seller..."
              />
            </div>
          </Card>

          {/* Payment Method Selection */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                3
              </span>
              Choose Order & Payment Method
            </h2>

            {!codEnabled && !onlineEnabled && !whatsappEnabled ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                No payment or order methods are currently enabled for this store. Please contact the seller.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {codEnabled && (
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Cash on Delivery</h4>
                      <p className="text-xs text-slate-400">Pay when your order arrives</p>
                    </div>
                  </label>
                )}

                {onlineEnabled && (
                  <label
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "RAZORPAY"
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Pay Online</h4>
                      <p className="text-xs text-slate-400">UPI, Cards, NetBanking (Razorpay)</p>
                    </div>
                  </label>
                )}

                {whatsappEnabled && (
                  <label
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "WHATSAPP"
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "WHATSAPP"}
                      onChange={() => setPaymentMethod("WHATSAPP")}
                      className="hidden"
                    />
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">WhatsApp Order</h4>
                      <p className="text-xs text-slate-400">Creates order and sends details via WhatsApp</p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3">
              Order Summary ({items.length} items)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const activePrice =
                  item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
                    ? item.salePrice
                    : item.price;
                return (
                  <div key={item.productId} className="flex gap-3 text-xs items-center">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          -
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-white">
                      {formatCurrency(activePrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Total Amount</span>
                <span className="text-blue-400 text-lg">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={!codEnabled && !onlineEnabled && !whatsappEnabled}
              className="w-full mt-4"
            >
              {paymentMethod === "RAZORPAY"
                ? `Pay ${formatCurrency(subtotal)} Online`
                : paymentMethod === "WHATSAPP"
                ? `Order via WhatsApp (${formatCurrency(subtotal)})`
                : `Place COD Order (${formatCurrency(subtotal)})`}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit SSL encrypted secure checkout</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
