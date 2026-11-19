// src/services/inventory.service.ts
// Business logic for inventory management migrated to centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";

export interface ListInventoryParams {
  page?: number;
  limit?: number;
  lowStock?: boolean;
  threshold?: number;
  search?: string;
}

export interface AdjustStockInput {
  productId: string;
  variantId?: string;
  operation: "INCREMENT" | "DECREMENT" | "SET";
  quantity: number;
  reason?: string;
}

/**
 * Get inventory overview for a store via NestJS API
 */
export async function getInventory(storeId: string, params: ListInventoryParams = {}) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/inventory", {
    storeId,
    internalUser: serverUser,
    params: {
      page: params.page,
      limit: params.limit,
      lowStock: params.lowStock,
      threshold: params.threshold,
      search: params.search,
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
}

/**
 * Adjust stock atomically via NestJS API (concurrency & negative stock protected)
 */
export async function adjustStock(storeId: string, data: AdjustStockInput) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/inventory/adjust", data, {
    storeId,
    internalUser: serverUser,
  });
  return unwrapData<any>(res);
}
