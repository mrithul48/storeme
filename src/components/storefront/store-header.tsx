"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { ShoppingBag, MessageCircle, Store as StoreIcon } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";

interface StoreHeaderProps {
  store: {
    slug: string;
    name: string;
    company?: {
      logoUrl?: string | null;
      whatsapp?: string | null;
      phone?: string | null;
    } | null;
    theme?: {
      primaryColor?: string | null;
      navbarBg?: string | null;
      navbarText?: string | null;
    } | null;
  };
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const { totalItems, setIsOpen } = useCart();
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;

  const navbarBg = store.theme?.navbarBg;
  const navbarText = store.theme?.navbarText;

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-slate-800/80 transition-all"
      style={{
        backgroundColor: navbarBg || "rgba(2, 6, 23, 0.85)",
        color: navbarText || "#f8fafc",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href={`/store/${store.slug}`}
          className="flex items-center gap-3 group focus:outline-none"
          style={{ color: navbarText || undefined }}
        >
          {store.company?.logoUrl ? (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800 flex-shrink-0">
              <Image
                src={store.company.logoUrl}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0"
              style={{
                backgroundColor: store.theme?.primaryColor || "#3b82f6",
              }}
            >
              <StoreIcon className="w-5 h-5" />
            </div>
          )}
          <span className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">
            {store.name}
          </span>
        </Link>

        {/* Actions: WhatsApp Direct chat + Cart Button */}
        <div className="flex items-center gap-3">
          {whatsappNumber && (
            <a
              href={buildWhatsAppUrl(
                whatsappNumber,
                `Hi ${store.name}! I am browsing your store and would like to inquire about your products.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              Chat on WhatsApp
            </a>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="View shopping cart"
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600 transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold rounded-full bg-blue-500 text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
