// apps/mobile/src/hooks/use-products.ts
// React Query hooks for product operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  ListProductsParams,
  CreateProductPayload,
  UpdateProductPayload,
} from "../api/products";
import { useAuthStore } from "../stores/auth-store";

export const PRODUCTS_QUERY_KEY = ["products"];

export function useProducts(params?: ListProductsParams) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, storeId, params],
    queryFn: () => productsApi.list(params),
    enabled: Boolean(storeId),
  });
}

export function useProduct(id?: string) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, storeId, id],
    queryFn: () => productsApi.getById(id!),
    enabled: Boolean(storeId && id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

