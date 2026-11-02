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
      className={`h-16 flex-shrink-0 border-b border-[#202D55] bg-[#0A1030]/95 backdrop-blur-md px-4 sm:px-6 items-center justify-between ${
        isOverview ? "hidden sm:flex" : "flex"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOverview && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="sm:hidden -ml-1.5 p-2 rounded-xl text-[#F5F7FF] hover:bg-[#172653] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#F5F7FF]" />
          </button>
        )}

        <span className="font-bold text-[#F5F7FF] text-sm uppercase tracking-tight">{storeName}</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#172653] text-[#638BFF] hover:bg-[#1C3066] hover:text-[#8BA8FF] border border-[#202D55] hover:border-[#638BFF]/40 transition-all shadow-sm"
        >
          <StoreIcon className="w-3.5 h-3.5 text-[#638BFF]" />
          <span>Preview Store</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#202D55]">
          <div className="w-8 h-8 rounded-full bg-[#172653] border border-[#202D55] flex items-center justify-center font-bold text-xs text-[#638BFF]">
            {userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-xs font-semibold text-[#F5F7FF] hidden sm:inline">
            {userName || userEmail}
          </span>
        </div>
      </div>
    </header>
  );
}
