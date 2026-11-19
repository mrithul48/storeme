// packages/validation/src/index.ts
// Shared Zod validation schemas for LaunchCommerce

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  deviceId: z.string().min(1, "Device ID is required").optional(),
  deviceName: z.string().min(1).optional(),
  platform: z.enum(["android", "ios", "web"]).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

export const internalTokenHeaderSchema = z.object({
  alg: z.literal("HS256"),
  typ: z.literal("LC-INTERNAL+JWT"),
  kid: z.string().min(1).optional(),
});

export const internalTokenClaimsSchema = z.object({
  iss: z.literal("launchcommerce-nextjs"),
  aud: z.literal("launchcommerce-nestjs"),
  sub: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["USER", "PLATFORM_ADMIN"]),
  storeId: z.string().optional(),
  iat: z.number().int(),
  exp: z.number().int(),
  jti: z.string().uuid("jti must be a valid UUID v4"),
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const productImageSchema = z.object({
  url: z.string().url("Valid image URL is required"),
  publicId: z.string().min(1, "publicId is required"),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, "Color name is required"),
  manageAvailability: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(true),
  manageQuantity: z.boolean().optional().default(false),
  stock: z.number().int().min(0).optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  images: z.array(productImageSchema).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than zero"),
  salePrice: z.coerce.number().positive("Sale price must be greater than zero").optional().nullable(),
  sku: z.string().optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).optional().default(0),
  inStock: z.boolean().optional().default(true),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional().default("ACTIVE"),
  featured: z.boolean().optional().default(false),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  images: z.array(productImageSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  featured: z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean().optional()),
  sortBy: z.enum(["name", "price", "stock", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const queryCategorySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// BRAND SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
  logoPublicId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

export const updateBrandSchema = createBrandSchema.partial();

export const queryBrandSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const adjustStockSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  variantId: z.string().optional(),
  operation: z.enum(["INCREMENT", "DECREMENT", "SET"]),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  reason: z.string().optional(),
});

export const queryInventorySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  lowStockOnly: z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean().optional()),
  threshold: z.coerce.number().int().min(0).optional().default(5),
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  variantId: z.string().optional(),
  variantColor: z.string().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "Order must have at least one item"),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional().nullable(),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
  }),
  paymentMethod: z.enum(["COD", "RAZORPAY", "WHATSAPP"]).optional().default("COD"),
  orderChannel: z.enum(["COD", "ONLINE_PAYMENT", "WHATSAPP"]).optional(),
  notes: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  notes: z.string().optional(),
});

export const queryOrderSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  orderChannel: z.enum(["COD", "ONLINE_PAYMENT", "WHATSAPP"]).optional(),
  customerId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

// Types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type QueryCategoryInput = z.infer<typeof queryCategorySchema>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type QueryBrandInput = z.infer<typeof queryBrandSchema>;

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type QueryOrderInput = z.infer<typeof queryOrderSchema>;
