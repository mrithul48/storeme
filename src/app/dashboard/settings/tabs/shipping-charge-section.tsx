"use client";

import React from "react";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Gift,
  Scale,
  Ban,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import type { ShippingWeightTier } from "@/lib/shipping-calculator";

interface ShippingChargeSectionProps {
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

export function ShippingChargeSection({
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
}: ShippingChargeSectionProps) {
  const handleAddTier = () => {
    const nextMin =
      shippingWeightRates.length > 0
        ? Number(shippingWeightRates[shippingWeightRates.length - 1].maxWeight || 0)
        : 0;
    const newTier: ShippingWeightTier = {
      id: "tier-" + Date.now(),
      minWeight: nextMin,
      maxWeight: nextMin + 1,
      charge: 50,
    };
    setShippingWeightRates([...shippingWeightRates, newTier]);
  };

  const handleUpdateTier = (index: number, field: keyof ShippingWeightTier, val: number) => {
    setShippingWeightRates((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: Math.max(0, val) };
      return copy;
    });
  };

  const handleRemoveTier = (index: number) => {
    setShippingWeightRates((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="space-y-6 bg-white border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200/90 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#0F172A]">Shipping Charge Configuration</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Choose how shipping fees are calculated for your store orders. Only one shipping charge method can be active at a time.
          </p>
        </div>
        {shippingType && shippingType !== "NONE" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 self-start sm:self-auto shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {shippingType === "FIXED"
              ? "Fixed Rate Active"
              : shippingType === "FREE_ABOVE_MIN"
              ? "Free Over Min Active"
              : "Weight-Based Active"}
          </span>
        )}
      </div>

      {/* Method Selection Cards (Only one active at a time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Method 1: Fixed Shipping Charge */}
        <div
          onClick={() => setShippingType("FIXED")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            shippingType === "FIXED"
              ? "border-[#2563EB] bg-blue-50/40 shadow-sm ring-1 ring-[#2563EB]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={`p-2 rounded-lg border ${
                  shippingType === "FIXED"
                    ? "bg-blue-100 text-[#2563EB] border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <Truck className="w-4 h-4" />
              </div>
              <input
                type="radio"
                name="shippingTypeRadio"
                checked={shippingType === "FIXED"}
                onChange={() => setShippingType("FIXED")}
                className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Fixed Shipping Charge</h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Charge a standard flat shipping fee on every order regardless of order value or weight.
              </p>
            </div>
          </div>
        </div>

        {/* Method 2: Free Shipping Above a Minimum Order Amount */}
        <div
          onClick={() => setShippingType("FREE_ABOVE_MIN")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            shippingType === "FREE_ABOVE_MIN"
              ? "border-[#2563EB] bg-blue-50/40 shadow-sm ring-1 ring-[#2563EB]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={`p-2 rounded-lg border ${
                  shippingType === "FREE_ABOVE_MIN"
                    ? "bg-blue-100 text-[#2563EB] border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <Gift className="w-4 h-4" />
              </div>
              <input
                type="radio"
                name="shippingTypeRadio"
                checked={shippingType === "FREE_ABOVE_MIN"}
                onChange={() => setShippingType("FREE_ABOVE_MIN")}
                className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Free Shipping Over Min Amount</h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Free shipping when order subtotal meets minimum amount; otherwise applies standard fee.
              </p>
            </div>
          </div>
        </div>

        {/* Method 3: Weight-Based Shipping Charge */}
        <div
          onClick={() => setShippingType("WEIGHT_BASED")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            shippingType === "WEIGHT_BASED"
              ? "border-[#2563EB] bg-blue-50/40 shadow-sm ring-1 ring-[#2563EB]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={`p-2 rounded-lg border ${
                  shippingType === "WEIGHT_BASED"
                    ? "bg-blue-100 text-[#2563EB] border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <Scale className="w-4 h-4" />
              </div>
              <input
                type="radio"
                name="shippingTypeRadio"
                checked={shippingType === "WEIGHT_BASED"}
                onChange={() => setShippingType("WEIGHT_BASED")}
                className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Weight-Based Shipping</h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Calculate shipping dynamically based on total order weight and configured weight tiers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Free for all / Disabled option toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <Ban className="w-4 h-4 text-[#64748B]" />
          <div>
            <p className="text-xs font-bold text-[#0F172A]">Free Shipping on All Orders (No Shipping Charges)</p>
            <p className="text-[11px] text-[#64748B]">Disable extra shipping fees; all orders receive free delivery.</p>
          </div>
        </div>
        <Button
          type="button"
          variant={shippingType === null || shippingType === "NONE" ? "primary" : "outline"}
          size="sm"
          onClick={() => setShippingType(shippingType === "NONE" || shippingType === null ? "FIXED" : "NONE")}
        >
          {shippingType === null || shippingType === "NONE" ? "Free Shipping Active" : "Set Free for All"}
        </Button>
      </div>

      {/* ── Dynamic Configuration Fields ─────────────────────────────────────── */}

      {/* 1. Dynamic Fields for FIXED Shipping */}
      {shippingType === "FIXED" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-4">
          <div className="border-b border-blue-100 pb-2">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2563EB]" />
              Fixed Shipping Charge Settings
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Specify the flat fee added to every checkout order.
            </p>
          </div>

          <div className="max-w-sm space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
              <span>Fixed Shipping Fee (₹)</span>
              <span className="text-[10px] text-[#64748B]">Required</span>
            </label>
            <Input
              type="number"
              step="1"
              min="0"
              value={shippingFixedCharge}
              onChange={(e) => setShippingFixedCharge(e.target.value)}
              placeholder="e.g. 50"
              className="bg-white"
            />
            <p className="text-[11px] text-[#64748B]">
              Every order placed will be charged exactly ₹{shippingFixedCharge || "0"} for shipping.
            </p>
          </div>
        </div>
      )}

      {/* 2. Dynamic Fields for FREE SHIPPING ABOVE MIN */}
      {shippingType === "FREE_ABOVE_MIN" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-4">
          <div className="border-b border-blue-100 pb-2">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#2563EB]" />
              Free Shipping Above Minimum Amount Settings
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Encourage larger orders by offering free shipping once customers reach your target order subtotal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                <span>Minimum Order Amount for Free Shipping (₹)</span>
                <span className="text-[10px] text-[#64748B]">Required</span>
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={shippingMinOrderAmount}
                onChange={(e) => setShippingMinOrderAmount(e.target.value)}
                placeholder="e.g. 499"
                className="bg-white"
              />
              <p className="text-[11px] text-[#64748B]">
                Orders of ₹{shippingMinOrderAmount || "0"} or more get FREE delivery.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                <span>Standard Shipping Charge (₹)</span>
                <span className="text-[10px] text-[#64748B]">If below minimum</span>
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={shippingFallbackCharge}
                onChange={(e) => setShippingFallbackCharge(e.target.value)}
                placeholder="e.g. 40"
                className="bg-white"
              />
              <p className="text-[11px] text-[#64748B]">
                Orders below ₹{shippingMinOrderAmount || "0"} will be charged ₹{shippingFallbackCharge || "0"}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dynamic Fields for WEIGHT-BASED SHIPPING */}
      {shippingType === "WEIGHT_BASED" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-5">
          <div className="border-b border-blue-100 pb-2">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#2563EB]" />
              Weight-Based Shipping Charge Settings
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Configure shipping charges based on total parcel weight. Products without individual weight will use the fallback weight.
            </p>
          </div>

          {/* Fallback default weight */}
          <div className="max-w-md space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
              <span>Default Weight per Item (kg)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Recommended</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={shippingDefaultWeight}
              onChange={(e) => setShippingDefaultWeight(e.target.value)}
              placeholder="e.g. 0.50 (in kg)"
              className="bg-slate-50"
            />
            <p className="text-[11px] text-[#64748B] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              Used automatically if an item in the cart has no weight specified in its product page.
            </p>
          </div>

          {/* Weight Tiers Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Weight Rate Tiers ({shippingWeightRates.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTier}
                className="gap-1.5 text-xs font-semibold border-blue-200 text-[#2563EB] hover:bg-blue-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Weight Tier
              </Button>
            </div>

            {shippingWeightRates.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-2">
                <Scale className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-[#0F172A]">No weight tiers configured yet</p>
                <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                  Click &ldquo;Add Weight Tier&rdquo; to define price ranges for different parcel weights.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddTier}
                  className="mt-2 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Tier
                </Button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">From Weight (kg)</th>
                        <th className="py-2.5 px-3">To Weight (kg)</th>
                        <th className="py-2.5 px-3">Shipping Charge (₹)</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shippingWeightRates.map((tier, idx) => (
                        <tr key={tier.id || idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.minWeight}
                              onChange={(e) =>
                                handleUpdateTier(idx, "minWeight", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-xs w-28 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.maxWeight}
                              onChange={(e) =>
                                handleUpdateTier(idx, "maxWeight", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-xs w-28 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#64748B] font-semibold">₹</span>
                              <Input
                                type="number"
                                step="1"
                                min="0"
                                value={tier.charge}
                                onChange={(e) =>
                                  handleUpdateTier(idx, "charge", parseFloat(e.target.value) || 0)
                                }
                                className="h-8 text-xs w-28 bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveTier(idx)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Delete Tier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
