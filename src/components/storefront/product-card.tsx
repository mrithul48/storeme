"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, calculateDiscountPercentage, buildWhatsAppUrl } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { ShoppingBag, MessageCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

export function ProductCard({
  product,
  storeSlug,
  storeName,
  whatsappNumber,
  themeColor,
}: ProductCardProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = React.useState(false);

  const priceNum = Number(product.price);
  const salePriceNum = product.salePrice ? Number(product.salePrice) : null;
  const isSale = salePriceNum !== null && salePriceNum < priceNum;
  const discount = isSale ? calculateDiscountPercentage(priceNum, salePriceNum) : 0;

  const isOutOfStock = product.stock <= 0;
  const cartItem = items.find((i) => i.productId === product.id);
  const imageUrl = product.images?.[0]?.url;

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

  const productUrl = `/store/${storeSlug}/products/${product.slug}`;

  return (
    <div className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden flex flex-col transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5">
      {/* Product Image Link */}
      <Link href={productUrl} className="relative block aspect-square overflow-hidden bg-slate-950">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
            <ShoppingBag className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSale && (
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
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              {product.category.name}
            </span>
          )}
          <Link href={productUrl}>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
          {/* Price display */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white">
                {formatCurrency(isSale ? salePriceNum! : priceNum)}
              </span>
              {isSale && (
                <span className="text-xs text-slate-500 line-through">
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
                  `Hi ${storeName}, I want to order "${product.name}" for ${formatCurrency(
                    isSale ? salePriceNum! : priceNum
                  )}.`
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
              className="flex items-center justify-center p-2 rounded-xl text-white font-medium transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: themeColor || "#3b82f6",
              }}
            >
              {added ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartItem && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white text-slate-900 rounded-full text-[9px] font-bold flex items-center justify-center">
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
