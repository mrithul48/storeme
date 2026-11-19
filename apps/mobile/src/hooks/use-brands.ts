// apps/mobile/src/hooks/use-brands.ts
// React Query hooks for brands

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  brandsApi,
  ListBrandsParams,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "../api/brands";
import { useAuthStore } from "../stores/auth-store";

export const BRANDS_QUERY_KEY = ["brands"];

export function useBrands(params?: ListBrandsParams) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...BRANDS_QUERY_KEY, storeId, params],
    queryFn: () => brandsApi.list(params),
    enabled: Boolean(storeId),
  });
}

export function useBrand(id?: string) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...BRANDS_QUERY_KEY, storeId, id],
    queryFn: () => brandsApi.getById(id!),
    enabled: Boolean(storeId && id),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBrandPayload) => brandsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandPayload }) =>
      brandsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

