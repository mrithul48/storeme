// apps/mobile/src/hooks/use-orders.ts
// React Query hooks for order operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, ListOrdersParams, UpdateOrderStatusPayload } from "../api/orders";
import { useAuthStore } from "../stores/auth-store";

export const ORDERS_QUERY_KEY = ["orders"];

export function useOrders(params?: ListOrdersParams) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, storeId, params],
    queryFn: () => ordersApi.list(params),
    enabled: Boolean(storeId),
  });
}

export function useOrder(id?: string) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, storeId, id],
    queryFn: () => ordersApi.getById(id!),
    enabled: Boolean(storeId && id),
  });
}

export function useRecentOrders() {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, storeId, "recent"],
    queryFn: () => ordersApi.getRecent(),
    enabled: Boolean(storeId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderStatusPayload }) =>
      ordersApi.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

