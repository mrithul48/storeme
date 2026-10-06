"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStoreLink } from "@/lib/store-url";

export function WishlistDrawer({ storeSlug }: { storeSlug: string }) {
  const { items, removeItem, isOpen, setIsOpen } = useWishlist();
  const { addItem: addToCart } = useCart();

  if (!isOpen) return null;

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      salePrice: item.salePrice,
      imageUrl: item.imageUrl || undefined,
      stock: item.stock ?? 99,
    });
    removeItem(item.productId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md shadow-2xl flex flex-col transition-colors duration-200"
          style={{
            backgroundColor: "var(--store-navbar-bg, #ffffff)",
            color: "var(--store-navbar-text, #0f172a)",
            borderLeft: "1px solid var(--store-border, rgba(0,0,0,0.08))",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b"
            style={{ borderColor: "var(--store-border, rgba(0,0,0,0.08))" }}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--store-navbar-text, inherit)" }}>
                My Wishlist ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: "var(--store-navbar-text, inherit)" }}
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base" style={{ color: "var(--store-navbar-text, inherit)" }}>
                    Your wishlist is empty
                  </h3>
                  <p className="text-sm opacity-70">
                    Save items you like to view or purchase them later.
                  </p>
                </div>
                <Link
                  href={getStoreLink(storeSlug, "/shop")}
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                  }}
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const activePrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-2xl border transition-all"
                    style={{
                      borderColor: "var(--store-border, rgba(0,0,0,0.08))",
                      backgroundColor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <ShoppingBag className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={getStoreLink(storeSlug, `/products/${item.slug}`)}
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-semibold hover:underline line-clamp-1 block"
                          style={{ color: "var(--store-navbar-text, inherit)" }}
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold" style={{ color: "var(--store-primary, #3b82f6)" }}>
                            {formatCurrency(activePrice)}
                          </span>
                          {item.salePrice && item.salePrice < item.price && (
                            <span className="text-xs line-through opacity-50">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between gap-2 mt-2 pt-2 border-t"
                        style={{ borderColor: "var(--store-border, rgba(0,0,0,0.08))" }}
                      >
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                          style={{
                            backgroundColor: "var(--store-button-bg, #22c55e)",
                            color: "var(--store-button-text, #ffffff)",
                          }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
