"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, AlertCircle } from "lucide-react";

interface ProductFormProps {
  categories: any[];
  brands: any[];
  initialData?: any;
  productId?: string;
}

export function ProductForm({
  categories,
  brands,
  initialData,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price ? String(initialData.price) : "",
    salePrice: initialData?.salePrice ? String(initialData.salePrice) : "",
    sku: initialData?.sku || "",
    stock: initialData?.stock !== undefined ? String(initialData.stock) : "10",
    categoryId: initialData?.categoryId || "",
    brandId: initialData?.brandId || "",
    status: initialData?.status || "ACTIVE",
    featured: initialData?.featured || false,
  });

  const [images, setImages] = useState<Array<{ url: string; publicId: string }>>(
    initialData?.images?.map((i: any) => ({ url: i.url, publicId: i.publicId })) || []
  );

  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Upload failed");
      }

      setImages((prev) => [...prev, { url: json.url, publicId: json.publicId }]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), publicId: `manual_${Date.now()}` },
    ]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const price = parseFloat(formData.price);
    const salePrice = formData.salePrice ? parseFloat(formData.salePrice) : null;
    const stock = parseInt(formData.stock, 10);

    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    if (salePrice !== null && salePrice >= price) {
      setError("Sale price must be strictly less than the regular price.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      description: formData.description || undefined,
      price,
      salePrice: salePrice || undefined,
      sku: formData.sku || undefined,
      stock: isNaN(stock) ? 0 : stock,
      categoryId: formData.categoryId || undefined,
      brandId: formData.brandId || undefined,
      status: formData.status,
      featured: formData.featured,
      images: images.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        sortOrder: idx,
      })),
    };

    try {
      const endpoint = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (err: any) {
      console.error("Save product error:", err);
      setError(err.message || "An error occurred while saving the product.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">General Information</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Product Title *</label>
              <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <Textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Highlight key product features, specifications, and warranty..."
              />
            </div>
          </Card>

          {/* Media Images */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Product Images</h2>

            {/* Images grid preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden group"
                  >
                    <Image src={img.url} alt="Product" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-slate-300 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload or Add URL */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/50 transition-all">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  {uploadingImage ? "Uploading to Cloudinary..." : "Click to upload image"}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Or paste an external image URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={handleAddImageUrl}>
                Add
              </Button>
            </div>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Pricing & Stock</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Regular Price (₹) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="999.00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sale / Discount Price (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="Optional discounted price"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Stock Units *</label>
                <Input
                  required
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">SKU (Stock Keeping Unit)</label>
                <Input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. PROD-WH-001"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Taxonomy & Visibility */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Visibility</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Publish Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active (Live in Store)</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-200">
                Mark as Featured Product
              </span>
            </label>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Classification</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Brand</label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
