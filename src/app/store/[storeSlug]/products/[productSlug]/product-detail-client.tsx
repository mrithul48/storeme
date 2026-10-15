"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency, calculateDiscountPercentage, buildWhatsAppUrl } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingBag, MessageCircle, Check, Plus, Minus, Ban, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getColorHex } from "@/lib/constants/colors";

interface StoreSettings {
  ordersEnabled?: boolean | null;
  codEnabled?: boolean | null;
  onlinePaymentEnabled?: boolean | null;
  whatsappOrderEnabled?: boolean | null;
  stockManagementType?: string | null;
  colorWiseStockType?: string | null;
}

export interface ProductVariant {
  id: string;
  color: string;
  manageAvailability: boolean;
  inStock: boolean;
  manageQuantity: boolean;
  stock: number;
  sortOrder: number;
  images?: Array<{ id?: string; url: string; altText?: string | null }>;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number | string | any;
    salePrice?: number | string | any | null;
    sku?: string | null;
    stock: number;
    manageStockQuantity?: boolean;
    manageStockAvailability?: boolean;
    inStock?: boolean;
    images: Array<{ id: string; url: string; altText?: string | null }>;
    variants?: ProductVariant[];
    category?: { name: string } | null;
  };
  store: {
    name: string;
    slug: string;
    company?: {
      whatsapp?: string | null;
      phone?: string | null;
    } | null;
    settings?: StoreSettings | null;
    theme?: {
      primaryColor?: string | null;
      buttonShape?: string | null;
    } | null;
  };
}

