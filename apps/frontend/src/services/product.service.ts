// src/services/product.service.ts
// Business logic for product operations migrated to centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { CreateProductInput, UpdateProductInput } from "@/validations/product.schema";

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
  categoryId?: string;
  brandId?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

/**
 * List products with pagination, search, and filters via NestJS API (with direct DB fallback)
 */
export async function listProducts(storeId: string, params: ListProductsParams = {}) {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<any>("/api/v1/products", {
      storeId,
      internalUser: serverUser,
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
        categoryId: params.categoryId,
        brandId: params.brandId,
        featured: params.featured,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      },
    });

    const pagination = res?.pagination || {
      page: params.page || 1,
      limit: params.limit || 20,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };

    const data = unwrapData<any[]>(res);
    return {
      data: Array.isArray(data) ? data : res?.data || [],
      pagination,
    };
  } catch {
    return {
      data: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

/**
 * Get a single product (tenant-scoped) via NestJS API
 */
export async function getProduct(storeId: string, productId: string) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.get<any>(`/api/v1/products/${productId}`, {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<any>(res);
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    throw err;
  }
}

/**
 * Get product by slug (for storefront) via NestJS API
 */
export async function getProductBySlug(storeId: string, slug: string) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.get<any>(`/api/v1/products/${slug}`, {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<any>(res);
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    return null;
  }
}

/**
 * Create a product via NestJS API (handles slug generation & stock management atomically)
 */
export async function createProduct(storeId: string, data: CreateProductInput) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/products", data, {
    storeId,
    internalUser: serverUser,
  });
  return unwrapData<any>(res);
}

/**
 * Update a product via NestJS API (handles variant & image diffs atomically)
 */
export async function updateProduct(
  storeId: string,
  productId: string,
  data: UpdateProductInput
) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.put<any>(`/api/v1/products/${productId}`, data, {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<any>(res);
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    throw err;
  }
}

/**
 * Delete a product via NestJS API
 */
export async function deleteProduct(storeId: string, productId: string): Promise<boolean> {
  const serverUser = await getCurrentServerUser();
  try {
    await apiClient.delete(`/api/v1/products/${productId}`, {
      storeId,
      internalUser: serverUser,
    });
    return true;
  } catch (err: any) {
    if (err?.statusCode === 404) return false;
    throw err;
  }
}

/**
 * Storefront: Get public products with pagination
 */
export async function getPublicProducts(
  storeId: string,
  params: Omit<ListProductsParams, "status">
) {
  return listProducts(storeId, { ...params, status: "ACTIVE" });
}

/**
 * Storefront: Get related products for a product
 */
export async function getRelatedProducts(
  storeId: string,
  currentProductId: string,
  categoryId?: string | null,
  limit: number = 4
) {
  const res = await listProducts(storeId, {
    categoryId: categoryId || undefined,
    limit: limit + 1,
    status: "ACTIVE",
  });

  let products = (res.data || []).filter((p: any) => p.id !== currentProductId).slice(0, limit);

  if (products.length < limit) {
    const fallbackRes = await listProducts(storeId, {
      limit: limit + 5,
      status: "ACTIVE",
    });
    const existingIds = new Set([currentProductId, ...products.map((p: any) => p.id)]);
    const additional = (fallbackRes.data || []).filter((p: any) => !existingIds.has(p.id));
    products = [...products, ...additional].slice(0, limit);
  }

  return products;
}
