"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Menu,
  X,
  ExternalLink,
  Store as StoreIcon,
  LogOut,
} from "lucide-react";
import { DashboardNav } from "./dashboard-nav";

interface MobileNavProps {
  storeName: string;
  storeSlug: string;
  isPlatformAdmin?: boolean;
  signOutAction?: () => Promise<void>;
}

export function MobileNav({
  storeName,
  storeSlug,
  isPlatformAdmin,
}: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const quickItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Top Header Trigger (used via custom event or button in header) */}
      <div className="md:hidden">
        {/* Fixed Touch-Friendly Bottom Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg shadow-slate-900/5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)]"
        >
          {quickItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-[#2563EB] font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50 text-[#2563EB]" : "text-[#64748B]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More / Menu Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              drawerOpen ? "text-[#2563EB] font-bold" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                drawerOpen ? "bg-blue-50 text-[#2563EB]" : "text-[#64748B]"
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
          </button>
        </nav>
      </div>

      {/* Slide-over Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 z-10 border-l border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                  L
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-[#0F172A] block">
                    LaunchCommerce
                  </span>
                  <span className="text-xs text-[#64748B] truncate block max-w-[150px]">
                    {storeName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Body */}
            <div className="p-5 overflow-y-auto flex-1">
              <DashboardNav
                isPlatformAdmin={isPlatformAdmin}
                onItemClick={() => setDrawerOpen(false)}
              />
            </div>

          </aside>
        </div>
      )}
    </>
  );
}
