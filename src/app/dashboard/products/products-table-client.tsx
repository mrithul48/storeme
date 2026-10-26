"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit2, Trash2, Package, ChevronDown, Check } from "lucide-react";
import { getColorHex } from "@/lib/constants/colors";

interface ProductsTableClientProps {
  initialProducts: any[];
  categories: any[];
  storeSettings?: {
    stockManagementType?: string | null;
    colorWiseStockType?: string | null;
  } | null;
}

export function ProductsTableClient({
  initialProducts,
  categories,
  storeSettings,
}: ProductsTableClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "" || p.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Error deleting product.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStockBadge = (p: any) => {
    const stockMode = storeSettings?.stockManagementType;
    const colorStockMode = storeSettings?.colorWiseStockType;

    // 1. Availability Mode
    if (stockMode === "AVAILABILITY") {
      const isInStock = p.inStock !== false;
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            isInStock
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isInStock ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      );
    }

    // 2. Quantity Mode
    if (stockMode === "QUANTITY") {
      const qty = Number(p.stock ?? 0);
      const isOut = qty <= 0 || p.inStock === false;
      const isLow = !isOut && qty <= 5;
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            isOut
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : isLow
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          {isOut ? "0 in stock" : `${qty} in stock`}
        </span>
      );
    }

    // 3. Color-wise Mode
    if (stockMode === "COLOR_WISE") {
      const variants = p.variants || [];
      if (variants.length === 0) {
        return (
          <span className="text-xs font-medium text-[#64748B] whitespace-nowrap">
            No color variants
          </span>
        );
      }

      if (colorStockMode === "QUANTITY") {
        const totalQty = variants.reduce(
          (acc: number, v: any) => acc + (Number(v.stock) || 0),
          0
        );
        const isOut = totalQty <= 0;
        return (
          <div className="flex flex-col gap-0.5 items-end sm:items-start">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap w-fit ${
                isOut
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isOut ? "bg-rose-500" : "bg-[#2563EB]"
                }`}
              />
              {totalQty} in stock
            </span>
            <span className="text-[11px] text-[#64748B] whitespace-nowrap">
              {variants.length} {variants.length === 1 ? "color" : "colors"}
            </span>
          </div>
        );
      } else {
        const inStockCount = variants.filter(
          (v: any) => v.inStock !== false
        ).length;
        const isAllOut = inStockCount === 0;
        return (
          <div className="flex flex-col gap-0.5 items-end sm:items-start">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap w-fit ${
                isAllOut
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isAllOut ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              {isAllOut
                ? "Out of Stock"
                : `${inStockCount}/${variants.length} in stock`}
            </span>
            <span className="text-[11px] text-[#64748B] whitespace-nowrap">
              {variants.length} {variants.length === 1 ? "color" : "colors"}
            </span>
          </div>
        );
      }
    }

    // 4. Fallback for unconfigured / legacy products
    if (p.manageStockAvailability) {
      const isInStock = p.inStock !== false;
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            isInStock
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isInStock ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      );
    }

    if (p.variants && p.variants.length > 0) {
      const hasAnyInStock = p.variants.some((v: any) =>
        v.manageQuantity ? (v.stock ?? 0) > 0 : v.inStock !== false
      );
      return (
        <div className="flex flex-col gap-0.5 items-end sm:items-start">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap w-fit ${
              hasAnyInStock
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                hasAnyInStock ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {hasAnyInStock ? "In Stock" : "Out of Stock"}
          </span>
          <span className="text-[11px] text-[#64748B] whitespace-nowrap">
            {p.variants.length} colors
          </span>
        </div>
      );
    }

    const qty = Number(p.stock ?? 0);
    const isOut = p.inStock === false || qty <= 0;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          isOut
            ? "bg-rose-50 text-rose-700 border border-rose-200"
            : qty <= 5
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isOut ? "bg-rose-500" : qty <= 5 ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />
        {isOut ? "0 in stock" : `${qty} in stock`}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter product title or SKU to search..."
            className="pl-10 shadow-sm"
          />
        </div>

        {/* Custom Category Dropdown Menu */}
        <div className="relative w-full sm:w-56 shrink-0" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 flex items-center justify-between text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm hover:border-slate-400 transition-all cursor-pointer"
          >
            <span className="truncate">
              {categories.find((c) => c.id === selectedCategory)?.name || "All Categories"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#64748B] shrink-0 ml-2 transition-transform duration-200",
                categoryDropdownOpen && "rotate-180 text-[#2563EB]"
              )}
            />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-1.5 z-40 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95">
              <div className="text-[10px] font-bold text-[#94A3B8] px-2.5 py-1 uppercase tracking-wider">
                Select Category
              </div>

              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setCategoryDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer",
                  selectedCategory === ""
                    ? "bg-blue-50 text-[#2563EB] font-bold"
                    : "text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                )}
              >
                <span>All Categories</span>
                {selectedCategory === "" && (
                  <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-2" />
                )}
              </button>

              {/* Category Options */}
              {categories.map((c) => {
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-blue-50 text-[#2563EB] font-bold"
                        : "text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">No products found</h3>
              <p className="text-xs text-[#64748B]">
                {products.length === 0
                  ? "You haven't added any products yet."
                  : "No products matched your search filter."}
              </p>
            </div>
            {products.length === 0 && (
              <Link href="/dashboard/products/new">
                <Button variant="primary" size="sm">
                  Add Your First Product
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Mobile View: Clean cards showing Product Image, Name, Stock badge and Dropdown toggle */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((p) => {
              const img = p.images?.[0]?.url;
              const price = Number(p.price);
              const salePrice = p.salePrice ? Number(p.salePrice) : null;
              const isExpanded = expandedId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
                >
                  {/* Front Collapsed Row: Image + Name + Stock + Dropdown Arrow */}
                  <div
                    onClick={() => toggleExpand(p.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Image & Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {img ? (
                          <Image src={img} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                            -
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#0F172A] truncate uppercase">
                          {p.name}
                        </p>
                      </div>
                    </div>

                    {/* Right: Stock Badge & Dropdown button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="shrink-0">{renderStockBadge(p)}</div>
                      <button
                        type="button"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(p.id);
                        }}
                        className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 ${
                          isExpanded ? "rotate-180 bg-blue-50 text-[#2563EB]" : ""
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Full Product Details with Proper Alignment */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 space-y-3 bg-slate-50/70 border-t border-slate-100 animate-in fade-in-50 duration-200">
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-[#0F172A]">Full Details</span>
                          <Badge
                            variant={
                              p.status === "ACTIVE"
                                ? "success"
                                : p.status === "DRAFT"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {p.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs">
                          {/* Price */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#64748B] shrink-0">Price</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0F172A]">
                                {formatCurrency(salePrice || price)}
                              </span>
                              {salePrice && (
                                <span className="text-[11px] text-[#64748B] line-through">
                                  {formatCurrency(price)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Category */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#64748B] shrink-0">Category</span>
                            <span className="font-semibold text-[#0F172A] truncate">
                              {p.category?.name || "Uncategorized"}
                            </span>
                          </div>

                          {/* SKU */}
                          {p.sku && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#64748B] shrink-0">SKU</span>
                              <span className="font-mono text-slate-700 truncate">{p.sku}</span>
                            </div>
                          )}

                          {/* Color Variants Breakdown */}
                          {p.variants && p.variants.length > 0 && (
                            <div className="border-t border-slate-100 pt-2 space-y-1.5">
                              <span className="text-[#64748B] block font-medium">Color Variants</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {p.variants.map((v: any, vIdx: number) => {
                                  const colorName = v.color || v.name || `Color ${vIdx + 1}`;
                                  return (
                                    <div
                                      key={v.id || vIdx}
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs gap-1.5"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="w-3 h-3 rounded-full shrink-0 border border-black/15 shadow-2xs"
                                          style={{ backgroundColor: getColorHex(colorName) }}
                                        />
                                        <span className="font-semibold text-[#0F172A] truncate">
                                          {colorName}
                                        </span>
                                      </div>
                                      <span className="text-[#64748B] font-mono shrink-0 font-medium text-[11px]">
                                        {v.manageQuantity
                                          ? `${v.stock ?? 0} qty`
                                          : v.inStock !== false
                                          ? "In Stock"
                                          : "Out"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link href={`/dashboard/products/${p.id}/edit`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center text-xs py-2 h-9"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            <span>Edit Product</span>
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="flex-1 h-9 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table inside Card (completely preserved) */}
          <Card className="hidden md:block p-0 overflow-hidden border border-slate-200/90 shadow-sm">
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-24 sm:w-28" />
                  <col className="w-28 sm:w-32" />
                  <col className="w-24 sm:w-28" />
                  <col className="w-20 sm:w-24" />
                  <col className="w-20 sm:w-24" />
                </colgroup>
                <thead className="bg-slate-50 text-xs font-semibold text-[#64748B] uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3.5">Product</th>
                    <th className="px-3 sm:px-4 py-3.5">Category</th>
                    <th className="px-3 sm:px-4 py-3.5">Price</th>
                    <th className="px-3 sm:px-4 py-3.5">Stock</th>
                    <th className="px-3 sm:px-4 py-3.5">Status</th>
                    <th className="px-3 sm:px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const img = p.images?.[0]?.url;
                    const price = Number(p.price);
                    const salePrice = p.salePrice ? Number(p.salePrice) : null;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 sm:px-4 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                              {img ? (
                                <Image src={img} alt={p.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                  -
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-[#0F172A] truncate uppercase">{p.name}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-xs text-[#64748B] truncate">
                          {p.category?.name || "Uncategorized"}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5">
                          <div className="flex flex-col whitespace-nowrap">
                            <span className="font-bold text-[#0F172A] text-xs sm:text-sm">
                              {formatCurrency(salePrice || price)}
                            </span>
                            {salePrice && (
                              <span className="text-[11px] text-[#64748B] line-through">
                                {formatCurrency(price)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          {renderStockBadge(p)}
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                          <Badge
                            variant={
                              p.status === "ACTIVE"
                                ? "success"
                                : p.status === "DRAFT"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>

                        <td className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <Link href={`/dashboard/products/${p.id}/edit`}>
                              <button
                                title="Edit product"
                                className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-[#0F172A] transition-colors border border-slate-200/70"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </Link>

                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={deletingId === p.id}
                              title="Delete product"
                              className="p-1.5 sm:p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200/70 disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
