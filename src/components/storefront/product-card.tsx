"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, calculateDiscountPercentage, buildWhatsAppUrl } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingBag, MessageCircle, Check, Heart } from "lucide-react";
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
    manageStockQuantity?: boolean;
    manageStockAvailability?: boolean;
    inStock?: boolean;
    variants?: Array<{
      id: string;
      color: string;
      manageAvailability: boolean;
      inStock: boolean;
      manageQuantity: boolean;
      stock: number;
    }>;
    images?: Array<{ url: string; altText?: string | null }>;
    brand?: string | { name: string } | null;
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

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const isOutOfStock = hasVariants
    ? product.variants!.every(
        (v: any) =>
          (v.manageAvailability && !v.inStock) || (v.manageQuantity && v.stock <= 0)
      )
    : product.manageStockAvailability && product.inStock === false
    ? true
    : Boolean(product.manageStockQuantity && product.stock <= 0);
  const isLowStock =
    !isOutOfStock &&
    !hasVariants &&
    Boolean(product.manageStockQuantity) &&
    product.stock <= 5;
  const cartItem = items.find((i) => i.productId === product.id);
  const imageUrl = product.images?.[0]?.url;

  const displayPrice = isSale && showSalePrice ? salePriceNum! : priceNum;
  const showStrike = isSale && showSalePrice && showOriginalPrice;
  const showDiscountTag = isSale && showSalePrice && discount > 0;

  const brandName =
    typeof product.brand === "string" ? product.brand : product.brand?.name;
  const topLabel = brandName || product.category?.name;

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
        imageUrl,
        stock: product.stock,
      });
    }
  };

  const productUrl = getStoreLink(storeSlug, `/products/${product.slug}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (hasVariants) {
      // Direct customer to product page to pick variant color
      window.location.href = productUrl;
      return;
    }

    const maxStock = product.manageStockQuantity ? product.stock : 9999;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      salePrice: salePriceNum,
      imageUrl,
      stock: maxStock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buttonLabel = isOutOfStock
    ? "Sold out"
    : added
    ? "Added"
    : hasVariants
    ? "Select Color"
    : cartItem
    ? `In cart (${cartItem.quantity})`
    : "Add to cart";

  return (
    <article
      className="group flex flex-col gap-3"
      style={{ color: "var(--store-page-text, #f8fafc)" }}
    >
      {/* Image: tall portrait frame, no outer card border */}
      <div className={cn("relative overflow-hidden", cardRadiusClass)}>
        <Link
          href={productUrl}
          className="relative block aspect-[4/5] w-full"
          style={{ backgroundColor: "var(--store-surface, #0f172a)" }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.images?.[0]?.altText || product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                isOutOfStock && "grayscale opacity-60"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2"
              style={{ color: "var(--store-page-muted, #64748b)" }}
            >
              <ShoppingBag className="h-8 w-8 stroke-[1.25]" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </Link>

        {/* Discount: flat tab pinned to the corner */}
        {showDiscountTag && (
          <span
            className="pointer-events-none absolute left-0 top-3 py-1 pl-2 text-[11px] sm:top-4 sm:pl-2.5 sm:text-xs font-semibold tabular-nums"
            style={{
              backgroundColor: "var(--store-primary, #3b82f6)",
              color: "var(--store-button-text, #ffffff)",
              borderTopRightRadius: "999px",
              borderBottomRightRadius: "999px",
              paddingRight: "0.75rem",
            }}
          >
            {discount}% off
          </span>
        )}

        {/* Wishlist: no background, icon only */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-3 sm:top-3"
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]",
              inWishlist ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
        </button>

        {/* Quick actions: icon buttons, bottom right, same row */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 sm:bottom-3 sm:right-3 sm:gap-2">
          {whatsappNumber && (
            <a
              href={buildWhatsAppUrl(
                whatsappNumber,
                `Hi ${storeName}, I want to order "${product.name}" for ${formatCurrency(displayPrice)}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message on WhatsApp"
              title="Message on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#25d366] shadow-md transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={buttonLabel}
            title={buttonLabel}
            className="relative flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: "var(--store-button-bg, #22c55e)",
              color: "var(--store-button-text, #ffffff)",
            }}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {cartItem && !added && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-slate-900 shadow">
                {cartItem.quantity}
              </span>
            )}
          </button>
        </div>

        {/* Stock note sits on the image edge so it never competes with the price */}
        {(isOutOfStock || isLowStock) && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs font-medium text-white backdrop-blur-sm">
            {isOutOfStock ? "Out of stock" : `Only ${product.stock} left`}
          </span>
        )}
      </div>

      {/* Text block: label, one-line name, price */}
      <div className="flex flex-1 flex-col gap-0.5 px-0.5">
        {topLabel && (
          <p
            className="truncate text-xs"
            style={{ color: "var(--store-page-muted, #64748b)" }}
          >
            {topLabel}
          </p>
        )}

        <Link href={productUrl} className="min-w-0" title={product.name}>
          <h2
            className="truncate text-sm font-medium leading-snug sm:text-[15px] uppercase"
            style={{ color: "var(--store-page-subheading, #f1f5f9)" }}
          >
            {product.name}
          </h2>
        </Link>

        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className="text-[15px] font-semibold tabular-nums"
            style={{ color: "var(--store-page-paragraph, var(--store-page-text, #f8fafc))" }}
          >
            {formatCurrency(displayPrice)}
          </p>
          {showStrike && (
            <span
              className="text-xs tabular-nums line-through"
              style={{ color: "var(--store-page-muted, #64748b)" }}
            >
              {formatCurrency(priceNum)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}