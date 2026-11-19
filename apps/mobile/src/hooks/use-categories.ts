// apps/mobile/src/hooks/use-categories.ts
// React Query hooks for categories

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoriesApi,
  ListCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../api/categories";
import { useAuthStore } from "../stores/auth-store";

export const CATEGORIES_QUERY_KEY = ["categories"];

export function useCategories(params?: ListCategoriesParams) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, storeId, params],
    queryFn: () => categoriesApi.list(params),
    enabled: Boolean(storeId),
  });
}

export function useCategory(id?: string) {
  const storeId = useAuthStore((state) => state.store?.id);

  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, storeId, id],
    queryFn: () => categoriesApi.getById(id!),
    enabled: Boolean(storeId && id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

