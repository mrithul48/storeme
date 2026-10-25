// src/services/product.service.ts
// Business logic for product operations

import { prisma } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";
import { deleteImage } from "@/lib/cloudinary";
import type { CreateProductInput, UpdateProductInput } from "@/validations/product.schema";

const productSelectFields = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  sku: true,
  weight: true,
  stock: true,
  manageStockQuantity: true,
  manageStockAvailability: true,
  inStock: true,
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
  variants: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      color: true,
      manageAvailability: true,
      inStock: true,
      manageQuantity: true,
      stock: true,
      sortOrder: true,
      images: {
        orderBy: { sortOrder: "asc" as const },
        select: { id: true, url: true, publicId: true, altText: true, sortOrder: true },
      },
    },
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
  // Get existing slugs and store settings for this store
  const [existingProducts, storeSettings] = await Promise.all([
    prisma.product.findMany({
      where: { storeId },
      select: { slug: true },
    }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { stockManagementType: true, colorWiseStockType: true },
    }),
  ]);

  if (!storeSettings?.stockManagementType) {
    throw new Error("STOCK_MANAGEMENT_NOT_CONFIGURED");
  }

  const existingSlugs = existingProducts.map((p) => p.slug);
  const slug = data.slug
    ? generateUniqueSlug(data.slug, existingSlugs)
    : generateUniqueSlug(data.name, existingSlugs);

  const { images, variants, categoryId, brandId, salePrice, sku, ...rest } = data;

  // Determine stock configuration based on store settings
  let manageStockAvailability = false;
  let manageStockQuantity = false;
  let inStock = rest.inStock ?? true;
  let stock = rest.stock ?? 0;
  let finalVariants = variants;

  if (storeSettings.stockManagementType === "AVAILABILITY") {
    manageStockAvailability = true;
    manageStockQuantity = false;
    inStock = rest.inStock ?? true;
    stock = 0;
    finalVariants = undefined;
  } else if (storeSettings.stockManagementType === "QUANTITY") {
    manageStockQuantity = true;
    manageStockAvailability = false;
    stock = typeof rest.stock === "number" ? Math.max(0, rest.stock) : 0;
    inStock = stock > 0;
    finalVariants = undefined;
  } else if (storeSettings.stockManagementType === "COLOR_WISE") {
    manageStockAvailability = false;
    manageStockQuantity = false;
    const isColorQty = storeSettings.colorWiseStockType === "QUANTITY";
    if (finalVariants && finalVariants.length > 0) {
      finalVariants = finalVariants.map((v, idx) => ({
        ...v,
        manageAvailability: !isColorQty,
        inStock: isColorQty ? (v.stock ?? 0) > 0 : v.inStock ?? true,
        manageQuantity: isColorQty,
        stock: isColorQty ? Math.max(0, v.stock ?? 0) : 0,
        sortOrder: v.sortOrder ?? idx,
      }));
      inStock = finalVariants.some((v) => v.inStock);
    }
  }

  return prisma.product.create({
    data: {
      ...rest,
      manageStockAvailability,
      manageStockQuantity,
      inStock,
      stock,
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
      variants: finalVariants && finalVariants.length > 0
        ? {
            create: finalVariants.map((v, idx) => ({
              color: v.color,
              manageAvailability: v.manageAvailability ?? false,
              inStock: v.inStock ?? true,
              manageQuantity: v.manageQuantity ?? false,
              stock: v.stock ?? 0,
              sortOrder: v.sortOrder ?? idx,
              images: v.images && v.images.length > 0
                ? {
                    create: v.images.map((img, imgIdx) => ({
                      url: img.url,
                      publicId: img.publicId,
                      altText: img.altText ?? null,
                      sortOrder: img.sortOrder ?? imgIdx,
                    })),
                  }
                : undefined,
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
  // First verify ownership and retrieve store settings
  const [existing, storeSettings] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, storeId },
    }),
    prisma.storeSettings.findUnique({
      where: { storeId },
      select: { stockManagementType: true, colorWiseStockType: true },
    }),
  ]);
  if (!existing) return null;

  const { images, variants, ...rest } = data;

  // Adapt fields if store settings are configured
  const updateData: any = { ...rest };
  let adaptedVariants = variants;

  if (storeSettings?.stockManagementType === "AVAILABILITY") {
    updateData.manageStockAvailability = true;
    updateData.manageStockQuantity = false;
    if (rest.inStock !== undefined) {
      updateData.inStock = rest.inStock;
    }
    adaptedVariants = [];
  } else if (storeSettings?.stockManagementType === "QUANTITY") {
    updateData.manageStockQuantity = true;
    updateData.manageStockAvailability = false;
    if (rest.stock !== undefined) {
      updateData.stock = Math.max(0, rest.stock);
      updateData.inStock = updateData.stock > 0;
    }
    adaptedVariants = [];
  } else if (storeSettings?.stockManagementType === "COLOR_WISE") {
    updateData.manageStockQuantity = false;
    updateData.manageStockAvailability = false;
    const isColorQty = storeSettings.colorWiseStockType === "QUANTITY";
    if (adaptedVariants !== undefined) {
      adaptedVariants = adaptedVariants.map((v, idx) => ({
        ...v,
        manageAvailability: !isColorQty,
        inStock: isColorQty ? (v.stock ?? 0) > 0 : v.inStock ?? true,
        manageQuantity: isColorQty,
        stock: isColorQty ? Math.max(0, v.stock ?? 0) : 0,
        sortOrder: v.sortOrder ?? idx,
      }));
      updateData.inStock = adaptedVariants.some((v) => v.inStock);
    }
  }

  // Pre-collect existing variant and product images for safe cleanup
  let removedPublicIds: string[] = [];
  if (adaptedVariants !== undefined || images !== undefined) {
    const [existingProdImages, existingVarImages] = await Promise.all([
      images !== undefined
        ? prisma.productImage.findMany({ where: { productId }, select: { publicId: true } })
        : Promise.resolve([]),
      adaptedVariants !== undefined
        ? prisma.productVariantImage.findMany({ where: { variant: { productId } }, select: { publicId: true } })
        : Promise.resolve([]),
    ]);

    const retainedPublicIds = new Set<string>();
    if (images !== undefined) {
      images.forEach((img) => retainedPublicIds.add(img.publicId));
    }
    if (adaptedVariants !== undefined) {
      adaptedVariants.forEach((v) => {
        v.images?.forEach((img) => retainedPublicIds.add(img.publicId));
      });
    }

    const candidateIds = [
      ...existingProdImages.map((i) => i.publicId),
      ...existingVarImages.map((i) => i.publicId),
    ];
    removedPublicIds = candidateIds.filter(
      (pid) => !retainedPublicIds.has(pid) && !pid.startsWith("manual_")
    );
  }

  const updatedProduct = await prisma.$transaction(async (tx) => {
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

    // Update variants: delete all existing and recreate with variant images
    if (adaptedVariants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId } });
      if (adaptedVariants.length > 0) {
        for (const [idx, v] of adaptedVariants.entries()) {
          await tx.productVariant.create({
            data: {
              productId,
              color: v.color,
              manageAvailability: v.manageAvailability ?? false,
              inStock: v.inStock ?? true,
              manageQuantity: v.manageQuantity ?? false,
              stock: v.stock ?? 0,
              sortOrder: v.sortOrder ?? idx,
              images: v.images && v.images.length > 0
                ? {
                    create: v.images.map((img, imgIdx) => ({
                      url: img.url,
                      publicId: img.publicId,
                      altText: img.altText ?? null,
                      sortOrder: img.sortOrder ?? imgIdx,
                    })),
                  }
                : undefined,
            },
          });
        }
      }
    }

    return tx.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        ...(updateData.salePrice !== undefined ? { salePrice: updateData.salePrice ?? null } : {}),
        ...(updateData.sku !== undefined ? { sku: updateData.sku ?? null } : {}),
        ...(updateData.categoryId !== undefined ? { categoryId: updateData.categoryId ?? null } : {}),
        ...(updateData.brandId !== undefined ? { brandId: updateData.brandId ?? null } : {}),
      },
      select: productSelectFields,
    });
  });

  // Asynchronously clean up unreferenced removed images from Cloudinary
  if (removedPublicIds.length > 0) {
    (async () => {
      for (const pid of removedPublicIds) {
        try {
          const [countProdImg, countVarImg] = await Promise.all([
            prisma.productImage.count({ where: { publicId: pid } }),
            prisma.productVariantImage.count({ where: { publicId: pid } }),
          ]);
          if (countProdImg === 0 && countVarImg === 0) {
            await deleteImage(pid);
          }
        } catch (err) {
          console.error(`Failed to delete Cloudinary asset ${pid}:`, err);
        }
      }
    })().catch(() => {});
  }

  return updatedProduct;
}

