// apps/mobile/src/api/inventory.ts
// Typed inventory API client consuming existing NestJS REST endpoints

import { apiClient } from "./client";
import {
  InventoryItem,
  InventoryFilterParams,
  AdjustStockPayload,
  AdjustStockResult,
  PaginatedResult,
} from "../types";

/**
 * List inventory items with search, low-stock filter, threshold, and pagination
 * Endpoint: GET /api/v1/inventory
 */
export async function getInventory(
  params: InventoryFilterParams = {}
): Promise<PaginatedResult<InventoryItem>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page || 1,
    limit: params.limit || 50,
  };

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  if (params.lowStockOnly !== undefined) {
    queryParams.lowStockOnly = params.lowStockOnly;
  }

  if (params.threshold !== undefined) {
    queryParams.threshold = params.threshold;
  }

  const result = await apiClient.get<PaginatedResult<InventoryItem>>("/inventory", {
    params: queryParams,
  });

  return result;
}

/**
 * Get stock and variant details for a specific product
 * Endpoint: GET /api/v1/inventory/:productId
 */
export async function getProductInventory(productId: string): Promise<InventoryItem> {
  const result = await apiClient.get<InventoryItem>(`/inventory/${encodeURIComponent(productId)}`);
  return result;
}

/**
 * Adjust stock quantity for a product or variant atomically
 * Operations: 'INCREMENT' | 'DECREMENT' | 'SET'
 * Supports optional audit reason and color variant targeting
 * Endpoint: POST /api/v1/inventory/adjust
 */
export async function adjustStock(
  payload: AdjustStockPayload
): Promise<AdjustStockResult> {
  const result = await apiClient.post<AdjustStockResult>("/inventory/adjust", {
    productId: payload.productId,
    variantId: payload.variantId,
    operation: payload.operation,
    quantity: payload.quantity,
    reason: payload.reason?.trim() || undefined,
  });

  return result;
}

