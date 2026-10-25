"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Plus,
  Palette,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Check,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
import { PRODUCT_COLORS, getColorHex, type ColorOption } from "@/lib/constants/colors";

export { PRODUCT_COLORS };

export interface ColorVariant {
  id?: string;
  color: string;
  manageAvailability: boolean;
  inStock: boolean;
  manageQuantity: boolean;
  stock: number;
  sortOrder: number;
  images?: Array<{ url: string; publicId: string; sortOrder?: number; altText?: string | null }>;
}

interface ProductFormProps {
  categories: any[];
  brands: any[];
  initialData?: any;
  productId?: string;
  storeSettings?: {
    stockManagementType?: string | null;
    colorWiseStockType?: string | null;
  } | null;
  initialCustomColors?: Array<{ id: string; name: string; hex: string }>;
}

export function ProductForm({
  categories,
  brands,
  initialData,
  productId,
  storeSettings,
  initialCustomColors,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const stockMode = storeSettings?.stockManagementType ?? null;
  const colorStockMode = storeSettings?.colorWiseStockType ?? "AVAILABILITY";

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
    weight: initialData?.weight ? String(initialData.weight) : "",
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
  const [enableVariants, setEnableVariants] = useState<boolean>(() => {
    if (stockMode === "COLOR_WISE") return true;
    return Array.isArray(initialData?.variants) && initialData.variants.length > 0;
  });

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
        images: Array.isArray(v.images)
          ? v.images.map((img: any, imgIdx: number) => ({
              url: img.url,
              publicId: img.publicId,
              altText: img.altText ?? null,
              sortOrder: img.sortOrder ?? imgIdx,
            }))
          : [],
      }));
    }
    return [];
  });

  const [newVariantColor, setNewVariantColor] = useState("");
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);
  const [variantUrlInputs, setVariantUrlInputs] = useState<Record<number, string>>({});
  const [customColors, setCustomColors] = useState<Array<{ id?: string; name: string; hex: string }>>(
    initialCustomColors || []
  );
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [colorSearch, setColorSearch] = useState("");
  const [isCreatingCustomColor, setIsCreatingCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#3b82f6");
  const [isSavingCustomColor, setIsSavingCustomColor] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(false);
        setIsCreatingCustomColor(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Merge standard PRODUCT_COLORS with store customColors (deduped by name)
  const allAvailableColors: ColorOption[] = useMemo(() => {
    const list: ColorOption[] = [...PRODUCT_COLORS];
    for (const c of customColors) {
      if (!list.some((existing) => existing.name.toLowerCase() === c.name.toLowerCase())) {
        list.push({ id: c.id, name: c.name, hex: c.hex, isCustom: true });
      }
    }
    return list;
  }, [customColors]);

  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return allAvailableColors;
    const q = colorSearch.toLowerCase().trim();
    return allAvailableColors.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    );
  }, [allAvailableColors, colorSearch]);

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
  const handleAddVariant = (overrideColor?: string) => {
    const color = (overrideColor !== undefined ? overrideColor : newVariantColor).trim();
    if (!color) return;
    if (variants.some((v) => v.color.toLowerCase() === color.toLowerCase())) {
      setError(`Color "${color}" is already added.`);
      return;
    }
    const isColorQty = colorStockMode === "QUANTITY";
    setVariants((prev) => [
      ...prev,
      {
        color,
        manageAvailability: !isColorQty,
        inStock: true,
        manageQuantity: isColorQty,
        stock: 0,
        sortOrder: prev.length,
        images: [],
      },
    ]);
    setNewVariantColor("");
    setError(null);
  };

  const handleVariantFileUpload = async (variantIdx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) {
        setError(`"${files[i].name}" exceeds 5 MB. Please select files smaller than 5 MB.`);
        return;
      }
    }

    setUploadingVariantIdx(variantIdx);
    setError(null);

    try {
      const uploaded: Array<{ url: string; publicId: string; sortOrder: number }> = [];
      const currentCount = variants[variantIdx]?.images?.length || 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "products");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Failed to upload ${file.name}`);
        }

        uploaded.push({
          url: json.url,
          publicId: json.publicId,
          sortOrder: currentCount + i,
        });
      }

      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIdx
            ? { ...v, images: [...(v.images || []), ...uploaded] }
            : v
        )
      );
    } catch (err: any) {
      console.error("Variant image upload error:", err);
      setError(err.message || "Failed to upload variant image.");
    } finally {
      setUploadingVariantIdx(null);
    }
  };

  const handleAddVariantImageUrl = (variantIdx: number) => {
    const url = (variantUrlInputs[variantIdx] || "").trim();
    if (!url) return;

    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? {
              ...v,
              images: [
                ...(v.images || []),
                {
                  url,
                  publicId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  sortOrder: v.images?.length || 0,
                },
              ],
            }
          : v
      )
    );

    setVariantUrlInputs((prev) => ({ ...prev, [variantIdx]: "" }));
  };

  const handleRemoveVariantImage = (variantIdx: number, imgIdx: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? {
              ...v,
              images: (v.images || []).filter((_, idx) => idx !== imgIdx),
            }
          : v
      )
    );
  };

  const handleCreateCustomColor = async () => {
    const name = customColorName.trim();
    if (!name) {
      setError("Please enter a color name.");
      return;
    }

    setIsSavingCustomColor(true);
    setError(null);
    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hex: customColorHex }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create color");
      }

      const created = data.data;
      setCustomColors((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === created.name.toLowerCase())) {
          return prev;
        }
        return [...prev, { id: created.id, name: created.name, hex: created.hex }];
      });

      // Automatically add as variant
      handleAddVariant(created.name);

      setCustomColorName("");
      setCustomColorHex("#3b82f6");
      setIsCreatingCustomColor(false);
      setIsColorDropdownOpen(false);
    } catch (err: any) {
      console.error("Error creating custom color:", err);
      setError(err.message || "Failed to save color to store.");
    } finally {
      setIsSavingCustomColor(false);
    }
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

    if (!stockMode && !isEditing) {
      setError("Please configure stock management in Store Settings → Product Management before creating products.");
      setLoading(false);
      return;
    }

    let manageStockAvailability = false;
    let manageStockQuantity = false;
    let inStock = formData.inStock;
    let finalStock = isNaN(stock) ? 0 : stock;
    let payloadVariants: any[] = [];

    if (stockMode === "AVAILABILITY") {
      manageStockAvailability = true;
      manageStockQuantity = false;
      inStock = formData.inStock;
      finalStock = 0;
      payloadVariants = [];
    } else if (stockMode === "QUANTITY") {
      if (isNaN(stock) || stock < 0) {
        setError("Stock quantity must be a non-negative whole number (0 or greater).");
        setLoading(false);
        return;
      }
      manageStockQuantity = true;
      manageStockAvailability = false;
      finalStock = stock;
      inStock = stock > 0;
      payloadVariants = [];
    } else if (stockMode === "COLOR_WISE") {
      manageStockAvailability = false;
      manageStockQuantity = false;
      if (variants.length === 0) {
        setError("Please add at least one color variant for Color-wise Inventory & Image Upload.");
        setLoading(false);
        return;
      }
      const isColorQty = colorStockMode === "QUANTITY";
      for (const v of variants) {
        if (isColorQty) {
          if (isNaN(v.stock) || v.stock < 0) {
            setError(`Stock for variant "${v.color}" must be a non-negative whole number.`);
            setLoading(false);
            return;
          }
        }
      }
      payloadVariants = variants.map((v, idx) => ({
        id: v.id,
        color: v.color,
        manageAvailability: !isColorQty,
        inStock: isColorQty ? v.stock > 0 : v.inStock,
        manageQuantity: isColorQty,
        stock: isColorQty ? v.stock : 0,
        sortOrder: idx,
        images: v.images && v.images.length > 0
          ? v.images.map((img, imgIdx) => ({
              url: img.url,
              publicId: img.publicId,
              altText: img.altText ?? null,
              sortOrder: img.sortOrder ?? imgIdx,
            }))
          : [],
      }));
      inStock = payloadVariants.some((v) => v.inStock);
    } else {
      // Fallback for legacy products
      manageStockAvailability = formData.manageStockAvailability;
      manageStockQuantity = formData.manageStockQuantity;
      inStock = formData.inStock;
      if (manageStockQuantity) {
        if (isNaN(stock) || stock < 0) {
          setError("Stock quantity must be a non-negative whole number (0 or greater).");
          setLoading(false);
          return;
        }
      }
      payloadVariants = enableVariants
        ? variants.map((v, idx) => ({
            id: v.id,
            color: v.color,
            manageAvailability: v.manageAvailability,
            inStock: v.inStock,
            manageQuantity: v.manageQuantity,
            stock: v.stock,
            sortOrder: idx,
            images: v.images && v.images.length > 0
              ? v.images.map((img, imgIdx) => ({
                  url: img.url,
                  publicId: img.publicId,
                  altText: img.altText ?? null,
                  sortOrder: img.sortOrder ?? imgIdx,
                }))
              : [],
          }))
        : [];
    }

    let finalImages = images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId,
      sortOrder: idx,
    }));

    // If COLOR_WISE mode, populate product images from variant images if empty
    // so catalog listings, store cards, and cart previews have a cover image
    if (stockMode === "COLOR_WISE" && finalImages.length === 0) {
      const variantImgs: typeof finalImages = [];
      for (const v of payloadVariants) {
        if (v.images && v.images.length > 0) {
          for (const vi of v.images) {
            if (!variantImgs.some((existing) => existing.url === vi.url)) {
              variantImgs.push({
                url: vi.url,
                publicId: vi.publicId,
                sortOrder: variantImgs.length,
              });
            }
          }
        }
      }
      finalImages = variantImgs.slice(0, 10);
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      description: formData.description || undefined,
      price,
      salePrice: salePrice || undefined,
      sku: formData.sku || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      stock: finalStock,
      manageStockQuantity,
      manageStockAvailability,
      inStock,
      categoryId: formData.categoryId ? formData.categoryId : null,
      brandId: formData.brandId ? formData.brandId : null,
      status: formData.status,
      featured: formData.featured,
      images: finalImages,
      variants: payloadVariants,
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
        let msg = data.error || "Failed to save product.";
        if (data.details?.fieldErrors) {
          const fieldMsgs = Object.entries(data.details.fieldErrors)
            .flatMap(([field, errors]: any) => errors.map((e: string) => `${field}: ${e}`))
            .join(", ");
          if (fieldMsgs) msg += `: ${fieldMsgs}`;
        } else if (data.details?.formErrors?.length) {
          msg += `: ${data.details.formErrors.join(", ")}`;
        }
        throw new Error(msg);
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
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors font-medium"
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
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={!stockMode && !isEditing}
          >
            {isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>

      {!stockMode && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                Stock Management Configuration Required
              </h3>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Before creating products, you must configure how your store handles inventory (Stock Availability, Stock Quantity, or Color-wise Inventory & Image Upload) in Store Settings → Product Management.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center gap-3">
            <Link href="/dashboard/settings?tab=products">
              <Button type="button" variant="primary" size="sm">
                Configure Stock Settings
              </Button>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4 border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold text-[#0F172A]">General Information</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Product Title *</label>
              <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Description</label>
              <Textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
              />
            </div>
          </Card>

          {/* Media Images (Hidden in Color-wise Inventory mode since images are uploaded per color variant) */}
          {stockMode !== "COLOR_WISE" && (
            <Card className="space-y-4 border border-slate-200/90 shadow-sm">
              <h2 className="text-base font-bold text-[#0F172A]">Product Images</h2>

              {/* Images grid preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-sm"
                    >
                      <Image src={img.url} alt="Product" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/70 text-white hover:text-rose-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#2563EB] text-white">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload or Add URL */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-[#2563EB] rounded-2xl cursor-pointer bg-slate-50/70 hover:bg-blue-50/20 transition-all">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {uploadingImage ? "Uploading to Cloudinary..." : "Click to upload image"}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex flex-col justify-center space-y-2">
                  <label className="text-xs font-semibold text-[#0F172A]">Or add via Image URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
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
          )}

          {/* Pricing & SKU */}
          <Card className="space-y-4 border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold text-[#0F172A]">Pricing & Identification</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Regular Price (INR) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter regular price"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Sale Price (INR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="Enter sale price (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">SKU (Stock Keeping Unit)</label>
                <Input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter product SKU"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                  <span>Product Weight (kg)</span>
                  <span className="text-[10px] text-slate-400 font-normal">For weight-based shipping</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 0.50 (in kg)"
                />
              </div>
            </div>

            {/* Store-Level Stock Management Controls */}
            {!stockMode && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <div className="border-b border-amber-500/20 pb-2">
                  <h3 className="text-sm font-bold text-amber-300">Stock Management</h3>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Store-level stock management is not configured yet.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Stock settings must be configured once under Store Settings → Product Management before creating products.
                  </p>
                  <Link href="/dashboard/settings?tab=products" className="shrink-0">
                    <Button type="button" variant="secondary" size="sm">
                      Configure Stock Settings
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Option 1: Manage Stock Availability */}
            {stockMode === "AVAILABILITY" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 shadow-sm">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Stock Availability</h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Configured store-wide via Store Settings → Product Management
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
                    Availability Mode
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">Product Availability</p>
                    <p className="text-[11px] text-[#64748B]">
                      Mark whether this product is currently in stock and purchasable by customers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inStock: true }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        formData.inStock
                          ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
                          : "bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inStock: false }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        !formData.inStock
                          ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30"
                          : "bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Option 2: Manage Stock Quantity */}
            {stockMode === "QUANTITY" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 shadow-sm">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Stock Quantity</h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Configured store-wide via Store Settings → Product Management
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
                    Quantity Mode
                  </span>
                </div>

                <div className="space-y-2 p-3 rounded-lg bg-white border border-slate-200">
                  <label className="text-xs font-semibold text-[#0F172A]">Available Stock Units *</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    step="1"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        stock: val,
                        inStock: parseInt(val, 10) > 0,
                      }));
                    }}
                    placeholder="Enter stock quantity"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    Availability is calculated from quantity. When quantity is 0, the product is automatically marked unavailable and cannot be purchased.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Option 3: Color-wise Inventory & Image Upload Card */}
          {stockMode === "COLOR_WISE" && (
            <Card className="space-y-4 border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#2563EB]" />
                  <div>
                    <h2 className="text-base font-bold text-[#0F172A]">Color-wise Inventory & Image Upload</h2>
                    <p className="text-[11px] text-[#64748B]">
                      {colorStockMode === "QUANTITY"
                        ? "Stock quantity and product images are managed independently for each color variant (Store Settings)."
                        : "Stock availability (In Stock / Out of Stock) and product images are managed independently for each color variant (Store Settings)."}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 self-start sm:self-auto">
                  {colorStockMode === "QUANTITY" ? "Color Quantity Mode" : "Color Availability Mode"}
                </span>
              </div>

              {/* Informative Note / Tip for Image Upload per color */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-[#0F172A]">Color-specific Media:</strong> When you add or select a color variant below, you can upload that color&apos;s product images directly. Customers will see these images when selecting that color in your store.
                </div>
              </div>

              {/* Add New Color Variant Dropdown */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <div className="flex items-center gap-2">
                  {/* Dropdown Trigger Button */}
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsColorDropdownOpen((prev) => !prev);
                        setIsCreatingCustomColor(false);
                      }}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-xs text-[#0F172A] shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {newVariantColor ? (
                          <>
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-sm"
                              style={{ backgroundColor: getColorHex(newVariantColor, customColors) }}
                            />
                            <span className="font-semibold text-[#0F172A] truncate">{newVariantColor}</span>
                            <span className="text-[11px] font-mono text-[#64748B]">
                              ({getColorHex(newVariantColor, customColors)})
                            </span>
                          </>
                        ) : (
                          <>
                            <Palette className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-[#64748B]">Choose a color from dropdown or create custom...</span>
                          </>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isColorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (newVariantColor) {
                        handleAddVariant();
                      } else {
                        setIsColorDropdownOpen(true);
                      }
                    }}
                    disabled={!newVariantColor && isColorDropdownOpen}
                  >
                    <Plus className="w-4 h-4" />
                    Add Color
                  </Button>
                </div>

                {/* Dropdown Menu Popover */}
                {isColorDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl p-3 space-y-3">
                    {/* Search box inside dropdown */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter color name to search..."
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB]"
                        autoFocus
                      />
                    </div>

                    {/* Color List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        <span>Available Colors ({filteredColors.length})</span>
                        <span>Hex Code</span>
                      </div>

                      {filteredColors.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[#64748B] space-y-1">
                          <p>No matching color found</p>
                          <p className="text-[11px] text-slate-400">
                            You can create &quot;{colorSearch}&quot; as a new store color below.
                          </p>
                        </div>
                      ) : (
                        filteredColors.map((c) => {
                          const isAlreadyAdded = variants.some(
                            (v) => v.color.toLowerCase() === c.name.toLowerCase()
                          );
                          const isSelected = newVariantColor.toLowerCase() === c.name.toLowerCase();

                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setNewVariantColor(c.name);
                                handleAddVariant(c.name);
                                setIsColorDropdownOpen(false);
                                setColorSearch("");
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors group ${
                                isSelected
                                  ? "bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold"
                                  : "hover:bg-slate-50 text-[#0F172A]"
                              } ${isAlreadyAdded ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-sm"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="font-medium text-[#0F172A] group-hover:text-[#2563EB] truncate">
                                  {c.name}
                                </span>
                                {c.isCustom && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                    Custom
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[11px] text-[#64748B] uppercase">
                                  {c.hex}
                                </span>
                                {isAlreadyAdded ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    <Check className="w-3 h-3" />
                                    Added
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                    + Add
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Bottom: Create New Custom Color */}
                    <div className="pt-2 border-t border-slate-100">
                      {!isCreatingCustomColor ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingCustomColor(true);
                            if (colorSearch.trim()) {
                              setCustomColorName(colorSearch.trim());
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#2563EB] hover:bg-blue-50/30 text-xs font-semibold text-[#2563EB] transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Custom Color & Save to Store</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                              Create New Store Color
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsCreatingCustomColor(false)}
                              className="text-slate-400 hover:text-slate-700 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
                                Color Name
                              </label>
                              <Input
                                placeholder="Enter custom color name"
                                value={customColorName}
                                onChange={(e) => setCustomColorName(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
                                Color Code (Hex)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={customColorHex.startsWith("#") ? customColorHex : `#${customColorHex}`}
                                  onChange={(e) => setCustomColorHex(e.target.value)}
                                  className="w-10 h-10 rounded-lg border border-slate-300 bg-white cursor-pointer p-0.5 shrink-0"
                                />
                                <Input
                                  placeholder="Enter hex code (e.g. #3B82F6)"
                                  value={customColorHex}
                                  onChange={(e) => setCustomColorHex(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setIsCreatingCustomColor(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={isSavingCustomColor}
                                onClick={handleCreateCustomColor}
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Save & Add Color
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {variants.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center space-y-1 bg-slate-50/50">
                  <p className="text-xs text-[#0F172A] font-semibold">No color variants added yet</p>
                  <p className="text-[11px] text-[#64748B]">
                    Select a color from the dropdown above or create a custom one to configure inventory and upload product images for each color.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                            style={{
                              backgroundColor: getColorHex(variant.color, customColors),
                            }}
                          />
                          <span className="text-sm font-bold text-[#0F172A]">{variant.color}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          aria-label={`Remove ${variant.color} variant`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sub-option 1: Manage Stock Availability */}
                      {colorStockMode === "AVAILABILITY" && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                          <div>
                            <span className="text-xs font-semibold text-[#0F172A] block">
                              Variant Availability:
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              {variant.inStock ? "Available for purchase" : "Marked unavailable"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleVariantChange(idx, "inStock", true)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                variant.inStock
                                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
                                  : "bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                              }`}
                            >
                              In Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVariantChange(idx, "inStock", false)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                !variant.inStock
                                  ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30"
                                  : "bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                              }`}
                            >
                              Out of Stock
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sub-option 2: Manage Stock Quantity */}
                      {colorStockMode === "QUANTITY" && (
                        <div className="space-y-1.5 p-2.5 rounded-lg bg-white border border-slate-200">
                          <label className="text-xs font-semibold text-[#0F172A]">
                            Stock Units ({variant.color}) *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.stock}
                            onChange={(e) => {
                              const num = parseInt(e.target.value, 10);
                              const safeNum = isNaN(num) ? 0 : Math.max(0, num);
                              setVariants((prev) =>
                                prev.map((v, i) =>
                                  i === idx ? { ...v, stock: safeNum, inStock: safeNum > 0 } : v
                                )
                              );
                            }}
                            placeholder="Enter variant stock quantity"
                          />
                          <p className="text-[11px] text-[#64748B]">
                            {variant.stock <= 0
                              ? "0 units — this color variant will be marked Out of Stock and cannot be purchased."
                              : `${variant.stock} units available for customer purchase.`}
                          </p>
                        </div>
                      )}

                      {/* Sub-option 3: Color Variant Product Images */}
                      <div className="pt-3 border-t border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#0F172A]">
                              Product Images ({variant.color})
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {(variant.images?.length || 0)} {variant.images?.length === 1 ? "image" : "images"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748B]">
                            Shows in gallery when customer selects {variant.color}
                          </span>
                        </div>

                        {/* Variant images thumbnail preview */}
                        {variant.images && variant.images.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                            {variant.images.map((img, imgIdx) => (
                              <div
                                key={img.publicId || imgIdx}
                                className="relative aspect-square rounded-lg bg-slate-100 border border-slate-200 overflow-hidden group shadow-sm"
                              >
                                <Image
                                  src={img.url}
                                  alt={`${variant.color} image ${imgIdx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantImage(idx, imgIdx)}
                                  className="absolute top-1 right-1 p-1 rounded bg-slate-900/70 text-white hover:text-rose-300 transition-colors"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                {imgIdx === 0 && (
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#2563EB] text-white">
                                    Main
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Controls for this variant */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-slate-300 hover:border-[#2563EB] rounded-xl cursor-pointer bg-white hover:bg-blue-50/20 transition-all text-xs text-[#0F172A]">
                            <Upload className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                            <span className="font-semibold truncate">
                              {uploadingVariantIdx === idx
                                ? "Uploading to Cloudinary..."
                                : `Upload ${variant.color} images`}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={uploadingVariantIdx === idx}
                              onChange={(e) => {
                                handleVariantFileUpload(idx, e.target.files);
                                e.target.value = "";
                              }}
                              className="hidden"
                            />
                          </label>

                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Enter image URL"
                              value={variantUrlInputs[idx] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setVariantUrlInputs((prev) => ({ ...prev, [idx]: val }));
                              }}
                              className="text-xs h-9"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAddVariantImageUrl(idx)}
                              disabled={!variantUrlInputs[idx]?.trim()}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Taxonomy & Visibility */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4 border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold text-[#0F172A]">Organization</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
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
              <label className="text-xs font-semibold text-[#0F172A]">Brand</label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
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

          <Card className="space-y-4 border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold text-[#0F172A]">Visibility & Status</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Product Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm"
              >
                <option value="ACTIVE">Active (Live in store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="INACTIVE">Inactive (Archived)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Featured Product</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Highlight on homepage</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.featured}
                onClick={() => setFormData((prev) => ({ ...prev, featured: !prev.featured }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  formData.featured ? "bg-[#2563EB]" : "bg-slate-200"
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
