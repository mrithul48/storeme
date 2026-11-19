"use strict";
// packages/validation/src/index.ts
// Shared Zod validation schemas for LaunchCommerce
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryOrderSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderItemInputSchema = exports.queryInventorySchema = exports.adjustStockSchema = exports.queryBrandSchema = exports.updateBrandSchema = exports.createBrandSchema = exports.queryCategorySchema = exports.updateCategorySchema = exports.createCategorySchema = exports.queryProductSchema = exports.updateProductSchema = exports.createProductSchema = exports.productVariantSchema = exports.productImageSchema = exports.internalTokenClaimsSchema = exports.internalTokenHeaderSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    deviceId: zod_1.z.string().min(1, "Device ID is required").optional(),
    deviceName: zod_1.z.string().min(1).optional(),
    platform: zod_1.z.enum(["android", "ios", "web"]).optional(),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
    deviceId: zod_1.z.string().min(1, "Device ID is required"),
});
exports.internalTokenHeaderSchema = zod_1.z.object({
    alg: zod_1.z.literal("HS256"),
    typ: zod_1.z.literal("LC-INTERNAL+JWT"),
    kid: zod_1.z.string().min(1).optional(),
});
exports.internalTokenClaimsSchema = zod_1.z.object({
    iss: zod_1.z.literal("launchcommerce-nextjs"),
    aud: zod_1.z.literal("launchcommerce-nestjs"),
    sub: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(["USER", "PLATFORM_ADMIN"]),
    storeId: zod_1.z.string().optional(),
    iat: zod_1.z.number().int(),
    exp: zod_1.z.number().int(),
    jti: zod_1.z.string().uuid("jti must be a valid UUID v4"),
});
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.productImageSchema = zod_1.z.object({
    url: zod_1.z.string().url("Valid image URL is required"),
    publicId: zod_1.z.string().min(1, "publicId is required"),
    altText: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().optional().default(0),
});
exports.productVariantSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    color: zod_1.z.string().min(1, "Color name is required"),
    manageAvailability: zod_1.z.boolean().optional().default(false),
    inStock: zod_1.z.boolean().optional().default(true),
    manageQuantity: zod_1.z.boolean().optional().default(false),
    stock: zod_1.z.number().int().min(0).optional().default(0),
    sortOrder: zod_1.z.number().int().optional().default(0),
    images: zod_1.z.array(exports.productImageSchema).optional(),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required").max(200),
    slug: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    price: zod_1.z.coerce.number().positive("Price must be greater than zero"),
    salePrice: zod_1.z.coerce.number().positive("Sale price must be greater than zero").optional().nullable(),
    sku: zod_1.z.string().optional().nullable(),
    weight: zod_1.z.coerce.number().min(0).optional().nullable(),
    stock: zod_1.z.coerce.number().int().min(0).optional().default(0),
    inStock: zod_1.z.boolean().optional().default(true),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional().default("ACTIVE"),
    featured: zod_1.z.boolean().optional().default(false),
    categoryId: zod_1.z.string().optional().nullable(),
    brandId: zod_1.z.string().optional().nullable(),
    images: zod_1.z.array(exports.productImageSchema).optional().default([]),
    variants: zod_1.z.array(exports.productVariantSchema).optional().default([]),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.queryProductSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
    categoryId: zod_1.z.string().optional(),
    brandId: zod_1.z.string().optional(),
    featured: zod_1.z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), zod_1.z.boolean().optional()),
    sortBy: zod_1.z.enum(["name", "price", "stock", "createdAt", "updatedAt"]).optional().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required").max(100),
    slug: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    imagePublicId: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
    sortOrder: zod_1.z.coerce.number().int().optional().default(0),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.queryCategorySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(50),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
// BRAND SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.createBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Brand name is required").max(100),
    slug: zod_1.z.string().min(1).optional(),
    logoUrl: zod_1.z.string().url().optional().nullable(),
    logoPublicId: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});
exports.updateBrandSchema = exports.createBrandSchema.partial();
exports.queryBrandSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(50),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.adjustStockSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "productId is required"),
    variantId: zod_1.z.string().optional(),
    operation: zod_1.z.enum(["INCREMENT", "DECREMENT", "SET"]),
    quantity: zod_1.z.coerce.number().int().min(0, "Quantity must be non-negative"),
    reason: zod_1.z.string().optional(),
});
exports.queryInventorySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    lowStockOnly: zod_1.z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), zod_1.z.boolean().optional()),
    threshold: zod_1.z.coerce.number().int().min(0).optional().default(5),
});
// ─────────────────────────────────────────────────────────────────────────────
// ORDER SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
exports.orderItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "productId is required"),
    variantId: zod_1.z.string().optional(),
    variantColor: zod_1.z.string().optional(),
    quantity: zod_1.z.coerce.number().int().positive("Quantity must be at least 1"),
});
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(exports.orderItemInputSchema).min(1, "Order must have at least one item"),
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1, "Customer name is required"),
        email: zod_1.z.string().email("Valid email required"),
        phone: zod_1.z.string().optional().nullable(),
        address: zod_1.z.string().min(1, "Address is required"),
        city: zod_1.z.string().min(1, "City is required"),
        state: zod_1.z.string().min(1, "State is required"),
        pincode: zod_1.z.string().min(1, "Pincode is required"),
    }),
    paymentMethod: zod_1.z.enum(["COD", "RAZORPAY", "WHATSAPP"]).optional().default("COD"),
    orderChannel: zod_1.z.enum(["COD", "ONLINE_PAYMENT", "WHATSAPP"]).optional(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
    ]),
    notes: zod_1.z.string().optional(),
});
exports.queryOrderSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
    ]).optional(),
    paymentStatus: zod_1.z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
    orderChannel: zod_1.z.enum(["COD", "ONLINE_PAYMENT", "WHATSAPP"]).optional(),
    customerId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
