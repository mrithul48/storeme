// apps/mobile/src/api/orders.ts
// Order management API requests for LaunchCommerce Mobile

import { apiClient } from "./client";
import { Order, OrderStatus, OrderSummary } from "../types";

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | string;
  paymentStatus?: string;
  channel?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateOrderStatusPayload {
  status?: OrderStatus;
  paymentStatus?: string;
  notes?: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const ordersApi = {
  list: async (params?: ListOrdersParams): Promise<OrdersResponse> => {
    const res = await apiClient.get<any>("/orders", {
      params: {
        page: params?.page,
        limit: params?.limit || 20,
        search: params?.search,
        status: params?.status,
        paymentStatus: params?.paymentStatus,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        sortOrder: params?.sortOrder,
      },
    });

    if (res && typeof res === "object" && "data" in res && "pagination" in res) {
      return res as OrdersResponse;
    }

    const items = Array.isArray(res) ? res : res?.data || [];
    return {
      data: items,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getById: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  updateStatus: async (id: string, payload: UpdateOrderStatusPayload): Promise<Order> => {
    return apiClient.patch<Order>(`/orders/${id}/status`, payload);
  },

  getSummary: async (): Promise<OrderSummary> => {
    return apiClient.get<OrderSummary>("/orders/summary");
  },

  getRecent: async (): Promise<Order[]> => {
    const res = await apiClient.get<any>("/orders/recent");
    return Array.isArray(res) ? res : res?.data || [];
  },
};

