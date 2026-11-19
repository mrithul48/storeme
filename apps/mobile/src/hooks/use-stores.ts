// apps/mobile/src/hooks/use-stores.ts
// TanStack Query hooks for LaunchCommerce Store Management

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentStore,
  updateCurrentStore,
  getStoreTheme,
  updateStoreTheme,
  getStorePolicies,
  updateStorePolicies,
  getCustomDomain,
  registerCustomDomain,
  verifyCustomDomain,
  disconnectCustomDomain,
} from "../api/stores";
import {
  StoreWithDetails,
  UpdateStorePayload,
  UpdateThemePayload,
  UpdatePoliciesPayload,
} from "../types";
import { useAuthStore } from "../stores/auth-store";

export const STORE_QUERY_KEY = ["current-store"];
export const THEME_QUERY_KEY = ["store-theme"];
export const POLICIES_QUERY_KEY = ["store-policies"];
export const DOMAIN_QUERY_KEY = ["custom-domain"];

/**
 * Hook to retrieve full store profile, settings, company, and branding
 */
export function useCurrentStore() {
  const setStore = useAuthStore((state) => state.setStore);

  const query = useQuery({
    queryKey: STORE_QUERY_KEY,
    queryFn: async () => {
      const storeData = await getCurrentStore();
      if (storeData) {
        await setStore(storeData);
      }
      return storeData;
    },
    staleTime: 60000,
  });

  return {
    store: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to update store profile, company details, or settings
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();
  const setStore = useAuthStore((state) => state.setStore);

  return useMutation({
    mutationFn: (payload: UpdateStorePayload) => updateCurrentStore(payload),
    onSuccess: async (updatedStore) => {
      queryClient.setQueryData(STORE_QUERY_KEY, updatedStore);
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
      if (updatedStore) {
        await setStore(updatedStore);
      }
    },
  });
}

/**
 * Hook to fetch and update store storefront theme colors
 */
export function useStoreTheme() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: THEME_QUERY_KEY,
    queryFn: getStoreTheme,
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateThemePayload) => updateStoreTheme(payload),
    onSuccess: (updatedTheme) => {
      queryClient.setQueryData(THEME_QUERY_KEY, updatedTheme);
      queryClient.invalidateQueries({ queryKey: THEME_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });

  return {
    theme: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    updateTheme: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook to fetch and update store policies (Delivery, Refund, Privacy)
 */
export function useStorePolicies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: POLICIES_QUERY_KEY,
    queryFn: getStorePolicies,
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePoliciesPayload) => updateStorePolicies(payload),
    onSuccess: (updatedPolicies) => {
      queryClient.setQueryData(POLICIES_QUERY_KEY, updatedPolicies);
      queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
    },
  });

  return {
    policies: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    updatePolicies: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook to manage custom domains (get, register, verify, disconnect)
 */
export function useCustomDomain() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DOMAIN_QUERY_KEY,
    queryFn: getCustomDomain,
    staleTime: 30000,
  });

  const registerMutation = useMutation({
    mutationFn: (domain: string) => registerCustomDomain(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyCustomDomain(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectCustomDomain(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });

  return {
    domainDetails: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    registerDomain: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    verifyDomain: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    disconnectDomain: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
}

