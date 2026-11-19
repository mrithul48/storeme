// apps/mobile/src/api/customers.ts
// Typed Customer API client consuming existing LaunchCommerce NestJS REST endpoints

import { apiClient } from "./client";
import {
  CustomerListItem,
  CustomerDetail,
  CustomerFilterParams,
  PaginatedResult,
  Order,
} from "../types";

/**
 * List merchant customers with search and pagination
 * Endpoint: GET /api/v1/customers
 * Headers: Authorization: Bearer <token>, x-store-id: <storeId>
 */
export async function getCustomers(
  params: CustomerFilterParams = {}
): Promise<PaginatedResult<CustomerListItem>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page || 1,
    limit: params.limit || 20,
  };

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  const result = await apiClient.get<PaginatedResult<CustomerListItem>>("/customers", {
    params: queryParams,
  });

  return result;
}

/**
 * Get detailed customer profile with order history summary
 * Endpoint: GET /api/v1/customers/:id
 * Headers: Authorization: Bearer <token>, x-store-id: <storeId>
 */
export async function getCustomerById(customerId: string): Promise<CustomerDetail> {
  const result = await apiClient.get<CustomerDetail>(
    `/customers/${encodeURIComponent(customerId)}`
  );
  return result;
}

/**
 * Get full historical orders for a specific customer
 * Endpoint: GET /api/v1/orders/by-customer/:customerId
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const result = await apiClient.get<Order[]>(
    `/orders/by-customer/${encodeURIComponent(customerId)}`
  );
  return result;
}

