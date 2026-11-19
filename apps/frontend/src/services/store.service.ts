// apps/frontend/src/services/store.service.ts
// Business logic for store operations consuming centralized NestJS REST APIs

import { cache } from "react";
import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { CreateStoreInput } from "@/validations/store.schema";

/**
 * Get a store by the owner's user ID, google ID, or email (deduplicated per request via cache)
 */
export const getStoreByOwnerId = cache(async (ownerId: string): Promise<any | null> => {
  if (!ownerId) return null;

  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<any>(`/api/v1/stores/by-owner/${encodeURIComponent(ownerId)}`, {
      internalUser: serverUser || {
        id: ownerId,
        email: typeof ownerId === "string" && ownerId.includes("@") ? ownerId : "",
        role: "USER",
      },
    });
    return unwrapData<any>(res);
  } catch {
    return null;
  }
});

/**
 * Check if a user already has a store (deduplicated per request via cache)
 */
export const userHasStore = cache(async (ownerId: string): Promise<boolean> => {
  if (!ownerId) return false;

  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<{ hasStore: boolean }>(
      `/api/v1/stores/has-store/${encodeURIComponent(ownerId)}`,
      {
        internalUser: serverUser || {
          id: ownerId,
          email: typeof ownerId === "string" && ownerId.includes("@") ? ownerId : "",
          role: "USER",
        },
      }
    );
    const data = unwrapData<{ hasStore: boolean }>(res);
    return Boolean(data?.hasStore);
  } catch {
    return false;
  }
});

/**
 * Create a store with all required related records via NestJS
 */
export async function createStore(ownerId: string, data: CreateStoreInput) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/stores", data, {
    internalUser: serverUser || {
      id: ownerId,
      email: data.email || "",
      role: "USER",
    },
  });
  return unwrapData<any>(res);
}

/**
 * Get the full storefront config for a given slug or custom domain (public — no auth required).
 */
export const getStorefrontConfig = cache(async (slugOrDomain: string) => {
  try {
    const res = await apiClient.get<any>(
      `/api/v1/stores/storefront/${encodeURIComponent(slugOrDomain)}`
    );
    const data = unwrapData<any>(res);
    return data ? (JSON.parse(JSON.stringify(data)) as typeof data) : null;
  } catch {
    return null;
  }
});

/**
 * Get dashboard statistics for a store via NestJS
 */
export async function getDashboardStats(storeId: string) {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<any>("/api/v1/stores/current/stats", {
      storeId,
      internalUser: serverUser,
    });

    return unwrapData<any>(res) || { totalProducts: 0, totalOrders: 0, totalRevenue: 0 };
  } catch {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Update store details (name, company, settings)
 */
export async function updateStore(storeId: string, data: any) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.put<any>("/api/v1/stores/current", data, {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Get store theme settings
 */
export async function getStoreTheme(storeId: string) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/stores/current/theme", {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Update store theme settings
 */
export async function updateStoreTheme(storeId: string, data: any) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.put<any>("/api/v1/stores/current/theme", data, {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Get store policies
 */
export async function getStorePolicies(storeId: string) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/stores/current/policies", {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Update store policies
 */
export async function updateStorePolicies(storeId: string, data: any) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.put<any>("/api/v1/stores/current/policies", data, {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Get store homepage design
 */
export async function getStoreHomePage(storeId: string) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/stores/current/homepage", {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Update store homepage design
 */
export async function updateStoreHomePage(storeId: string, data: any) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.put<any>("/api/v1/stores/current/homepage", data, {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}

/**
 * Get custom colors configured for a store via NestJS API
 */
export async function getStoreColors(storeId: string) {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<any>("/api/v1/stores/current/colors", {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<any[]>(res) || [];
  } catch {
    return [];
  }
}
