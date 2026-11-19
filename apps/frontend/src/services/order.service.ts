// src/services/order.service.ts
// Business logic for order creation and management migrated to centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { CreateOrderInput } from "@/validations/order.schema";

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  channel?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Create an order via NestJS API
 * Authoritative price recalculation, stock checks, and inventory decrements are enforced
 */
export async function createOrder(
  storeId: string,
  data: CreateOrderInput,
  options?: { idempotencyKey?: string }
) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.post<any>("/api/v1/orders", data, {
    storeId,
    internalUser: serverUser,
    idempotencyKey: options?.idempotencyKey,
  });

  return unwrapData<any>(res);
}

/**
 * List orders (tenant-scoped) via NestJS API
 */
export async function listOrders(storeId: string, params: ListOrdersParams = {}) {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<any>("/api/v1/orders", {
      storeId,
      internalUser: serverUser,
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        sortOrder: params.sortOrder,
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

    const rawItems = unwrapData<any[]>(res) || [];
    const items = (Array.isArray(rawItems) ? rawItems : []).map((o: any) => ({
      ...o,
      itemCount: o.itemCount ?? o.items?.length ?? o._count?.items ?? 0,
      customer: o.customer || { name: "Guest Customer", email: null, phone: null },
    }));

    return {
      data: items,
      pagination,
    };
  } catch {
    return {
      data: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

/**
 * Get full order details (tenant-scoped) via NestJS API
 */
export async function getOrder(storeId: string, orderId: string) {
  const serverUser = await getCurrentServerUser();
  try {
    const res = await apiClient.get<any>(`/api/v1/orders/${orderId}`, {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<any>(res);
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    return null;
  }
}

/**
 * Update order status (tenant-scoped) via NestJS API
 * Enforces valid state machine transitions and automatic inventory replenishment on cancellation
 */
export async function updateOrderStatus(
  storeId: string,
  orderId: string,
  data: { status?: string; paymentStatus?: string; notes?: string },
  options?: { user?: { id: string; email?: string; role?: string } }
) {
  const serverUser = options?.user || (await getCurrentServerUser());
  const internalUser = {
    id: serverUser?.id || storeId,
    email: serverUser?.email || "internal@storefront.local",
    role: ((serverUser?.role === "PLATFORM_ADMIN" ? "PLATFORM_ADMIN" : "USER") as "USER" | "PLATFORM_ADMIN"),
  };
  const res = await apiClient.patch<any>(
    `/api/v1/orders/${orderId}/status`,
    {
      status: data.status,
      paymentStatus: data.paymentStatus,
      notes: data.notes,
    },
    {
      storeId,
      internalUser,
    }
  );
  return unwrapData<any>(res);
}

/**
 * Get orders dashboard summary KPI aggregates via NestJS API
 */
export async function getOrdersSummary(storeId: string) {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/orders/summary", {
    storeId,
    internalUser: serverUser,
  });
  return unwrapData<any>(res);
}

/**
 * Get public storefront order details by order number
 */
export async function getStorefrontOrder(orderNumber: string, storeSlug?: string, storeId?: string) {
  try {
    const res = await apiClient.get<any>(`/api/v1/orders/storefront/${encodeURIComponent(orderNumber)}`, {
      params: {
        storeSlug,
        storeId,
      },
    });
    return unwrapData<any>(res);
  } catch {
    return null;
  }
}

/**
 * Get all orders placed by a customer in a store
 */
export async function getCustomerOrders(customerId: string, storeId?: string) {
  try {
    const res = await apiClient.get<any>(`/api/v1/orders/by-customer/${encodeURIComponent(customerId)}`, {
      params: {
        storeId,
      },
    });
    return unwrapData<any[]>(res) || [];
  } catch {
    return [];
  }
}
