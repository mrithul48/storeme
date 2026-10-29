"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Banknote, CreditCard, MessageCircle } from "lucide-react";
import { ShippingChargeSection } from "./shipping-charge-section";
import type { ShippingWeightTier } from "@/lib/shipping-calculator";

interface OrdersTabProps {
  ordersEnabled: boolean;
  setOrdersEnabled: (val: boolean) => void;
  codEnabled: boolean;
  setCodEnabled: (val: boolean) => void;
  onlinePaymentEnabled: boolean;
  setOnlinePaymentEnabled: (val: boolean) => void;
  whatsappOrderEnabled: boolean;
  setWhatsappOrderEnabled: (val: boolean) => void;

  // Shipping props
  shippingType: string | null;
  setShippingType: (val: string | null) => void;
  shippingFixedCharge: string;
  setShippingFixedCharge: (val: string) => void;
  shippingMinOrderAmount: string;
  setShippingMinOrderAmount: (val: string) => void;
  shippingFallbackCharge: string;
  setShippingFallbackCharge: (val: string) => void;
  shippingDefaultWeight: string;
  setShippingDefaultWeight: (val: string) => void;
  shippingWeightRates: ShippingWeightTier[];
  setShippingWeightRates: React.Dispatch<React.SetStateAction<ShippingWeightTier[]>>;
}

export function OrdersTab({
  ordersEnabled,
  setOrdersEnabled,
  codEnabled,
  setCodEnabled,
  onlinePaymentEnabled,
  setOnlinePaymentEnabled,
  whatsappOrderEnabled,
  setWhatsappOrderEnabled,
  shippingType,
  setShippingType,
  shippingFixedCharge,
  setShippingFixedCharge,
  shippingMinOrderAmount,
  setShippingMinOrderAmount,
  shippingFallbackCharge,
  setShippingFallbackCharge,
  shippingDefaultWeight,
  setShippingDefaultWeight,
  shippingWeightRates,
  setShippingWeightRates,
}: OrdersTabProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6 bg-transparent sm:bg-white border-0 sm:border sm:border-slate-200/90 shadow-none sm:shadow-sm p-0 sm:p-6 rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/90 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Checkout & Order Channels</h2>
            <p className="text-xs text-[#64748B]">
              Enable or disable the ordering methods available to customers on your storefront.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-[#0F172A]">Store Ordering:</span>
            <input
              type="checkbox"
              checked={ordersEnabled}
              onChange={(e) => setOrdersEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className={`text-xs font-bold ${ordersEnabled ? "text-emerald-600" : "text-rose-600"}`}>
              {ordersEnabled ? "OPEN" : "PAUSED"}
            </span>
          </label>
        </div>

        <div className="space-y-4">
          {/* Method 1: COD */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Cash on Delivery (COD)</h4>
                <p className="text-xs text-[#64748B]">
                  Allow customers to place orders online and pay cash directly upon delivery.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-[#2563EB] focus:ring-[#2563EB] mt-1 cursor-pointer"
            />
          </div>

          {/* Method 2: Online Payment */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Online Payment (Razorpay)</h4>
                <p className="text-xs text-[#64748B]">
                  Accept instant UPI, credit/debit cards, and NetBanking payments securely.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={onlinePaymentEnabled}
              onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-[#2563EB] focus:ring-[#2563EB] mt-1 cursor-pointer"
            />
          </div>

          {/* Method 3: WhatsApp Ordering */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">WhatsApp Direct Order</h4>
                <p className="text-xs text-[#64748B]">
                  Saves order in database and opens WhatsApp with a pre-filled summary to complete with customer.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappOrderEnabled}
              onChange={(e) => setWhatsappOrderEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-[#2563EB] focus:ring-[#2563EB] mt-1 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Shipping Charge Section */}
      <ShippingChargeSection
        shippingType={shippingType}
        setShippingType={setShippingType}
        shippingFixedCharge={shippingFixedCharge}
        setShippingFixedCharge={setShippingFixedCharge}
        shippingMinOrderAmount={shippingMinOrderAmount}
        setShippingMinOrderAmount={setShippingMinOrderAmount}
        shippingFallbackCharge={shippingFallbackCharge}
        setShippingFallbackCharge={setShippingFallbackCharge}
        shippingDefaultWeight={shippingDefaultWeight}
        setShippingDefaultWeight={setShippingDefaultWeight}
        shippingWeightRates={shippingWeightRates}
        setShippingWeightRates={setShippingWeightRates}
      />
    </div>
  );
}
