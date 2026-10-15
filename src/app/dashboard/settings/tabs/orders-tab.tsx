"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Banknote, CreditCard, MessageCircle } from "lucide-react";

interface OrdersTabProps {
  ordersEnabled: boolean;
  setOrdersEnabled: (val: boolean) => void;
  codEnabled: boolean;
  setCodEnabled: (val: boolean) => void;
  onlinePaymentEnabled: boolean;
  setOnlinePaymentEnabled: (val: boolean) => void;
  whatsappOrderEnabled: boolean;
  setWhatsappOrderEnabled: (val: boolean) => void;
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
}: OrdersTabProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Checkout &amp; Order Channels</h2>
            <p className="text-xs text-slate-400">
              Enable or disable the ordering methods available to customers on your storefront.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-slate-300">Store Ordering:</span>
            <input
              type="checkbox"
              checked={ordersEnabled}
              onChange={(e) => setOrdersEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-xs font-bold ${ordersEnabled ? "text-emerald-400" : "text-rose-400"}`}>
              {ordersEnabled ? "OPEN" : "PAUSED"}
            </span>
          </label>
        </div>

        <div className="space-y-4">
          {/* Method 1: COD */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-400">
                  Allow customers to place orders online and pay cash directly upon delivery.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
            />
          </div>

          {/* Method 2: Online Payment */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Online Payment (Razorpay)</h4>
                <p className="text-xs text-slate-400">
                  Accept instant UPI, credit/debit cards, and NetBanking payments securely.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={onlinePaymentEnabled}
              onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
            />
          </div>

          {/* Method 3: WhatsApp Ordering */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp Direct Order</h4>
                <p className="text-xs text-slate-400">
                  Saves order in database and opens WhatsApp with a pre-filled summary to complete with customer.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappOrderEnabled}
              onChange={(e) => setWhatsappOrderEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
