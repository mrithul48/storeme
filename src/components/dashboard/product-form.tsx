"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, AlertCircle, Plus, Palette, Trash2, CheckCircle2 } from "lucide-react";

export interface ColorVariant {
  id?: string;
  color: string;
  manageAvailability: boolean;
  inStock: boolean;
  manageQuantity: boolean;
  stock: number;
  sortOrder: number;
}

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
    manageStockAvailability: initialData?.manageStockAvailability ?? false,
    inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
    manageStockQuantity:
      initialData?.manageStockQuantity ??
      (initialData?.manageStock !== undefined ? initialData.manageStock : false),
    stock: initialData?.stock !== undefined ? String(initialData.stock) : "0",
    categoryId: initialData?.categoryId || "",
    brandId: initialData?.brandId || "",
    status: initialData?.status || "ACTIVE",
    featured: initialData?.featured || false,
  });

  const [images, setImages] = useState<Array<{ url: string; publicId: string }>>(
    initialData?.images?.map((i: any) => ({ url: i.url, publicId: i.publicId })) || []
  );

  const [imageUrlInput, setImageUrlInput] = useState("");

  // ── Color Variants ─────────────────────────────────────────────────────────
  const [enableVariants, setEnableVariants] = useState<boolean>(
    () => Array.isArray(initialData?.variants) && initialData.variants.length > 0
  );

  const [variants, setVariants] = useState<ColorVariant[]>(() => {
    if (Array.isArray(initialData?.variants) && initialData.variants.length > 0) {
      return initialData.variants.map((v: any, idx: number) => ({
        id: v.id,
        color: v.color,
        manageAvailability: Boolean(v.manageAvailability),
        inStock: v.inStock !== false,
        manageQuantity: Boolean(v.manageQuantity),
        stock: typeof v.stock === "number" ? v.stock : 0,
        sortOrder: v.sortOrder ?? idx,
      }));
    }
    return [];
  });

  const [newVariantColor, setNewVariantColor] = useState("");

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

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5 MB. Please choose an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

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

  // ── Variant handlers ────────────────────────────────────────────────────────
  const handleAddVariant = () => {
    const color = newVariantColor.trim();
    if (!color) return;
    if (variants.some((v) => v.color.toLowerCase() === color.toLowerCase())) {
      setError(`Color "${color}" already exists.`);
      return;
    }
    setVariants((prev) => [
      ...prev,
      {
        color,
        manageAvailability: false,
        inStock: true,
        manageQuantity: false,
        stock: 0,
        sortOrder: prev.length,
      },
    ]);
    setNewVariantColor("");
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (
    idx: number,
    field: keyof ColorVariant,
    value: string | number | boolean
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        const updated = { ...v, [field]: value };
        // Prevent contradictory state: if quantity managed with 0 stock, cannot be inStock
        if (updated.manageQuantity && updated.stock === 0 && updated.manageAvailability && updated.inStock) {
          if (field === "inStock") {
            setError(`"${updated.color}" has 0 stock. It cannot be marked In Stock when quantity is 0.`);
            return v;
          }
        }
        return updated;
      })
    );
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

    if (formData.manageStockQuantity) {
      if (isNaN(stock) || stock < 0) {
        setError("Stock quantity must be a non-negative whole number (0 or greater).");
        setLoading(false);
        return;
      }
      // Contradiction prevention
      if (stock === 0 && formData.manageStockAvailability && formData.inStock) {
        setError("Contradictory stock state: Product cannot be marked In Stock when stock quantity is 0.");
        setLoading(false);
        return;
      }
    }

    // Validate variants
    if (enableVariants) {
      for (const v of variants) {
        if (v.manageQuantity) {
          if (isNaN(v.stock) || v.stock < 0) {
            setError(`Stock for variant "${v.color}" must be a non-negative number.`);
            setLoading(false);
            return;
          }
          if (v.stock === 0 && v.manageAvailability && v.inStock) {
            setError(`Contradictory stock state for variant "${v.color}": Cannot be In Stock when stock is 0.`);
            setLoading(false);
            return;
          }
        }
      }
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      description: formData.description || undefined,
      price,
      salePrice: salePrice || undefined,
      sku: formData.sku || undefined,
      stock: isNaN(stock) ? 0 : stock,
      manageStockQuantity: formData.manageStockQuantity,
      manageStockAvailability: formData.manageStockAvailability,
      inStock: formData.inStock,
      categoryId: formData.categoryId || undefined,
      brandId: formData.brandId || undefined,
      status: formData.status,
      featured: formData.featured,
      images: images.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        sortOrder: idx,
      })),
      variants: enableVariants
        ? variants.map((v, idx) => ({
            id: v.id,
            color: v.color,
            manageAvailability: v.manageAvailability,
            inStock: v.inStock,
            manageQuantity: v.manageQuantity,
            stock: v.stock,
            sortOrder: idx,
          }))
        : [],
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

              <div className="flex-1 flex flex-col justify-center space-y-2">
                <label className="text-xs font-semibold text-slate-300">Or add via Image URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddImageUrl}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing & SKU */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Pricing & Identification</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Regular Price (INR) *</label>
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
                <label className="text-xs font-semibold text-slate-300">Sale Price (INR)</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">SKU (Stock Keeping Unit)</label>
              <Input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. PROD-WH-001"
              />
            </div>

            {/* 1. General Product Stock Management */}
            {!enableVariants && (
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-200">Stock Management</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure stock availability and numeric quantity controls independently.
                  </p>
                </div>

                {/* Control A: Stock Availability */}
                <div className="space-y-2 rounded-lg bg-slate-950/40 p-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Manage Stock Availability</p>
                      <p className="text-[11px] text-slate-500">
                        When disabled, defaults to In Stock. When enabled, you can choose In Stock or Out of Stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.manageStockAvailability}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          manageStockAvailability: !prev.manageStockAvailability,
                          // If disabled, product defaults to In Stock
                          inStock: !prev.manageStockAvailability ? prev.inStock : true,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        formData.manageStockAvailability ? "bg-blue-600" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          formData.manageStockAvailability ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {!formData.manageStockAvailability ? (
                    <div className="flex items-center gap-2 pt-1 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Default: In Stock (Availability management disabled)</span>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <span className="text-xs text-slate-300 font-medium">Stock Status:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.manageStockQuantity && parseInt(formData.stock, 10) === 0) {
                              setError("Cannot mark In Stock when managed stock quantity is 0.");
                              return;
                            }
                            setFormData((prev) => ({ ...prev, inStock: true }));
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            formData.inStock
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          In Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, inStock: false }))}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            !formData.inStock
                              ? "bg-rose-600 text-white shadow-sm"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Out of Stock
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control B: Stock Quantity */}
                <div className="space-y-2 rounded-lg bg-slate-950/40 p-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Manage Stock Quantity</p>
                      <p className="text-[11px] text-slate-500">
                        When disabled, quantity is unlimited. When enabled, enter available units.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.manageStockQuantity}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          manageStockQuantity: !prev.manageStockQuantity,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        formData.manageStockQuantity ? "bg-blue-600" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          formData.manageStockQuantity ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {formData.manageStockQuantity ? (
                    <div className="pt-2 space-y-1.5 border-t border-slate-800/80">
                      <label className="text-xs font-semibold text-slate-300">Stock Quantity *</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="1"
                        name="stock"
                        value={formData.stock}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parseInt(val, 10);
                          setFormData((prev) => ({
                            ...prev,
                            stock: val,
                            // If quantity reaches 0 and availability is managed, automatically set out of stock
                            inStock: prev.manageStockAvailability && num === 0 ? false : prev.inStock,
                          }));
                        }}
                        placeholder="e.g. 100"
                      />
                      <p className="text-[11px] text-slate-500">
                        Quantity of 0 prevents customers from purchasing this item.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 pt-1">
                      Stock quantity is hidden. Customers can purchase without quantity restriction as long as the product is In Stock.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* 2 & 3. Color-wise Product Variants */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400" />
                <h2 className="text-base font-bold text-white">Enable Color-wise Inventory</h2>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableVariants}
                onClick={() => setEnableVariants((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  enableVariants ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    enableVariants ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!enableVariants ? (
              <p className="text-[11px] text-slate-500">
                Disabled by default. Enable to manage individual availability and stock quantities per color variant (e.g. Black, White, Blue).
              </p>
            ) : (
              <div className="space-y-4">
                {/* Add new variant */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter color name (e.g. Black, White, Navy Blue)"
                    value={newVariantColor}
                    onChange={(e) => setNewVariantColor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddVariant();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddVariant}>
                    <Plus className="w-4 h-4" />
                    Add Color
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-2">
                    No color variants added yet. Type a color name above and click Add Color.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3.5 space-y-3"
                      >
                        {/* Variant header row */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0"
                              style={{
                                backgroundColor: variant.color.startsWith("#")
                                  ? variant.color
                                  : "transparent",
                              }}
                            />
                            <span className="text-sm font-bold text-white">{variant.color}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            aria-label={`Remove ${variant.color} variant`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variant two independent controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* A. Variant Availability */}
                          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-300">
                                Manage Availability
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={variant.manageAvailability}
                                onClick={() =>
                                  handleVariantChange(
                                    idx,
                                    "manageAvailability",
                                    !variant.manageAvailability
                                  )
                                }
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                  variant.manageAvailability ? "bg-blue-600" : "bg-slate-700"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    variant.manageAvailability ? "translate-x-3" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>

                            {!variant.manageAvailability ? (
                              <div className="text-[11px] text-emerald-400 font-medium">
                                Default: In Stock
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (variant.manageQuantity && variant.stock === 0) {
                                      setError(`Cannot mark "${variant.color}" In Stock when quantity is 0.`);
                                      return;
                                    }
                                    handleVariantChange(idx, "inStock", true);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                    variant.inStock
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-800 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  In Stock
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVariantChange(idx, "inStock", false)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                    !variant.inStock
                                      ? "bg-rose-600 text-white"
                                      : "bg-slate-800 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  Out of Stock
                                </button>
                              </div>
                            )}
                          </div>

                          {/* B. Variant Quantity */}
                          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-300">
                                Manage Quantity
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={variant.manageQuantity}
                                onClick={() =>
                                  handleVariantChange(idx, "manageQuantity", !variant.manageQuantity)
                                }
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                  variant.manageQuantity ? "bg-blue-600" : "bg-slate-700"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    variant.manageQuantity ? "translate-x-3" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>

                            {variant.manageQuantity ? (
                              <div className="flex items-center gap-2 pt-1">
                                <label className="text-[11px] text-slate-400">Qty:</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value, 10);
                                    handleVariantChange(idx, "stock", isNaN(qty) ? 0 : qty);
                                  }}
                                  className="w-24 h-7 rounded border border-slate-700/80 bg-slate-950 px-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500">
                                Unlimited / Quantity hidden
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Taxonomy & Visibility */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Organization</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">Visibility & Status</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Product Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ACTIVE">Active (Live in store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="INACTIVE">Inactive (Archived)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-300">Featured Product</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Highlight on homepage</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.featured}
                onClick={() => setFormData((prev) => ({ ...prev, featured: !prev.featured }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  formData.featured ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    formData.featured ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
