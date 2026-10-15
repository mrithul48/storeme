"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Card, Input } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit2, Trash2, Package, AlertCircle } from "lucide-react";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="pl-10"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">No products found</h3>
              <p className="text-xs text-slate-400">
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
        ) : (
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
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-3 sm:px-4 py-3.5">Product</th>
                  <th className="px-3 sm:px-4 py-3.5">Category</th>
                  <th className="px-3 sm:px-4 py-3.5">Price</th>
                  <th className="px-3 sm:px-4 py-3.5">Stock</th>
                  <th className="px-3 sm:px-4 py-3.5">Status</th>
                  <th className="px-3 sm:px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const img = p.images?.[0]?.url;
                  const price = Number(p.price);
                  const salePrice = p.salePrice ? Number(p.salePrice) : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 sm:px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/50">
                            {img ? (
                              <Image src={img} alt={p.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                                -
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-200 truncate">{p.name}</p>
                            <span className="text-xs text-slate-500 font-mono truncate block">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 sm:px-4 py-3.5 text-xs text-slate-300 truncate">
                        {p.category?.name || "Uncategorized"}
                      </td>

                      <td className="px-3 sm:px-4 py-3.5">
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {formatCurrency(salePrice || price)}
                          </span>
                          {salePrice && (
                            <span className="text-[11px] text-slate-500 line-through">
                              {formatCurrency(price)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        {(() => {
                          const stockMode = storeSettings?.stockManagementType;
                          const colorStockMode = storeSettings?.colorWiseStockType;

                          // 1. Availability Mode
                          if (stockMode === "AVAILABILITY") {
                            const isInStock = p.inStock !== false;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isInStock
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isInStock ? "bg-emerald-400" : "bg-rose-400"
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
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isOut
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : isLow
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isOut ? "bg-rose-400" : isLow ? "bg-amber-400" : "bg-emerald-400"
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
                                <span className="text-xs font-medium text-slate-500">
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
                                <div className="flex flex-col gap-0.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${
                                      isOut
                                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isOut ? "bg-rose-400" : "bg-blue-400"
                                      }`}
                                    />
                                    {totalQty} in stock
                                  </span>
                                  <span className="text-[11px] text-slate-400">
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
                                <div className="flex flex-col gap-0.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${
                                      isAllOut
                                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isAllOut ? "bg-rose-400" : "bg-emerald-400"
                                      }`}
                                    />
                                    {isAllOut
                                      ? "Out of Stock"
                                      : `${inStockCount}/${variants.length} in stock`}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
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
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isInStock
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isInStock ? "bg-emerald-400" : "bg-rose-400"
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
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${
                                    hasAnyInStock
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      hasAnyInStock ? "bg-emerald-400" : "bg-rose-400"
                                    }`}
                                  />
                                  {hasAnyInStock ? "In Stock" : "Out of Stock"}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {p.variants.length} colors
                                </span>
                              </div>
                            );
                          }

                          const qty = Number(p.stock ?? 0);
                          const isOut = p.inStock === false || qty <= 0;
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isOut
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : qty <= 5
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOut ? "bg-rose-400" : qty <= 5 ? "bg-amber-400" : "bg-emerald-400"
                                }`}
                              />
                              {isOut ? "0 in stock" : `${qty} in stock`}
                            </span>
                          );
                        })()}
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
                              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            title="Delete product"
                            className="p-1.5 sm:p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-40"
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
        )}
      </Card>
    </div>
  );
}
