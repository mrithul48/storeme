"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartDrawer({ storeSlug }: { storeSlug: string }) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md border-l flex flex-col shadow-2xl transition-colors duration-200"
          style={{
            backgroundColor: "var(--store-navbar-bg, #ffffff)",
            color: "var(--store-navbar-text, #0f172a)",
            borderColor: "var(--store-border, rgba(0,0,0,0.08))",
          }}
        >
          {/* Header */}
          <div
            className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--store-border, rgba(0,0,0,0.08))" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: "var(--store-primary, #3b82f6)" }} />
              <h2 className="text-lg font-bold" style={{ color: "var(--store-navbar-text, inherit)" }}>
                Your Cart
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "var(--store-primary, #3b82f6)",
                }}
              >
                {totalItems} items
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: "var(--store-navbar-text, inherit)" }}
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center opacity-70"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                >
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium" style={{ color: "var(--store-navbar-text, inherit)" }}>
                    Your cart is empty
                  </p>
                  <p className="text-sm opacity-60">
                    Add products from the store to see them here.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Continue Browsing
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const activePrice =
                  item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
                    ? item.salePrice
                    : item.price;
                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-xl border items-center transition-all"
                    style={{
                      borderColor: "var(--store-border, rgba(0, 0, 0, 0.08))",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div className="relative w-16 h-16 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-50 text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--store-navbar-text, inherit)" }}
                      >
                        {item.name}
                      </h4>
                      <p
                        className="text-sm font-bold mt-0.5"
                        style={{ color: "var(--store-primary, #3b82f6)" }}
                      >
                        {formatCurrency(activePrice)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex items-center border rounded-lg overflow-hidden"
                          style={{
                            borderColor: "var(--store-border, rgba(0, 0, 0, 0.15))",
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                            style={{ color: "var(--store-navbar-text, inherit)" }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className="px-2 text-xs font-semibold"
                            style={{ color: "var(--store-navbar-text, inherit)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 disabled:opacity-30"
                            style={{ color: "var(--store-navbar-text, inherit)" }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="opacity-50 hover:opacity-100 hover:text-rose-500 p-1 transition-colors"
                          title="Remove item"
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

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div
              className="p-5 border-t space-y-4"
              style={{
                backgroundColor: "var(--store-navbar-bg, #ffffff)",
                borderColor: "var(--store-border, rgba(0, 0, 0, 0.08))",
              }}
            >
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="opacity-70" style={{ color: "var(--store-navbar-text, inherit)" }}>
                  Subtotal
                </span>
                <span className="text-xl font-bold" style={{ color: "var(--store-navbar-text, inherit)" }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs opacity-60">
                Taxes & shipping calculated at checkout.
              </p>
              <Link
                href={`/store/${storeSlug}/checkout`}
                onClick={() => setIsOpen(false)}
                className="w-full block"
              >
                <button
                  type="button"
                  className="w-full py-3 px-4 font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  style={{
                    backgroundColor: "var(--store-button-bg, #22c55e)",
                    color: "var(--store-button-text, #ffffff)",
                    borderRadius: "var(--store-button-radius, 10px)",
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
