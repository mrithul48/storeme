// apps/mobile/src/hooks/use-customers.ts
// TanStack Query hooks for LaunchCommerce Customer Management

import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
} from "../api/customers";
import { CustomerFilterParams } from "../types";

export const CUSTOMERS_QUERY_KEY = ["customers"];
export const CUSTOMER_DETAIL_QUERY_KEY = ["customer"];
export const CUSTOMER_ORDERS_QUERY_KEY = ["customer-orders"];

/**
 * Hook to fetch paginated merchant customers with real-time search
 */
export function useCustomers(params: CustomerFilterParams = {}) {
  const query = useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, params],
    queryFn: () => getCustomers(params),
    staleTime: 30000, // 30 seconds
  });

  return {
    customers: query.data?.data || [],
    pagination: query.data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch individual customer profile and order summaries
 */
export function useCustomerDetails(customerId: string | undefined | null) {
  const query = useQuery({
    queryKey: [...CUSTOMER_DETAIL_QUERY_KEY, customerId],
    queryFn: () => getCustomerById(customerId!),
    enabled: Boolean(customerId),
    staleTime: 60000, // 1 minute
  });

  return {
    customer: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch deep order details for a specific customer
 */
export function useCustomerOrders(customerId: string | undefined | null) {
  const query = useQuery({
    queryKey: [...CUSTOMER_ORDERS_QUERY_KEY, customerId],
    queryFn: () => getCustomerOrders(customerId!),
    enabled: Boolean(customerId),
    staleTime: 60000,
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

