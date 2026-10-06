"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="space-y-4">
      {/* ── Top Bar: Search + Filter & Clear buttons ──────────────── */}
      <div className="flex gap-2.5 sm:gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or SKU…"
            className="w-full h-11 pl-10 pr-9 rounded-xl border bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            style={{
              borderColor: "var(--store-border, rgba(0,0,0,0.15))",
              color: "var(--store-page-text, #ffffff)",
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
          className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95"
          style={{
            borderColor: "var(--store-border, rgba(0,0,0,0.15))",
            backgroundColor: "var(--store-surface, rgba(0,0,0,0.05))",
            color: "var(--store-page-text, #ffffff)",
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            title="Clear all filters"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold opacity-70 hover:opacity-100 transition-all"
            style={{
              borderColor: "var(--store-border, rgba(0,0,0,0.15))",
              color: "var(--store-page-text, #ffffff)",
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-full p-6 overflow-y-auto space-y-6 shadow-2xl"
            style={{
              backgroundColor: "var(--store-surface, #0f172a)",
              color: "var(--store-page-text, #f8fafc)",
              borderLeft: "1px solid var(--store-border, rgba(255,255,255,0.1))",
            }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--store-border)" }}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-base">Filter &amp; Sort</h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2"
                style={{ borderColor: "var(--store-border)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Categories</h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateWithFilters({ category: undefined })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                      !activeCategory ? "bg-blue-600/20 text-blue-400 font-bold" : "opacity-80 hover:bg-black/5"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => navigateWithFilters({ category: cat.id })}
                      className={cn(
                        "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                        activeCategory === cat.id ? "bg-blue-600/20 text-blue-400 font-bold" : "opacity-80 hover:bg-black/5"
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] opacity-50">{cat._count.products}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Brands</h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateWithFilters({ brand: undefined })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                      !activeBrand ? "bg-blue-600/20 text-blue-400 font-bold" : "opacity-80 hover:bg-black/5"
                    )}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => navigateWithFilters({ brand: b.id })}
                      className={cn(
                        "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                        activeBrand === b.id ? "bg-blue-600/20 text-blue-400 font-bold" : "opacity-80 hover:bg-black/5"
                      )}
                    >
                      <span>{b.name}</span>
                      <span className="text-[11px] opacity-50">{b._count.products}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Price Range (₹)</h3>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 h-9 px-3 rounded-lg border bg-black/5 text-xs focus:outline-none"
                    style={{ borderColor: "var(--store-border)" }}
                  />
                  <span className="opacity-40">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 h-9 px-3 rounded-lg border bg-black/5 text-xs focus:outline-none"
                    style={{ borderColor: "var(--store-border)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                  }}
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Availability</h3>
              <div className="space-y-1">
                {[
                  { value: undefined, label: "All Items" },
                  { value: "in-stock", label: "In Stock Only" },
                  { value: "out-of-stock", label: "Out of Stock Only" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigateWithFilters({ availability: item.value })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                      activeAvailability === item.value || (!activeAvailability && !item.value)
                        ? "bg-blue-600/20 text-blue-400 font-bold"
                        : "opacity-80 hover:bg-black/5"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Sort By</h3>
              <div className="space-y-1">
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "oldest", label: "Oldest First" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => navigateWithFilters({ sort: opt.value, newArrival: undefined })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                      activeSort === opt.value
                        ? "bg-blue-600/20 text-blue-400 font-bold"
                        : "opacity-80 hover:bg-black/5"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
