"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Layers, Tag, AlertCircle } from "lucide-react";

interface CategoriesBrandsClientProps {
  initialCategories: any[];
  initialBrands: any[];
}

export function CategoriesBrandsClient({
  initialCategories,
  initialBrands,
}: CategoriesBrandsClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);

  // Category state
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Brand state
  const [brandName, setBrandName] = useState("");
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCatLoading(true);
    setCatError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create category");
      }

      setCategories((prev) => [...prev, { ...data.data, _count: { products: 0 } }]);
      setCatName("");
      setCatDesc("");
      router.refresh();
    } catch (err: any) {
      setCatError(err.message || "Failed to create category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products will become uncategorized.`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setBrandLoading(true);
    setBrandError(null);

    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create brand");
      }

      setBrands((prev) => [...prev, { ...data.data, _count: { products: 0 } }]);
      setBrandName("");
      router.refresh();
    } catch (err: any) {
      setBrandError(err.message || "Failed to create brand");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Delete brand "${name}"?`)) return;

    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("Delete brand error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Categories Section */}
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Add New Category</h2>
          </div>

          {catError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{catError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category Name *</label>
              <Input
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Footwear, Electronics, Accessories"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
              <Input
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief category summary"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" isLoading={catLoading} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </form>
        </Card>

        {/* Existing Categories List */}
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            All Categories ({categories.length})
          </h3>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No categories created yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {categories.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">/{c.slug}</span>
                      <span className="text-[11px] text-blue-400 font-medium">
                        {c._count?.products || 0} products
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Brands Section */}
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Add New Brand</h2>
          </div>

          {brandError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{brandError}</span>
            </div>
          )}

          <form onSubmit={handleCreateBrand} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Brand Name *</label>
              <Input
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Nike, Apple, Sony"
              />
            </div>

            <Button type="submit" variant="emerald" size="sm" isLoading={brandLoading} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Brand
            </Button>
          </form>
        </Card>

        {/* Existing Brands List */}
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            All Brands ({brands.length})
          </h3>

          {brands.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No brands created yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {brands.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{b.name}</p>
                    <span className="text-xs text-slate-400 font-mono">/{b.slug}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
