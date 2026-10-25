"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { StockManagementType, ColorWiseStockType } from "../types";
import { getStockLabel } from "../constants";

interface ProductsTabProps {
  stockManagementType: StockManagementType;
  colorWiseStockType: ColorWiseStockType;
  savedStockType: StockManagementType;
  savedColorWiseType: ColorWiseStockType;
  savingStockSettings: boolean;
  stockSuccess: string | null;
  stockError: string | null;
  onRequestStockTypeChange: (newType: "AVAILABILITY" | "QUANTITY" | "COLOR_WISE") => void;
  onRequestColorWiseTypeChange: (newSubType: "AVAILABILITY" | "QUANTITY") => void;
  onSaveStockSettings: () => void;
}

export function ProductsTab({
  stockManagementType,
  colorWiseStockType,
  savedStockType,
  savedColorWiseType,
  savingStockSettings,
  stockSuccess,
  stockError,
  onRequestStockTypeChange,
  onRequestColorWiseTypeChange,
  onSaveStockSettings,
}: ProductsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6 bg-white border border-slate-200/90 shadow-sm">
        <div className="border-b border-slate-200/90 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#0F172A]">Stock Management</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Choose how inventory is managed across all products in your store. The selected option applies globally to all products and determines which stock fields appear when adding or editing products.
            </p>
          </div>
          {stockManagementType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Configured
            </span>
          )}
        </div>

        {stockSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{stockSuccess}</span>
          </div>
        )}
        {stockError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{stockError}</span>
          </div>
        )}

        {/* Pending Type Change Notice Banner */}
        {savedStockType !== null &&
          (stockManagementType !== savedStockType ||
            (stockManagementType === "COLOR_WISE" && colorWiseStockType !== savedColorWiseType)) && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">
                  Stock Management Type Change Pending
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Switching from <strong>{getStockLabel(savedStockType, savedColorWiseType)}</strong> to{" "}
                  <strong>{getStockLabel(stockManagementType, colorWiseStockType)}</strong>. Saving will reset and reconfigure stock controls for all products in your store.
                </p>
              </div>
            </div>
          )}

        {/* 3 Mutually Exclusive Options */}
        <div className="space-y-3.5">
          {/* Option 1: Manage Stock Availability */}
          <div
            onClick={() => onRequestStockTypeChange("AVAILABILITY")}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
              stockManagementType === "AVAILABILITY"
                ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-[#2563EB]/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="pt-0.5">
                <input
                  type="radio"
                  id="stock-opt-availability"
                  name="stockManagementType"
                  value="AVAILABILITY"
                  checked={stockManagementType === "AVAILABILITY"}
                  onChange={() => onRequestStockTypeChange("AVAILABILITY")}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <label htmlFor="stock-opt-availability" className="text-sm font-bold text-[#0F172A] cursor-pointer">
                    Option 1: Manage Stock Availability
                  </label>
                  {stockManagementType === "AVAILABILITY" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">
                  Admin can mark products as In Stock or Out of Stock without numeric quantities.
                </p>
                <ul className="text-[11px] text-[#64748B] list-disc list-inside space-y-0.5 pt-1">
                  <li>Product Add/Edit forms display only the stock availability control (In Stock / Out of Stock).</li>
                  <li>Stock quantity management and color-wise inventory controls are hidden.</li>
                  <li>Products marked Out of Stock cannot be purchased by storefront customers.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Option 2: Manage Stock Quantity */}
          <div
            onClick={() => onRequestStockTypeChange("QUANTITY")}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
              stockManagementType === "QUANTITY"
                ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-[#2563EB]/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="pt-0.5">
                <input
                  type="radio"
                  id="stock-opt-quantity"
                  name="stockManagementType"
                  value="QUANTITY"
                  checked={stockManagementType === "QUANTITY"}
                  onChange={() => onRequestStockTypeChange("QUANTITY")}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <label htmlFor="stock-opt-quantity" className="text-sm font-bold text-[#0F172A] cursor-pointer">
                    Option 2: Manage Stock Quantity
                  </label>
                  {stockManagementType === "QUANTITY" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">
                  Admin enters and updates the numeric stock quantity for each product.
                </p>
                <ul className="text-[11px] text-[#64748B] list-disc list-inside space-y-0.5 pt-1">
                  <li>Product Add/Edit forms display only the stock quantity field.</li>
                  <li>Product availability is automatically calculated from the available quantity.</li>
                  <li>If quantity is zero, the product is automatically marked unavailable and cannot be purchased.</li>
                  <li>Manual stock availability switch and color-wise inventory controls are hidden.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Option 3: Enable Color-wise Inventory & Image Upload */}
          <div
            onClick={() => onRequestStockTypeChange("COLOR_WISE")}
            className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
              stockManagementType === "COLOR_WISE"
                ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-[#2563EB]/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="pt-0.5">
                <input
                  type="radio"
                  id="stock-opt-colorwise"
                  name="stockManagementType"
                  value="COLOR_WISE"
                  checked={stockManagementType === "COLOR_WISE"}
                  onChange={() => onRequestStockTypeChange("COLOR_WISE")}
                  className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <label htmlFor="stock-opt-colorwise" className="text-sm font-bold text-[#0F172A] cursor-pointer">
                    Option 3: Enable Color-wise Inventory & Image Upload
                  </label>
                  {stockManagementType === "COLOR_WISE" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">
                  Manage inventory and upload dedicated product images for each color variant (e.g. Red, Blue, Black).
                </p>

                {/* Sub-options for Color-wise Inventory */}
                {stockManagementType === "COLOR_WISE" && (
                  <div
                    className="mt-3 pt-3 border-t border-slate-200/90 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-xs font-semibold text-[#0F172A] block">
                      Choose Color-wise Inventory Configuration:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sub-option 1: Manage Stock Availability */}
                      <div
                        onClick={() => onRequestColorWiseTypeChange("AVAILABILITY")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          colorWiseStockType === "AVAILABILITY"
                            ? "border-[#2563EB] bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                        }`}
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="colorWiseStockType"
                            value="AVAILABILITY"
                            checked={colorWiseStockType === "AVAILABILITY"}
                            onChange={() => onRequestColorWiseTypeChange("AVAILABILITY")}
                            className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] mt-0.5 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#0F172A] block">
                              1. Manage Stock Availability
                            </span>
                            <span className="text-[11px] text-[#64748B] block leading-tight">
                              Manage In Stock / Out of Stock independently for each color variant.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Sub-option 2: Manage Stock Quantity */}
                      <div
                        onClick={() => onRequestColorWiseTypeChange("QUANTITY")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          colorWiseStockType === "QUANTITY"
                            ? "border-[#2563EB] bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                        }`}
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="colorWiseStockType"
                            value="QUANTITY"
                            checked={colorWiseStockType === "QUANTITY"}
                            onChange={() => onRequestColorWiseTypeChange("QUANTITY")}
                            className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] mt-0.5 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#0F172A] block">
                              2. Manage Stock Quantity
                            </span>
                            <span className="text-[11px] text-[#64748B] block leading-tight">
                              Manage stock quantity independently for each color variant (0 quantity means unavailable).
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/90">
          <p className="text-[11px] text-[#64748B]">
            Saving applies this inventory configuration globally across all products in your store.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={savingStockSettings}
            onClick={onSaveStockSettings}
          >
            Save Stock Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
