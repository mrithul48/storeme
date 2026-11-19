// src/lib/utils.ts
// Core utility functions

import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind classes safely (requires clsx)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a suffix if needed
 */
export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  const slug = generateSlug(base);
  if (!existingSlugs.includes(slug)) return slug;

  let counter = 2;
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++;
  }
  return `${slug}-${counter}`;
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Generate a WhatsApp URL
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
}

export const buildWhatsAppUrl = generateWhatsAppUrl;

/**
 * Calculate discount percentage between original price and sale price
 */
export function calculateDiscountPercentage(price: number, salePrice: number): number {
  if (!price || price <= 0 || !salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/**
 * Generate a random order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Safely parse JSON, returning null on failure
 */
export function safeJsonParse<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Convert Prisma Decimal to number
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Get button radius class based on ButtonShape enum
 */
export function getButtonRadiusClass(
  shape: "SQUARE" | "MEDIUM_ROUNDED" | "FULLY_ROUNDED"
): string {
  const map = {
    SQUARE: "rounded-none",
    MEDIUM_ROUNDED: "rounded-md",
    FULLY_ROUNDED: "rounded-full",
  };
  return map[shape] ?? "rounded-md";
}

