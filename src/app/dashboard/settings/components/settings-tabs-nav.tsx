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
  const tabs = [
    { id: "general" as SettingsTab, label: "General & Brand", icon: Store, onClick: () => onTabChange("general") },
    { id: "products" as SettingsTab, label: "Product Management", icon: Package, onClick: () => onTabChange("products") },
    { id: "orders" as SettingsTab, label: "Orders & Shipping", icon: Sliders, onClick: () => onTabChange("orders") },
    { id: "theme" as SettingsTab, label: "Theme & Styling", icon: Palette, onClick: () => onTabChange("theme") },
    { id: "domain" as SettingsTab, label: "Custom Domain", icon: Globe, onClick: onDomainTabClick },
    { id: "payments" as SettingsTab, label: "Payments", icon: CreditCard, onClick: onPaymentsTabClick },
    { id: "customerAuth" as SettingsTab, label: "Customer Auth", icon: ShieldCheck, onClick: onCustomerAuthTabClick },
  ];

  return (
    <div className="p-1 sm:p-1.5 bg-[#101A3D] rounded-l-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={tab.onClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0 select-none whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#4169E1] text-[#F5F7FF] shadow-md shadow-[#4169E1]/25 border border-[#638BFF]/40 font-bold"
                : "text-[#A5B2D1] hover:text-[#F5F7FF] hover:bg-[#172653] font-semibold"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F5F7FF]" : "text-[#7181A8]"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
