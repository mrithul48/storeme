// apps/mobile/src/hooks/use-inventory.ts
// TanStack Query hooks for Inventory Management

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, getProductInventory, adjustStock } from "../api/inventory";
import {
  InventoryFilterParams,
  AdjustStockPayload,
  InventorySummary,
  InventoryItem,
} from "../types";

export const INVENTORY_QUERY_KEY = ["inventory"];

export function computeInventorySummary(
  items: InventoryItem[],
  threshold: number = 5
): InventorySummary {
  let totalProducts = items.length;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalStockUnits = 0;

  for (const item of items) {
    totalStockUnits += Number(item.stock) || 0;

    const isLow =
      item.stock > 0 &&
      item.manageStockQuantity &&
      item.stock <= threshold;

    const isOut = item.stock <= 0 || !item.inStock;

    if (isOut) {
      outOfStockCount++;
    } else if (isLow) {
      lowStockCount++;
      inStockCount++;
    } else {
      inStockCount++;
    }
  }

  return {
    totalProducts,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalStockUnits,
  };
}

export function useInventory(params: InventoryFilterParams = {}) {
  const query = useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, params],
    queryFn: () => getInventory(params),
    staleTime: 30000, // 30 seconds
  });

  const items = query.data?.data || [];
  const pagination = query.data?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  const summary = computeInventorySummary(items, params.threshold || 5);

  return {
    ...query,
    items,
    pagination,
    summary,
  };
}

export function useProductInventory(productId: string, enabled = true) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, "product", productId],
    queryFn: () => getProductInventory(productId),
    enabled: enabled && Boolean(productId),
    staleTime: 30000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdjustStockPayload) => adjustStock(payload),
    onSuccess: (data, variables) => {
      // Invalidate general inventory queries
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      // Invalidate specific product inventory
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: [...INVENTORY_QUERY_KEY, "product", variables.productId],
        });
      }
      // Invalidate products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

