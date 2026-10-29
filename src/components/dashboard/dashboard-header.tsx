"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Store as StoreIcon } from "lucide-react";

interface DashboardHeaderProps {
  storeName: string;
  storeSlug: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function DashboardHeader({
  storeName,
  storeSlug,
  userName,
  userEmail,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isOverview = pathname === "/dashboard" || pathname === "/dashboard/";

  const handleBack = () => {
    if (
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0
    ) {
      router.back();
      return;
    }

    if (pathname.startsWith("/dashboard/products/")) {
      router.push("/dashboard/products");
    } else if (pathname.startsWith("/dashboard/orders/")) {
      router.push("/dashboard/orders");
    } else if (pathname.startsWith("/dashboard/categories/")) {
      router.push("/dashboard/categories");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <header
      className={`h-16 flex-shrink-0 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-4 sm:px-6 items-center justify-between ${
        isOverview ? "hidden sm:flex" : "flex"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOverview && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="sm:hidden -ml-1.5 p-2 rounded-xl text-[#0F172A] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
        )}

        <span className="font-bold text-[#0F172A] text-sm uppercase">{storeName}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#2563EB] hover:bg-blue-100/80 border border-blue-200/80 transition-all shadow-sm"
        >
          <StoreIcon className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Preview Store</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/90 flex items-center justify-center font-bold text-xs text-[#2563EB]">
            {userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-xs font-semibold text-[#0F172A] hidden sm:inline">
            {userName || userEmail}
          </span>
        </div>
      </div>
    </header>
  );
}

