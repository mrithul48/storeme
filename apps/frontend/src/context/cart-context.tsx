"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/types/order.types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  storeSlug,
}: {
  children: React.ReactNode;
  storeSlug: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `store_cart_${storeSlug}`;

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Persist cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to persist cart to localStorage", e);
      }
    }
  }, [items, isLoaded, storageKey]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        item.variantId
          ? i.productId === item.productId && i.variantId === item.variantId
          : i.productId === item.productId && !i.variantId
      );
      const limit = typeof item.stock === "number" && item.stock > 0 ? item.stock : 9999;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, limit);
        return prev.map((i) =>
          (item.variantId
            ? i.productId === item.productId && i.variantId === item.variantId
            : i.productId === item.productId && !i.variantId)
            ? { ...i, quantity: newQty }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, limit) }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) =>
        variantId
          ? !(i.productId === productId && i.variantId === variantId)
          : i.productId !== productId
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const match = variantId
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId;
        if (match) {
          const limit = typeof item.stock === "number" && item.stock > 0 ? item.stock : 9999;
          return { ...item, quantity: Math.min(quantity, limit) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const activePrice = item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
      ? item.salePrice
      : item.price;
    return sum + activePrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
