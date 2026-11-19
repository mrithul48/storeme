// apps/mobile/src/api/subscriptions.ts
// Centralized API client consuming existing LaunchCommerce NestJS Plans & Subscriptions endpoints

import { apiClient } from "./client";
import {
  Plan,
  BillingPeriod,
  CurrentSubscriptionResponse,
  SubscriptionCheckoutResponse,
  SubscriptionVerifyPayload,
  SubscriptionDetail,
  SubscriptionPayment,
} from "../types";

/**
 * List all active public plans for merchants
 * Endpoint: GET /api/v1/plans
 */
export async function getPublicPlans(): Promise<Plan[]> {
  const result = await apiClient.get<Plan[]>("/plans");
  return result;
}

/**
 * Get plan details by ID
 * Endpoint: GET /api/v1/plans/:id
 */
export async function getPlanById(id: string): Promise<Plan> {
  const result = await apiClient.get<Plan>(`/plans/${encodeURIComponent(id)}`);
  return result;
}

/**
 * Fetch current store subscription, feature limits, and payment history
 * Endpoint: GET /api/v1/subscriptions/current
 */
export async function getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
  const result = await apiClient.get<CurrentSubscriptionResponse>("/subscriptions/current");
  return result;
}

/**
 * Initiate Razorpay checkout order for subscription upgrade/change
 * Endpoint: POST /api/v1/subscriptions/checkout
 */
export async function initiateSubscriptionCheckout(
  planId: string,
  billingPeriod: BillingPeriod = "YEARLY"
): Promise<SubscriptionCheckoutResponse> {
  const result = await apiClient.post<SubscriptionCheckoutResponse>(
    "/subscriptions/checkout",
    {
      planId,
      billingPeriod,
    }
  );
  return result;
}

/**
 * Verify Razorpay payment and activate / upgrade subscription atomically
 * Endpoint: POST /api/v1/subscriptions/verify
 */
export async function verifySubscriptionPayment(
  payload: SubscriptionVerifyPayload
): Promise<{
  success: boolean;
  message: string;
  data: {
    subscription: SubscriptionDetail;
    payment: SubscriptionPayment;
  };
}> {
  const result = await apiClient.post<{
    success: boolean;
    message: string;
    data: {
      subscription: SubscriptionDetail;
      payment: SubscriptionPayment;
    };
  }>("/subscriptions/verify", payload);
  return result;
}

/**
 * Cancel merchant subscription (remains active until period end)
 * Endpoint: POST /api/v1/subscriptions/cancel
 */
export async function cancelSubscription(reason?: string): Promise<{
  success: boolean;
  message: string;
}> {
  const result = await apiClient.post<{
    success: boolean;
    message: string;
  }>("/subscriptions/cancel", {
    reason,
  });
  return result;
}

