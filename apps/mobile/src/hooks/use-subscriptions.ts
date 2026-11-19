// apps/mobile/src/hooks/use-subscriptions.ts
// TanStack Query hooks for LaunchCommerce Subscription & Billing

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentSubscription,
  getPublicPlans,
  initiateSubscriptionCheckout,
  verifySubscriptionPayment,
  cancelSubscription,
} from "../api/subscriptions";
import {
  BillingPeriod,
  SubscriptionVerifyPayload,
} from "../types";
import { STORE_QUERY_KEY } from "./use-stores";

export const SUBSCRIPTION_QUERY_KEY = ["current-subscription"];
export const PLANS_QUERY_KEY = ["public-plans"];

/**
 * Hook to retrieve current store subscription, limits, and payment history
 */
export function useCurrentSubscription() {
  const query = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: getCurrentSubscription,
    staleTime: 30000,
  });

  return {
    subscriptionData: query.data || null,
    subscription: query.data?.subscription || null,
    limits: query.data?.limits || null,
    payments: query.data?.payments || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch all available public subscription plans
 */
export function usePlans() {
  const query = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: getPublicPlans,
    staleTime: 60000,
  });

  return {
    plans: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to initiate checkout order
 */
export function useInitiateCheckout() {
  return useMutation({
    mutationFn: ({
      planId,
      billingPeriod,
    }: {
      planId: string;
      billingPeriod?: BillingPeriod;
    }) => initiateSubscriptionCheckout(planId, billingPeriod),
  });
}

/**
 * Hook to verify payment and activate subscription
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionVerifyPayload) =>
      verifySubscriptionPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });
}

