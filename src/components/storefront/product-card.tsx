"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, calculateDiscountPercentage, buildWhatsAppUrl } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingBag, MessageCircle, Check, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStoreLink } from "@/lib/store-url";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice?: number | string | null;
    stock: number;
    images?: Array<{ url: string; altText?: string | null }>;
    category?: { name: string } | null;
  };
  storeSlug: string;
  storeName: string;
  whatsappNumber?: string | null;
  themeColor?: string | null;
  // Design settings from Live Store Design
  cardRadiusClass?: string;
  showSalePrice?: boolean;
  showOriginalPrice?: boolean;
}

export function ProductCard({
  product,
  storeSlug,
  storeName,
  whatsappNumber,
  themeColor,
  cardRadiusClass = "rounded-2xl",
  showSalePrice = true,
  showOriginalPrice = true,
}: ProductCardProps) {
  const { addItem, items } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const [added, setAdded] = React.useState(false);

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice ? Number(product.salePrice) : null;
  const isSale = salePriceNum !== null && salePriceNum < priceNum;
  const discount = isSale ? calculateDiscountPercentage(priceNum, salePriceNum) : 0;

  const isOutOfStock = product.stock <= 0;
  const cartItem = items.find((i) => i.productId === product.id);
  const imageUrl = product.images?.[0]?.url;

  // Active price respects showSalePrice setting
  const displayPrice = isSale && showSalePrice ? salePriceNum! : priceNum;

  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: priceNum,
        salePrice: salePriceNum,
        imageUrl: imageUrl,
        stock: product.stock,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      salePrice: salePriceNum,
      imageUrl: imageUrl,
      stock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const productUrl = getStoreLink(storeSlug, `/products/${product.slug}`);

  return (
    <div
      className={cn(
        "group relative border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl",
        cardRadiusClass
      )}
      style={{
        backgroundColor: "var(--store-surface, #0f172a)",
        borderColor: "var(--store-border, rgba(255,255,255,0.1))",
        color: "var(--store-page-text, #f8fafc)",
      }}
    >
      {/* Product Image Link */}
      <Link href={productUrl} className="relative block aspect-square overflow-hidden bg-slate-950/20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/40 text-slate-500">
            <ShoppingBag className="w-10 h-10 stroke-1 mb-2 opacity-50" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isSale && showSalePrice && discount > 0 && (
            <Badge variant="danger" size="sm">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock ? (
            <Badge variant="neutral" size="sm">
              Out of stock
            </Badge>
          ) : product.stock <= 5 ? (
            <Badge variant="warning" size="sm">
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>

        {/* Wishlist Button on Card */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/40 backdrop-blur-md text-white hover:bg-black/70 hover:scale-110 shadow-sm"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              inWishlist ? "text-red-500 fill-red-500" : "text-white"
            )}
          />
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <span
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1 opacity-90"
              style={{ color: "var(--store-primary, #3b82f6)" }}
            >
              {product.category.name}
            </span>
          )}
          <Link href={productUrl}>
            <h3
              className="text-sm font-semibold hover:opacity-80 transition-opacity line-clamp-2"
              style={{ color: "var(--store-page-text, #f8fafc)" }}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        <div
          className="pt-3 mt-3 border-t flex items-center justify-between gap-2"
          style={{ borderColor: "var(--store-border, rgba(255,255,255,0.08))" }}
        >
          {/* Price display */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              {showSalePrice && (
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--store-page-text, #ffffff)" }}
                >
                  {formatCurrency(displayPrice)}
                </span>
              )}
              {!showSalePrice && (
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--store-page-text, #ffffff)" }}
                >
                  {formatCurrency(priceNum)}
                </span>
              )}
              {isSale && showSalePrice && showOriginalPrice && (
                <span
                  className="text-xs line-through"
                  style={{ color: "var(--store-page-muted, #64748b)" }}
                >
                  {formatCurrency(priceNum)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add or WhatsApp Button */}
          <div className="flex items-center gap-1.5">
            {whatsappNumber && (
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  `Hi ${storeName}, I want to order "${product.name}" for ${formatCurrency(displayPrice)}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                title="Order on WhatsApp"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title={isOutOfStock ? "Out of stock" : "Add to Cart"}
              className="flex items-center justify-center p-2 rounded-xl font-medium transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--store-button-bg, #22c55e)",
                color: "var(--store-button-text, #ffffff)",
                borderRadius: "var(--store-button-radius, 10px)",
              }}
            >
              {added ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartItem && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-slate-900 rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
                      {cartItem.quantity}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
