"use client";

import React from "react";
import {
  Store,
  Package,
  Sliders,
  Palette,
  Globe,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { SettingsTab } from "../types";

interface SettingsTabsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onDomainTabClick: () => void;
  onPaymentsTabClick: () => void;
  onCustomerAuthTabClick: () => void;
}

export function SettingsTabsNav({
  activeTab,
  onTabChange,
  onDomainTabClick,
  onPaymentsTabClick,
  onCustomerAuthTabClick,
}: SettingsTabsNavProps) {
  return (
    <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => onTabChange("general")}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "general"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <Store className="w-4 h-4" />
        General &amp; Brand
      </button>

      <button
        type="button"
        onClick={() => onTabChange("products")}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "products"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <Package className="w-4 h-4" />
        Product Management
      </button>

      <button
        type="button"
        onClick={() => onTabChange("orders")}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "orders"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <Sliders className="w-4 h-4" />
        Order Methods
      </button>

      <button
        type="button"
        onClick={() => onTabChange("theme")}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "theme"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <Palette className="w-4 h-4" />
        Theme &amp; Styling
      </button>

      <button
        type="button"
        onClick={onDomainTabClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "domain"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <Globe className="w-4 h-4" />
        Custom Domain
      </button>

      <button
        type="button"
        onClick={onPaymentsTabClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "payments"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <CreditCard className="w-4 h-4" />
        Payments
      </button>

      <button
        type="button"
        onClick={onCustomerAuthTabClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
          activeTab === "customerAuth"
            ? "border-blue-500 text-white"
            : "border-transparent text-slate-400 hover:text-slate-200"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        Customer Auth
      </button>
    </div>
  );
}
