"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Layers, Tag, AlertCircle, Pencil, X } from "lucide-react";
import { ImageUploader } from "../store-design/_ui/image-uploader";

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

  // Category create state
  const [catName, setCatName] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catImagePublicId, setCatImagePublicId] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Category edit state
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatImageUrl, setEditCatImageUrl] = useState("");
  const [editCatImagePublicId, setEditCatImagePublicId] = useState("");
  const [editCatLoading, setEditCatLoading] = useState(false);
  const [editCatError, setEditCatError] = useState<string | null>(null);

  // Brand create state
  const [brandName, setBrandName] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandLogoPublicId, setBrandLogoPublicId] = useState("");
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Brand edit state
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [editBrandName, setEditBrandName] = useState("");
  const [editBrandLogoUrl, setEditBrandLogoUrl] = useState("");
  const [editBrandLogoPublicId, setEditBrandLogoPublicId] = useState("");
  const [editBrandLoading, setEditBrandLoading] = useState(false);
  const [editBrandError, setEditBrandError] = useState<string | null>(null);

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
          imageUrl: catImageUrl || undefined,
          imagePublicId: catImagePublicId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create category");
      }

      setCategories((prev) => [...prev, { ...data.data, _count: { products: 0 } }]);
      setCatName("");
      setCatImageUrl("");
      setCatImagePublicId("");
      router.refresh();
    } catch (err: any) {
      setCatError(err.message || "Failed to create category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleStartEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || "");
    setEditCatImageUrl(cat.imageUrl || "");
    setEditCatImagePublicId(cat.imagePublicId || "");
    setEditCatError(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;

    setEditCatLoading(true);
    setEditCatError(null);

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCatName.trim(),
          imageUrl: editCatImageUrl || "",
          imagePublicId: editCatImagePublicId || "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update category");
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...data.data, _count: data.data._count ?? c._count }
            : c
        )
      );
      setEditingCategory(null);
      router.refresh();
    } catch (err: any) {
      setEditCatError(err.message || "Failed to update category");
    } finally {
      setEditCatLoading(false);
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
        body: JSON.stringify({
          name: brandName.trim(),
          logoUrl: brandLogoUrl || undefined,
          logoPublicId: brandLogoPublicId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create brand");
      }

      setBrands((prev) => [...prev, { ...data.data, _count: { products: 0 } }]);
      setBrandName("");
      setBrandLogoUrl("");
      setBrandLogoPublicId("");
      router.refresh();
    } catch (err: any) {
      setBrandError(err.message || "Failed to create brand");
    } finally {
      setBrandLoading(false);
    }
  };

  const handleStartEditBrand = (b: any) => {
    setEditingBrand(b);
    setEditBrandName(b.name || "");
    setEditBrandLogoUrl(b.logoUrl || "");
    setEditBrandLogoPublicId(b.logoPublicId || "");
    setEditBrandError(null);
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editBrandName.trim()) return;

    setEditBrandLoading(true);
    setEditBrandError(null);

    try {
      const res = await fetch(`/api/brands/${editingBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editBrandName.trim(),
          logoUrl: editBrandLogoUrl || "",
          logoPublicId: editBrandLogoPublicId || "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update brand");
      }

      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? { ...data.data, _count: data.data._count ?? b._count }
            : b
        )
      );
      setEditingBrand(null);
      router.refresh();
    } catch (err: any) {
      setEditBrandError(err.message || "Failed to update brand");
    } finally {
      setEditBrandLoading(false);
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
        <Card className="space-y-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#0F172A]">Add New Category</h2>
          </div>

          {catError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{catError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Category Name *</label>
              <Input
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <ImageUploader
              label="Category Image"
              url={catImageUrl}
              folder="categories"
              aspectHint="Recommended: Square or 4:3 (e.g. 400×400px)"
              onUpload={(r) => {
                setCatImageUrl(r.url);
                setCatImagePublicId(r.publicId);
              }}
              onRemove={() => {
                setCatImageUrl("");
                setCatImagePublicId("");
              }}
            />

            <Button type="submit" variant="primary" size="sm" isLoading={catLoading} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </form>
        </Card>

        {/* Existing Categories List */}
        <Card className="space-y-3 border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">
            All Categories ({categories.length})
          </h3>

          {categories.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">No categories created yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.imageUrl ? (
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 text-xs font-bold">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#2563EB] font-semibold">
                          {c._count?.products || 0} products
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditCategory(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Brands Section */}
      <div className="space-y-6">
        <Card className="space-y-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-[#0F172A]">Add New Brand</h2>
          </div>

          {brandError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{brandError}</span>
            </div>
          )}

          <form onSubmit={handleCreateBrand} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Brand Name *</label>
              <Input
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>

            <ImageUploader
              label="Brand Logo"
              url={brandLogoUrl}
              folder="brands"
              aspectHint="Recommended: Square or transparent PNG logo"
              onUpload={(r) => {
                setBrandLogoUrl(r.url);
                setBrandLogoPublicId(r.publicId);
              }}
              onRemove={() => {
                setBrandLogoUrl("");
                setBrandLogoPublicId("");
              }}
            />

            <Button type="submit" variant="emerald" size="sm" isLoading={brandLoading} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Brand
            </Button>
          </form>
        </Card>

        {/* Existing Brands List */}
        <Card className="space-y-3 border border-slate-200/90 shadow-sm">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">
            All Brands ({brands.length})
          </h3>

          {brands.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">No brands created yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {brands.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {b.logoUrl ? (
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 p-1">
                        <Image src={b.logoUrl} alt={b.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 text-xs font-bold">
                        {b.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{b.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditBrand(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Edit Brand"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(b.id, b.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">Edit Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editCatError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editCatError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Category Name *</label>
                <Input
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>

              <ImageUploader
                label="Category Image"
                url={editCatImageUrl}
                folder="categories"
                aspectHint="Recommended: Square or 4:3 (e.g. 400×400px)"
                onUpload={(r) => {
                  setEditCatImageUrl(r.url);
                  setEditCatImagePublicId(r.publicId);
                }}
                onRemove={() => {
                  setEditCatImageUrl("");
                  setEditCatImagePublicId("");
                }}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(null)}
                  disabled={editCatLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={editCatLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#0F172A]">Edit Brand</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBrand(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editBrandError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editBrandError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBrand} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Brand Name *</label>
                <Input
                  required
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>

              <ImageUploader
                label="Brand Logo"
                url={editBrandLogoUrl}
                folder="brands"
                aspectHint="Recommended: Square or transparent PNG logo"
                onUpload={(r) => {
                  setEditBrandLogoUrl(r.url);
                  setEditBrandLogoPublicId(r.publicId);
                }}
                onRemove={() => {
                  setEditBrandLogoUrl("");
                  setEditBrandLogoPublicId("");
                }}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBrand(null)}
                  disabled={editBrandLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  isLoading={editBrandLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
