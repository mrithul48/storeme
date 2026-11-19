// apps/mobile/src/api/brands.ts
// Brand management API requests for LaunchCommerce Mobile

import { apiClient } from "./client";
import { Brand } from "../types";

export interface ListBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateBrandPayload extends Partial<CreateBrandPayload> {}

export const brandsApi = {
  list: async (params?: ListBrandsParams): Promise<Brand[]> => {
    const res = await apiClient.get<any>("/brands", {
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

  getById: async (id: string): Promise<Brand> => {
    return apiClient.get<Brand>(`/brands/${id}`);
  },

  create: async (payload: CreateBrandPayload): Promise<Brand> => {
    return apiClient.post<Brand>("/brands", payload);
  },

  update: async (id: string, payload: UpdateBrandPayload): Promise<Brand> => {
    return apiClient.put<Brand>(`/brands/${id}`, payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/brands/${id}`);
  },
};

