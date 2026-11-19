// apps/mobile/src/api/products.ts
// Product management API requests for LaunchCommerce Mobile

import { apiClient } from "./client";
import { Product, ProductVariant, ProductImage } from "../types";

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

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  sku?: string | null;
  stock?: number;
  inStock?: boolean;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
  featured?: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const productsApi = {
  list: async (params?: ListProductsParams): Promise<ProductsResponse> => {
    const res = await apiClient.get<any>("/products", {
      params: {
        page: params?.page,
        limit: params?.limit || 20,
        search: params?.search,
        status: params?.status,
        categoryId: params?.categoryId,
        brandId: params?.brandId,
        featured: params?.featured,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
      },
    });

    if (res && typeof res === "object" && "data" in res && "pagination" in res) {
      return res as ProductsResponse;
    }

    const items = Array.isArray(res) ? res : res?.data || [];
    return {
      data: items,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getById: async (id: string): Promise<Product> => {
    return apiClient.get<Product>(`/products/${id}`);
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    return apiClient.post<Product>("/products", payload);
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    return apiClient.put<Product>(`/products/${id}`, payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/products/${id}`);
  },
};

