// src/services/product.service.ts
// Business logic for product operations

import { prisma } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";
import type { CreateProductInput, UpdateProductInput } from "@/validations/product.schema";

const productSelectFields = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  sku: true,
  stock: true,
  status: true,
  featured: true,
  categoryId: true,
  brandId: true,
  createdAt: true,
  updatedAt: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, publicId: true, altText: true, sortOrder: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  brand: {
    select: { id: true, name: true, slug: true },
  },
} as const;

/**
 * List products with pagination, search, and filters
 * Never loads all products — always paginated
 */
export async function listProducts(
  storeId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "ACTIVE" | "INACTIVE" | "DRAFT";
    categoryId?: string;
    brandId?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    categoryId,
    brandId,
    featured,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const skip = (page - 1) * limit;

  const where = {
    storeId,
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const validSortFields = ["name", "price", "stock", "createdAt", "updatedAt"];
  const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelectFields,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get a single product (tenant-scoped)
 */
export async function getProduct(storeId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, storeId }, // ALWAYS scope by storeId
    select: productSelectFields,
  });
}

/**
 * Get product by slug (for storefront)
 */
export async function getProductBySlug(storeId: string, slug: string) {
  return prisma.product.findFirst({
    where: { slug, storeId, status: "ACTIVE" },
    select: productSelectFields,
  });
}

/**
 * Create a product (auto-generates unique slug per store)
 */
export async function createProduct(storeId: string, data: CreateProductInput) {
  // Get existing slugs for this store to ensure uniqueness
  const existingProducts = await prisma.product.findMany({
    where: { storeId },
    select: { slug: true },
  });
  const existingSlugs = existingProducts.map((p) => p.slug);
  const slug = data.slug
    ? generateUniqueSlug(data.slug, existingSlugs)
    : generateUniqueSlug(data.name, existingSlugs);

  const { images, categoryId, brandId, salePrice, sku, ...rest } = data;

  return prisma.product.create({
    data: {
      ...rest,
      slug,
      storeId,
      salePrice: salePrice ?? null,
      sku: sku ?? null,
      categoryId: categoryId ?? null,
      brandId: brandId ?? null,
      images: images
        ? {
            create: images.map((img, idx) => ({
              url: img.url,
              publicId: img.publicId,
              altText: img.altText ?? null,
              sortOrder: img.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    select: productSelectFields,
  });
}

/**
 * Update a product (tenant-scoped)
 */
export async function updateProduct(
  storeId: string,
  productId: string,
  data: UpdateProductInput
) {
  // First verify ownership
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!existing) return null;

  const { images, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    // Update images: delete all existing and recreate
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }
    }

    return tx.product.update({
      where: { id: productId },
      data: {
        ...rest,
        ...(rest.salePrice !== undefined ? { salePrice: rest.salePrice ?? null } : {}),
        ...(rest.sku !== undefined ? { sku: rest.sku ?? null } : {}),
        ...(rest.categoryId !== undefined ? { categoryId: rest.categoryId ?? null } : {}),
        ...(rest.brandId !== undefined ? { brandId: rest.brandId ?? null } : {}),
      },
      select: productSelectFields,
    });
  });
}

/**
 * Delete a product (tenant-scoped)
 */
export async function deleteProduct(storeId: string, productId: string): Promise<boolean> {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!existing) return false;

  await prisma.product.delete({ where: { id: productId } });
  return true;
}

/**
 * Storefront: Get public products with pagination
 */
export async function getPublicProducts(
  storeId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  return listProducts(storeId, { ...params, status: "ACTIVE" });
}
