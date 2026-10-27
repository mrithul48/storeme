"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Menu,
  X,
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
      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden">
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_24px_rgba(15,23,42,0.06)] pb-[calc(env(safe-area-inset-bottom)+0.4rem)]"
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
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
                  isActive
                    ? "text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-[#2563EB] shadow-xs"
                      : "text-[#64748B]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? "font-bold text-[#2563EB]" : "font-medium text-[#64748B]"
                  }`}
                >
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
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90 cursor-pointer ${
              drawerOpen
                ? "text-[#2563EB]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                drawerOpen
                  ? "bg-blue-50 text-[#2563EB] shadow-xs"
                  : "text-[#64748B]"
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                drawerOpen ? "font-bold text-[#2563EB]" : "font-medium text-[#64748B]"
              }`}
            >
              Menu
            </span>
          </button>
        </nav>
      </div>

      {/* Smooth Bottom-to-Top Sheet for Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Bottom-to-Top Sheet Content */}
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              }}
              className="relative w-full max-h-[82vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden z-10 border-t border-slate-200/90"
            >
              {/* Drag Handle Indicator */}
              <div
                className="w-full flex justify-center pt-3 pb-1 cursor-pointer shrink-0"
                onClick={() => setDrawerOpen(false)}
              >
                <div className="w-10 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
              </div>

              {/* Header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 shrink-0">
                    L
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm tracking-tight text-[#0F172A] block truncate">
                      LaunchCommerce
                    </span>
                    <span className="text-xs text-[#64748B] truncate block max-w-[180px]">
                      {storeName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Body */}
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                <DashboardNav
                  isPlatformAdmin={isPlatformAdmin}
                  onItemClick={() => setDrawerOpen(false)}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
