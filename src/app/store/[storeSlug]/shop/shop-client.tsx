"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoreLink } from "@/lib/store-url";

interface ShopClientProps {
  storeSlug: string;
  categories: Array<{ id: string; name: string; _count: { products: number } }>;
  brands: Array<{ id: string; name: string; _count: { products: number } }>;
  activeCategory?: string;
  activeBrand?: string;
  activeSearch?: string;
  activeSort?: string;
  activeAvailability?: string;
  activeMinPrice?: string;
  activeMaxPrice?: string;
  isNewArrival?: boolean;
}

export function ShopClient({
  storeSlug,
  categories,
  brands,
  activeCategory,
  activeBrand,
  activeSearch,
  activeSort,
  activeAvailability,
  activeMinPrice,
  activeMaxPrice,
  isNewArrival,
}: ShopClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(activeSearch || "");
  const [minPrice, setMinPrice] = useState(activeMinPrice || "");
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const navigateWithFilters = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();

    const cat = "category" in overrides ? overrides.category : activeCategory;
    const brd = "brand" in overrides ? overrides.brand : activeBrand;
    const src = "search" in overrides ? overrides.search : (search.trim() || activeSearch);
    const srt = "sort" in overrides ? overrides.sort : activeSort;
    const avail = "availability" in overrides ? overrides.availability : activeAvailability;
    const minP = "minPrice" in overrides ? overrides.minPrice : minPrice;
    const maxP = "maxPrice" in overrides ? overrides.maxPrice : maxPrice;
    const newArr = "newArrival" in overrides ? overrides.newArrival : (isNewArrival ? "true" : undefined);

    if (cat) sp.set("category", cat);
    if (brd) sp.set("brand", brd);
    if (src) sp.set("search", src);
    if (srt && srt !== "newest") sp.set("sort", srt);
    if (avail) sp.set("availability", avail);
    if (minP) sp.set("minPrice", minP);
    if (maxP) sp.set("maxPrice", maxP);
    if (newArr) sp.set("newArrival", newArr);

    const qs = sp.toString();
    const url = getStoreLink(storeSlug, `/shop${qs ? `?${qs}` : ""}`);
    router.push(url);
    setMobileFiltersOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithFilters({ search: search.trim() || undefined });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithFilters({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
  };

  const handleClearAll = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(getStoreLink(storeSlug, "/shop"));
    setMobileFiltersOpen(false);
  };

  const hasActiveFilters = Boolean(
    activeCategory ||
    activeBrand ||
    activeSearch ||
    activeAvailability ||
    activeMinPrice ||
    activeMaxPrice ||
    isNewArrival ||
    (activeSort && activeSort !== "newest")
  );

  return (
    <>
      {/* ── Top Bar: Search + Filter & Clear buttons (Sticky) ─────────── */}
      <div
        className="sticky top-16 sm:top-20 z-30 py-3 bg-[var(--store-page-bg,#ffffff)]/95 backdrop-blur-md transition-all -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{
          backgroundColor: "var(--store-page-bg, #ffffff)",
          borderColor: "var(--store-border, rgba(0,0,0,0.08))",
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
            <input
              type="text"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU…"
              className="w-full h-11 pl-10 pr-9 border bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              style={{
                borderColor: "var(--store-border, rgba(0,0,0,0.15))",
                color: "var(--store-page-text, #ffffff)",
                borderRadius: "var(--store-input-radius, 10px)",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  navigateWithFilters({ search: undefined });
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 h-11 px-4 border text-sm font-semibold transition-all active:scale-95 flex-shrink-0 shadow-sm"
            style={{
              borderColor: "var(--store-border, rgba(0,0,0,0.15))",
              backgroundColor: "var(--store-surface, rgba(0,0,0,0.05))",
              color: "var(--store-page-paragraph, #ffffff)",
              borderRadius: "var(--store-button-radius, 10px)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <p style={{ color: "var(--store-page-paragraph, #ffffff)" }}>Filters</p>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              title="Clear all filters"
              className="hidden sm:flex items-center gap-1.5 h-11 px-3.5 border text-xs font-semibold opacity-70 hover:opacity-100 transition-all flex-shrink-0"
              style={{
                borderColor: "var(--store-border, rgba(0,0,0,0.15))",
                color: "var(--store-page-paragraph, #ffffff)",
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <p style={{ color: "var(--store-page-paragraph, #ffffff)" }}>Clear</p>
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet (Animated bottom to top) ─────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop with smooth fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Bottom Sheet Drawer with smooth spring motion from bottom to top */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col rounded-t-3xl shadow-2xl overflow-hidden border-t"
              style={{
                backgroundColor: "var(--store-surface, #0f172a)",
                color: "var(--store-page-text, #f8fafc)",
                borderColor: "var(--store-border, rgba(255,255,255,0.1))",
              }}
            >
              {/* Drag handle pill indicator */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-500/30" />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0"
                style={{ borderColor: "var(--store-border, rgba(255,255,255,0.1))" }}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                  <h2 className="font-bold text-base">Filter &amp; Sort</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full py-2 px-3 text-xs font-semibold border flex items-center justify-center gap-2"
                style={{
                  borderColor: "var(--store-border)",
                  borderRadius: "var(--store-button-radius, 10px)",
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--store-page-paragraph, #94a3b8)" }}>Categories</p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateWithFilters({ category: undefined })}
                    style={{
                      borderRadius: "var(--store-button-radius, 10px)",
                      color: !activeCategory ? undefined : "var(--store-page-paragraph, #94a3b8)",
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                      !activeCategory ? "bg-blue-600/20 text-blue-400 font-bold" : "hover:bg-white/10 hover:opacity-100"
                    )}
                  >
                    <p className={!activeCategory ? "text-blue-400 font-bold" : undefined} style={{ color: !activeCategory ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                      All Categories
                    </p>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => navigateWithFilters({ category: cat.id })}
                      style={{
                        borderRadius: "var(--store-button-radius, 10px)",
                        color: activeCategory === cat.id ? undefined : "var(--store-page-paragraph, #94a3b8)",
                      }}
                      className={cn(
                        "w-full text-left flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors",
                        activeCategory === cat.id ? "bg-blue-600/20 text-blue-400 font-bold" : "hover:bg-white/10 hover:opacity-100"
                      )}
                    >
                      <p className={activeCategory === cat.id ? "text-blue-400 font-bold" : undefined} style={{ color: activeCategory === cat.id ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {cat.name}
                      </p>
                      <p className="text-[11px] opacity-75" style={{ color: activeCategory === cat.id ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {cat._count.products}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--store-page-paragraph, #94a3b8)" }}>Brands</p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateWithFilters({ brand: undefined })}
                    style={{
                      borderRadius: "var(--store-button-radius, 10px)",
                      color: !activeBrand ? undefined : "var(--store-page-paragraph, #94a3b8)",
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                      !activeBrand ? "bg-blue-600/20 text-blue-400 font-bold" : "hover:bg-white/10 hover:opacity-100"
                    )}
                  >
                    <p className={!activeBrand ? "text-blue-400 font-bold" : undefined} style={{ color: !activeBrand ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                      All Brands
                    </p>
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => navigateWithFilters({ brand: b.id })}
                      style={{
                        borderRadius: "var(--store-button-radius, 10px)",
                        color: activeBrand === b.id ? undefined : "var(--store-page-paragraph, #94a3b8)",
                      }}
                      className={cn(
                        "w-full text-left flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors",
                        activeBrand === b.id ? "bg-blue-600/20 text-blue-400 font-bold" : "hover:bg-white/10 hover:opacity-100"
                      )}
                    >
                      <p className={activeBrand === b.id ? "text-blue-400 font-bold" : undefined} style={{ color: activeBrand === b.id ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {b.name}
                      </p>
                      <p className="text-[11px] opacity-75" style={{ color: activeBrand === b.id ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {b._count.products}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--store-page-paragraph, #94a3b8)" }}>Price Range (₹)</p>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 h-9 px-3 border bg-black/5 text-xs focus:outline-none"
                    style={{
                      borderColor: "var(--store-border)",
                      borderRadius: "var(--store-input-radius, 10px)",
                      color: "var(--store-page-paragraph, #94a3b8)",
                    }}
                  />
                  <span className="opacity-40">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 h-9 px-3 border bg-black/5 text-xs focus:outline-none"
                    style={{
                      borderColor: "var(--store-border)",
                      borderRadius: "var(--store-input-radius, 10px)",
                      color: "var(--store-page-paragraph, #94a3b8)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold shadow-sm transition-all"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--store-page-paragraph, #94a3b8)" }}>Availability</p>
              <div className="space-y-1">
                {[
                  { value: undefined, label: "All Items" },
                  { value: "in-stock", label: "In Stock Only" },
                  { value: "out-of-stock", label: "Out of Stock Only" },
                ].map((item) => {
                  const isActive = activeAvailability === item.value || (!activeAvailability && !item.value);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigateWithFilters({ availability: item.value })}
                      style={{
                        borderRadius: "var(--store-button-radius, 10px)",
                        color: isActive ? undefined : "var(--store-page-paragraph, #94a3b8)",
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-blue-600/20 text-blue-400 font-bold"
                          : "hover:bg-white/10 hover:opacity-100"
                      )}
                    >
                      <p className={isActive ? "text-blue-400 font-bold" : undefined} style={{ color: isActive ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {item.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--store-page-paragraph, #94a3b8)" }}>Sort By</p>
              <div className="space-y-1">
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "oldest", label: "Oldest First" },
                ].map((opt) => {
                  const isActive = activeSort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => navigateWithFilters({ sort: opt.value, newArrival: undefined })}
                      style={{
                        borderRadius: "var(--store-button-radius, 10px)",
                        color: isActive ? undefined : "var(--store-page-paragraph, #94a3b8)",
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-blue-600/20 text-blue-400 font-bold"
                          : "hover:bg-white/10 hover:opacity-100"
                      )}
                    >
                      <p className={isActive ? "text-blue-400 font-bold" : undefined} style={{ color: isActive ? undefined : "var(--store-page-paragraph, #94a3b8)" }}>
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

              {/* Bottom Actions Footer */}
              <div
                className="p-4 border-t flex items-center gap-3 flex-shrink-0"
                style={{
                  backgroundColor: "var(--store-surface, #0f172a)",
                  borderColor: "var(--store-border, rgba(255,255,255,0.1))",
                }}
              >
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 py-2.5 text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      borderColor: "var(--store-border, rgba(0,0,0,0.15))",
                      color: "var(--store-page-text, #ffffff)",
                      borderRadius: "var(--store-button-radius, 10px)",
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold shadow-sm transition-all active:scale-95 text-center"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  View Products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
