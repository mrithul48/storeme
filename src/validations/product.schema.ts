// src/validations/product.schema.ts

import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().optional(), // auto-generated if not provided
  description: z.string().max(5000).optional(),
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
  sku: z.string().max(100).optional().nullable(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  categoryId: z.string().cuid().optional().nullable(),
  brandId: z.string().cuid().optional().nullable(),
  images: z.array(productImageSchema).max(10, "Maximum 10 images per product").optional(),
});

export const createProductSchema = baseProductSchema.refine(
  (data) => {
    if (data.salePrice && data.price) {
      return data.salePrice < data.price;
    }
    return true;
  },
  { message: "Sale price must be less than the regular price", path: ["salePrice"] }
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
