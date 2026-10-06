"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency, calculateDiscountPercentage, buildWhatsAppUrl } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingBag, MessageCircle, Check, Plus, Minus, ShieldCheck, Truck, RefreshCw, Ban, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StoreSettings {
  ordersEnabled?: boolean | null;
  codEnabled?: boolean | null;
  onlinePaymentEnabled?: boolean | null;
  whatsappOrderEnabled?: boolean | null;
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
    images: Array<{ id: string; url: string; altText?: string | null }>;
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

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice ? Number(product.salePrice) : null;
  const isSale = salePriceNum !== null && salePriceNum < priceNum;
  const discount = isSale ? calculateDiscountPercentage(priceNum, salePriceNum) : 0;
  const isOutOfStock = product.stock <= 0;
  const wishlisted = isInWishlist(product.id);

  const currentImage = product.images?.[0]?.url ? product.images[selectedImageIndex]?.url || product.images[0].url : undefined;
  const whatsappNumber = store.company?.whatsapp || store.company?.phone;

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
        stock: product.stock,
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
        stock: product.stock,
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
      stock: product.stock,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Product Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
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
              <Badge variant="danger" size="md">
                Save {discount}%
              </Badge>
            )}
            {isOutOfStock ? (
              <Badge variant="neutral" size="md">
                Out of Stock
              </Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning" size="md">
                Only {product.stock} units left
              </Badge>
            ) : null}
          </div>

          {/* Wishlist Floating Button on Image */}
          <button
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white transition shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-300"
              }`}
            />
          </button>
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
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
      <div className="flex flex-col justify-between space-y-6">
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

          {/* Quantity Selector — only shown when a cart-based checkout method is enabled */}
          {!isOutOfStock && cartCheckoutAvailable && (
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block opacity-70">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-700/80 rounded-xl bg-slate-900 overflow-hidden">
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
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs opacity-70">
                  {product.stock} available in stock
                </span>
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
                className="flex-1"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
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
                }}
              >
                Buy Now
              </Button>

              <button
                onClick={handleToggleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`p-3.5 rounded-xl border transition flex items-center justify-center ${
                  wishlisted
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                    : "border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-rose-500" : ""}`} />
              </button>
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
              className="w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/25 text-sm font-semibold transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              Direct Order via WhatsApp
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

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-6 text-center text-[11px] text-slate-400">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>100% Authentic</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Fast Dispatch</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>Verified Store</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
