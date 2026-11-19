// apps/mobile/src/api/categories.ts
// Category management API requests for LaunchCommerce Mobile

import { apiClient } from "./client";
import { Category } from "../types";

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  sortOrder?: number;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export const categoriesApi = {
  list: async (params?: ListCategoriesParams): Promise<Category[]> => {
    const res = await apiClient.get<any>("/categories", {
      params: {
        page: params?.page,
        limit: params?.limit || 100,
        search: params?.search,
        status: params?.status,
      },
    });

    if (Array.isArray(res)) return res;
    if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  getById: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    return apiClient.post<Category>("/categories", payload);
  },

  update: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    return apiClient.put<Category>(`/categories/${id}`, payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/categories/${id}`);
  },
};