export function ProductDetailClient({ product, store }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  });

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice ? Number(product.salePrice) : null;
  const isSale = salePriceNum !== null && salePriceNum < priceNum;
  const discount = isSale ? calculateDiscountPercentage(priceNum, salePriceNum) : 0;

  // Store-level stock management settings
  const stockMode = store.settings?.stockManagementType; // "AVAILABILITY" | "QUANTITY" | "COLOR_WISE"
  const colorStockMode = store.settings?.colorWiseStockType; // "AVAILABILITY" | "QUANTITY"

  // Determine availability based on store settings or product defaults
  const isOutOfStock = React.useMemo(() => {
    if (stockMode === "COLOR_WISE") {
      if (hasVariants && selectedVariant) {
        if (colorStockMode === "QUANTITY") {
          return selectedVariant.stock <= 0;
        } else {
          return selectedVariant.inStock === false;
        }
      }
      return false;
    }

    if (stockMode === "QUANTITY") {
      return product.stock <= 0 || product.inStock === false;
    }

    if (stockMode === "AVAILABILITY") {
      return product.inStock === false;
    }

    // Fallback if store stock management not yet configured
    if (hasVariants && selectedVariant) {
      if (selectedVariant.manageAvailability && !selectedVariant.inStock) {
        return true;
      }
      if (selectedVariant.manageQuantity && selectedVariant.stock <= 0) {
        return true;
      }
      return false;
    }

    if (product.manageStockAvailability && product.inStock === false) {
      return true;
    }
    if (product.manageStockQuantity && product.stock <= 0) {
      return true;
    }
    return false;
  }, [stockMode, colorStockMode, hasVariants, selectedVariant, product]);

  const isQuantityTracked = React.useMemo(() => {
    if (stockMode === "COLOR_WISE") {
      return colorStockMode === "QUANTITY";
    }
    if (stockMode === "QUANTITY") {
      return true;
    }
    if (stockMode === "AVAILABILITY") {
      return false;
    }
    if (hasVariants && selectedVariant) {
      return Boolean(selectedVariant.manageQuantity);
    }
    return Boolean(product.manageStockQuantity);
  }, [stockMode, colorStockMode, hasVariants, selectedVariant, product]);

  const maxStockAllowed = React.useMemo(() => {
    if (!isQuantityTracked) return 9999;
    if (stockMode === "COLOR_WISE" && hasVariants && selectedVariant) {
      return Math.max(0, selectedVariant.stock);
    }
    return Math.max(0, product.stock);
  }, [isQuantityTracked, stockMode, hasVariants, selectedVariant, product]);

  const currentStockCount = React.useMemo(() => {
    if (stockMode === "COLOR_WISE" && hasVariants && selectedVariant) {
      return selectedVariant.stock;
    }
    return product.stock;
  }, [stockMode, hasVariants, selectedVariant, product]);

  const isLowStock = React.useMemo(() => {
    if (isOutOfStock || !isQuantityTracked) return false;
    return currentStockCount <= 5;
  }, [isOutOfStock, isQuantityTracked, currentStockCount]);

  const wishlisted = isInWishlist(product.id);

  // Active gallery images: If selected variant has separate images, display them; otherwise fallback to main product images
  const activeImages = React.useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product.images || [];
  }, [selectedVariant, product.images]);

  const currentImage = activeImages?.[0]?.url
    ? activeImages[selectedImageIndex]?.url || activeImages[0].url
    : undefined;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;

  // Image card border radius logic:
  // - Sharp corner (SQUARE) -> sharp corner ("0px")
  // - Fully rounded (FULLY_ROUNDED) -> rounded corner standard ("10px")
  // - Rounded corners standard (MEDIUM_ROUNDED) -> rounded corner standard ("10px")
  const imageRadius = React.useMemo(() => {
    const shape = store.theme?.buttonShape;
    if (shape === "SQUARE") return "0px";
    if (shape === "FULLY_ROUNDED" || shape === "MEDIUM_ROUNDED") return "10px";
    return "var(--store-image-radius, 10px)";
  }, [store.theme?.buttonShape]);

  // ── Order method flags (default to true when settings are absent) ──────────
  const settings = store.settings;
  const ordersEnabled      = settings?.ordersEnabled      !== false;
  const codEnabled         = settings?.codEnabled         !== false;
  const onlinePayEnabled   = settings?.onlinePaymentEnabled !== false;
  const whatsappEnabled    = settings?.whatsappOrderEnabled === true;

  // Cart checkout = COD or online payment is on
  const cartCheckoutAvailable  = ordersEnabled && (codEnabled || onlinePayEnabled);
  // WhatsApp order = explicitly toggled on AND a number exists
  const whatsappOrderAvailable = ordersEnabled && whatsappEnabled && !!whatsappNumber;
  // Any ordering at all
  const anyOrderingAvailable   = cartCheckoutAvailable || whatsappOrderAvailable;

  const handleAddToCart = () => {
    if (isOutOfStock || !cartCheckoutAvailable) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: priceNum,
        salePrice: salePriceNum,
        imageUrl: currentImage,
        stock: maxStockAllowed,
        variantId: selectedVariant?.id,
        variantColor: selectedVariant?.color,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock || !cartCheckoutAvailable) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: priceNum,
        salePrice: salePriceNum,
        imageUrl: currentImage,
        stock: maxStockAllowed,
        variantId: selectedVariant?.id,
        variantColor: selectedVariant?.color,
      },
      quantity
    );
    router.push(`/store/${store.slug}/checkout`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      salePrice: salePriceNum,
      imageUrl: currentImage,
      stock: maxStockAllowed,
      variantId: selectedVariant?.id,
      variantColor: selectedVariant?.color,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Product Image Gallery */}
      <div className="space-y-4">
        <div
          className="relative aspect-square overflow-hidden bg-slate-900 shadow-2xl"
          style={{ borderRadius: imageRadius }}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <ShoppingBag className="w-16 h-16 stroke-1 mb-2 text-slate-600" />
              <span>No image provided</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isSale && (
              <span
                style={{
                  backgroundColor: "var(--store-navbar-bg, #ffffff)",
                  color: "var(--store-navbar-text, #0f172a)",
                  borderColor: "var(--store-border, rgba(0, 0, 0, 0.1))",
                }}
                className="text-xs px-3 py-1 rounded-full font-semibold border shadow-sm"
              >
                Save {discount}%
              </span>
            )}
            {isOutOfStock ? (
              <span
                style={{
                  backgroundColor: "var(--store-navbar-bg, #ffffff)",
                  color: "var(--store-navbar-text, #0f172a)",
                  borderColor: "var(--store-border, rgba(0, 0, 0, 0.1))",
                }}
                className="text-xs px-3 py-1 rounded-full font-semibold border shadow-sm"
              >
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span
                style={{
                  backgroundColor: "var(--store-navbar-bg, #ffffff)",
                  color: "var(--store-navbar-text, #0f172a)",
                  borderColor: "var(--store-border, rgba(0, 0, 0, 0.1))",
                }}
                className="text-xs px-3 py-1 rounded-full font-semibold border shadow-sm"
              >
                Low Stock
              </span>
            ) : null}
          </div>

          {/* Wishlist Floating Button on Image */}
          <button
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-4 right-4 z-10 p-2 transition hover:scale-110 focus:outline-none"
          >
            <Heart
              className={`w-6 h-6 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-white hover:text-rose-400"
              }`}
            />
          </button>
        </div>

        {/* Thumbnail Selector */}
        {activeImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {activeImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImageIndex(idx)}
                style={{ borderRadius: imageRadius }}
                className={`relative w-20 h-20 overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImageIndex === idx
                    ? "border-blue-500 ring-2 ring-blue-500/30 scale-95"
                    : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details & Actions */}
      <div className="flex flex-col gap-5">
        <div className="space-y-4">
          {product.category && (
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {product.category.name}
            </span>
          )}

          <h1
            className="text-2xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--store-page-heading, inherit)" }}
          >
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pt-2">
            <span
              className="text-3xl font-extrabold"
              style={{ color: "var(--store-page-heading, inherit)" }}
            >
              {formatCurrency(isSale ? salePriceNum! : priceNum)}
            </span>
            {isSale && (
              <span className="text-lg opacity-50 line-through">
                {formatCurrency(priceNum)}
              </span>
            )}
          </div>

          {/* Stock Status for products without variants */}
          {!hasVariants && (
            <div className="pt-1">
              <span
                className={`text-xs font-semibold inline-flex items-center gap-1.5 ${
                  isOutOfStock
                    ? "text-rose-400"
                    : isLowStock
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock
                      ? "bg-rose-400"
                      : isLowStock
                      ? "bg-amber-400 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                {isOutOfStock
                  ? "Out of Stock"
                  : isQuantityTracked
                  ? isLowStock
                    ? "Low Stock"
                    : "In Stock"
                  : "In Stock"}
              </span>
            </div>
          )}

          {product.sku && (
            <p className="text-xs opacity-70">
              SKU: <span className="font-mono">{product.sku}</span>
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
                Description
              </h3>
              <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Color Variant Selector (if product has variants) */}
          {hasVariants && product.variants && product.variants.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Select Color: <span className="font-bold text-white ml-1">{selectedVariant?.color}</span>
                </span>
                <span
                  className={`text-xs font-semibold inline-flex items-center gap-1.5 ${
                    isOutOfStock
                      ? "text-rose-400"
                      : isLowStock
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOutOfStock
                        ? "bg-rose-400"
                        : isLowStock
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  {isOutOfStock
                    ? "Out of Stock"
                    : isQuantityTracked
                    ? isLowStock
                      ? "Low Stock"
                      : "In Stock"
                    : "In Stock"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {product.variants.map((v) => {
                  let isVOutOfStock = false;
                  if (stockMode === "COLOR_WISE") {
                    if (colorStockMode === "QUANTITY") {
                      isVOutOfStock = v.stock <= 0;
                    } else {
                      isVOutOfStock = v.inStock === false;
                    }
                  } else {
                    isVOutOfStock =
                      v.manageAvailability && !v.inStock
                        ? true
                        : v.manageQuantity && v.stock <= 0;
                  }
                  const isSelected = selectedVariant?.id === v.id || selectedVariant?.color === v.color;
                  const hex = getColorHex(v.color);

                  return (
                    <button
                      key={v.id || v.color}
                      type="button"
                      title={`${v.color}${isVOutOfStock ? " (Out of stock)" : ""}`}
                      aria-label={`Select color ${v.color}`}
                      disabled={isVOutOfStock}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedImageIndex(0);
                        setQuantity(1);
                      }}
                      className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-blue-500 ring-offset-[var(--store-page-bg,#0b1120)] scale-110"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      } ${isVOutOfStock ? "opacity-35 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{
                        backgroundColor: hex,
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.2) inset",
                      }}
                    >
                      {isVOutOfStock && (
                        <span className="absolute inset-0 m-auto w-full h-[1.5px] bg-red-500 rotate-45 transform pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector — only shown when a cart-based checkout method is enabled */}
          {!isOutOfStock && cartCheckoutAvailable && (
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block opacity-70">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-center border border-slate-700/80 bg-slate-900 overflow-hidden"
                  style={{ borderRadius: "var(--store-button-radius, 10px)" }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStockAllowed, q + 1))}
                    disabled={quantity >= maxStockAllowed}
                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80">

          {/* Cart-based checkout — shown when COD or online payment is enabled */}
          {cartCheckoutAvailable && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 shadow-sm border hover:opacity-90 hover:bg-[var(--store-navbar-bg,#ffffff)] hover:text-[var(--store-navbar-text,#0f172a)] transition-all"
                style={{
                  backgroundColor: "var(--store-navbar-bg, #ffffff)",
                  color: "var(--store-navbar-text, #0f172a)",
                  borderColor: "var(--store-border, rgba(148, 163, 184, 0.3))",
                  borderRadius: "var(--store-button-radius, 10px)",
                }}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag
                      className="w-5 h-5"
                      style={{ color: "var(--store-navbar-text, #0f172a)" }}
                    />
                    <span>Add to Cart</span>
                  </>
                )}
              </Button>

              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1"
                style={{
                  backgroundColor: "var(--store-button-bg, #2563eb)",
                  color: "var(--store-button-text, #ffffff)",
                  borderRadius: "var(--store-button-radius, 10px)",
                }}
              >
                Buy Now
              </Button>
            </div>
          )}

          {/* WhatsApp Direct Order — only shown when explicitly enabled */}
          {whatsappOrderAvailable && (
            <a
              href={buildWhatsAppUrl(
                whatsappNumber!,
                `Hello ${store.name}! I would like to order: ${product.name} (Qty: ${quantity}) for ${formatCurrency(
                  (isSale ? salePriceNum! : priceNum) * quantity
                )}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold transition-all shadow-sm"
              style={{
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              <MessageCircle className="w-4 h-4 text-white fill-white/10" />
              <span>Direct Order via WhatsApp</span>
            </a>
          )}

          {/* Fallback — all ordering methods are disabled */}
          {!anyOrderingAvailable && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-400">
              <Ban className="w-5 h-5 flex-shrink-0 text-slate-500" />
              <p className="text-sm">
                Online ordering is currently unavailable. Please contact the store directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