/**
 * Delete a product (tenant-scoped)
 */
export async function deleteProduct(storeId: string, productId: string): Promise<boolean> {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
    include: {
      images: { select: { publicId: true } },
      variants: { include: { images: { select: { publicId: true } } } },
    },
  });
  if (!existing) return false;

  const publicIdsToDelete: string[] = [];
  existing.images.forEach((img) => {
    if (!img.publicId.startsWith("manual_")) publicIdsToDelete.push(img.publicId);
  });
  existing.variants.forEach((v) => {
    v.images?.forEach((img) => {
      if (!img.publicId.startsWith("manual_")) publicIdsToDelete.push(img.publicId);
    });
  });

  await prisma.product.delete({ where: { id: productId } });

  // Cleanup Cloudinary images not used elsewhere
  if (publicIdsToDelete.length > 0) {
    (async () => {
      for (const pid of publicIdsToDelete) {
        try {
          const [countProdImg, countVarImg] = await Promise.all([
            prisma.productImage.count({ where: { publicId: pid } }),
            prisma.productVariantImage.count({ where: { publicId: pid } }),
          ]);
          if (countProdImg === 0 && countVarImg === 0) {
            await deleteImage(pid);
          }
        } catch (err) {
          console.error(`Failed to delete Cloudinary image ${pid}:`, err);
        }
      }
    })().catch(() => {});
  }

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

/**
 * Storefront: Get related products for a product
 * Priority: Same category first, then other active products from the store.
 * Excludes current product.
 */
export async function getRelatedProducts(
  storeId: string,
  currentProductId: string,
  categoryId?: string | null,
  limit: number = 4
) {
  // 1. Fetch products from the same category first (excluding current product)
  let products = categoryId
    ? await prisma.product.findMany({
        where: {
          storeId,
          status: "ACTIVE",
          id: { not: currentProductId },
          categoryId,
        },
        select: productSelectFields,
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    : [];

  // 2. If fewer than limit, backfill with other active products from the store
  if (products.length < limit) {
    const existingIds = [currentProductId, ...products.map((p) => p.id)];
    const additional = await prisma.product.findMany({
      where: {
        storeId,
        status: "ACTIVE",
        id: { notIn: existingIds },
      },
      select: productSelectFields,
      take: limit - products.length,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    products = [...products, ...additional];
  }

  return products;
}

