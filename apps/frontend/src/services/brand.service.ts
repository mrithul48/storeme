// src/services/brand.service.ts
// Business logic for brand management migrated to centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { CreateBrandInput } from "@/validations/category.schema";

export interface ListBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

/**
 * List brands for a store via NestJS API
 */
export async function listBrands(storeId: string, params: ListBrandsParams = {}) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/brands", {
    storeId,
    internalUser: serverUser,
    params: {
      page: params.page,
      limit: params.limit || 100,
      search: params.search,
      status: params.status,
    },
  });

  const unwrapped = unwrapData<any[]>(res);
  return Array.isArray(unwrapped) ? unwrapped : res?.data || [];
}

/**
 * Get single brand by ID or slug via NestJS API
 */
export async function getBrand(storeId: string, idOrSlug: string) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.get<any>(`/api/v1/brands/${idOrSlug}`, {
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
 * Create a new brand via NestJS API (auto-generates unique slug)
 */
export async function createBrand(storeId: string, data: CreateBrandInput) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/brands", data, {
    storeId,
    internalUser: serverUser,
  });
  return unwrapData<any>(res);
}

/**
 * Update an existing brand via NestJS API
 */
export async function updateBrand(
  storeId: string,
  id: string,
  data: Partial<CreateBrandInput>
) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.put<any>(`/api/v1/brands/${id}`, data, {
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
 * Delete a brand via NestJS API
 */
export async function deleteBrand(storeId: string, id: string): Promise<boolean> {
  const serverUser = await getCurrentServerUser();
  try {
    await apiClient.delete(`/api/v1/brands/${id}`, {
      storeId,
      internalUser: serverUser,
    });
    return true;
  } catch (err: any) {
    if (err?.statusCode === 404) return false;
    throw err;
  }
}
