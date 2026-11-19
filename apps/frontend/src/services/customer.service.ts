// apps/frontend/src/services/customer.service.ts
// Business logic for merchant customer management consuming centralized NestJS REST APIs

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | Date | null;
  createdAt: string | Date;
}

export interface ListCustomersResponse {
  data: CustomerSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function listStoreCustomers(
  storeId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<ListCustomersResponse> {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>("/api/v1/customers", {
    storeId,
    internalUser: serverUser,
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
    },
  });

  const rawData = res?.data?.data !== undefined ? res.data.data : unwrapData<CustomerSummary[]>(res);
  const pagination = res?.data?.pagination || res?.pagination || {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  return {
    data: Array.isArray(rawData) ? rawData : [],
    pagination,
  };
}

export async function getStoreCustomerById(
  storeId: string,
  customerId: string
): Promise<any> {
  const serverUser = await getCurrentServerUser();
  const res = await apiClient.get<any>(`/api/v1/customers/${customerId}`, {
    storeId,
    internalUser: serverUser,
  });

  return unwrapData<any>(res);
}
