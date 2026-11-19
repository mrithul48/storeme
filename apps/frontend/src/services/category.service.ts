// src/services/category.service.ts
// Business logic for category and brand management migrated to centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { CreateCategoryInput } from "@/validations/category.schema";

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

/**
 * List categories for a store via NestJS API
 */
export async function listCategories(storeId: string, params: ListCategoriesParams = {}) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/categories", {
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
 * Get category by ID or slug via NestJS API
 */
export async function getCategory(storeId: string, idOrSlug: string) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.get<any>(`/api/v1/categories/${idOrSlug}`, {
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
 * Create a new category via NestJS API (auto-generates unique slug)
 */
export async function createCategory(storeId: string, data: CreateCategoryInput) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/categories", data, {
    storeId,
    internalUser: serverUser,
  });
  return unwrapData<any>(res);
}

/**
 * Update an existing category via NestJS API
 */
export async function updateCategory(
  storeId: string,
  id: string,
  data: Partial<CreateCategoryInput>
) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.put<any>(`/api/v1/categories/${id}`, data, {
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
 * Delete a category via NestJS API
 */
export async function deleteCategory(storeId: string, id: string): Promise<boolean> {
  const serverUser = await getCurrentServerUser();
  try {
    await apiClient.delete(`/api/v1/categories/${id}`, {
      storeId,
      internalUser: serverUser,
    });
    return true;
  } catch (err: any) {
    if (err?.statusCode === 404) return false;
    throw err;
  }
}

// Re-export brand functions for backward-compatibility with existing component imports
export * from "./brand.service";
