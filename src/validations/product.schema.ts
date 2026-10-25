// src/validations/product.schema.ts

import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  publicId: z.string().min(1, "Public ID is required"),
  altText: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const productVariantSchema = z
  .object({
    id: z.string().optional(), // present only when editing existing variant
    color: z.string().min(1, "Color name is required").max(50),
    manageAvailability: z.boolean().default(false),
    inStock: z.boolean().default(true),
    manageQuantity: z.boolean().default(false),
    stock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
      .default(0),
    sortOrder: z.number().int().min(0).default(0),
    images: z.array(productImageSchema).max(10, "Maximum 10 images per variant").optional(),
  })
  .refine(
    (data) => {
      // If quantity is managed and stock is 0, prevent contradictory In Stock state
      if (data.manageQuantity && data.stock === 0 && data.manageAvailability && data.inStock) {
        return false;
      }
      return true;
    },
    {
      message: "Variant cannot be marked In Stock when managed quantity is 0",
      path: ["inStock"],
    }
  );

export const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().optional().nullable(), // auto-generated if not provided
  description: z.string().max(5000).optional().nullable(),
  price: z
    .number()
    .positive("Price must be positive")
    .max(9999999.99),
  salePrice: z
    .number()
    .positive("Sale price must be positive")
    .max(9999999.99)
    .optional()
    .nullable(),
  sku: z.string().max(100).optional().nullable().transform((val) => (val && val.trim() !== "" ? val : null)),
  weight: z.number().min(0, "Weight cannot be negative").max(99999.99).optional().nullable(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  manageStockQuantity: z.boolean().default(false),
  manageStockAvailability: z.boolean().default(false),
  inStock: z.boolean().default(true),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable().transform((val) => (val && val.trim() !== "" ? val : null)),
  brandId: z.string().optional().nullable().transform((val) => (val && val.trim() !== "" ? val : null)),
  images: z.array(productImageSchema).max(10, "Maximum 10 images per product").optional(),
  variants: z.array(productVariantSchema).max(20, "Maximum 20 color variants").optional(),
});

export const createProductSchema = baseProductSchema
  .refine(
    (data) => {
      if (data.salePrice && data.price) {
        return data.salePrice < data.price;
      }
      return true;
    },
    { message: "Sale price must be less than the regular price", path: ["salePrice"] }
  )
  .refine(
    (data) => {
      // If quantity management is enabled and stock is 0, prevent contradictory In Stock setting
      if (data.manageStockQuantity && data.stock === 0 && data.manageStockAvailability && data.inStock) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot mark product In Stock when managed stock quantity is 0",
      path: ["inStock"],
    }
  );

export const updateProductSchema = baseProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "price", "stock", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
