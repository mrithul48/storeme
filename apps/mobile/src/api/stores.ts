// apps/mobile/src/api/stores.ts
// Centralized API functions consuming existing LaunchCommerce NestJS Store & Configuration endpoints

import { apiClient } from "./client";
import {
  StoreWithDetails,
  StoreTheme,
  StorePolicies,
  CustomDomainDetails,
  UpdateStorePayload,
  UpdateThemePayload,
  UpdatePoliciesPayload,
} from "../types";

/**
 * Fetch current authenticated merchant's full store details
 * Endpoint: GET /api/v1/stores/current
 */
export async function getCurrentStore(): Promise<StoreWithDetails> {
  const result = await apiClient.get<StoreWithDetails>("/stores/current");
  return result;
}

/**
 * Update store profile (name, company details, settings)
 * Endpoint: PUT /api/v1/stores/current
 */
export async function updateCurrentStore(
  payload: UpdateStorePayload
): Promise<StoreWithDetails> {
  const result = await apiClient.put<StoreWithDetails>("/stores/current", payload);
  return result;
}

/**
 * Fetch store theme & branding colors
 * Endpoint: GET /api/v1/stores/current/theme
 */
export async function getStoreTheme(): Promise<StoreTheme> {
  const result = await apiClient.get<StoreTheme>("/stores/current/theme");
  return result;
}

/**
 * Update store theme & styling
 * Endpoint: PUT /api/v1/stores/current/theme
 */
export async function updateStoreTheme(
  payload: UpdateThemePayload
): Promise<StoreTheme> {
  const result = await apiClient.put<StoreTheme>("/stores/current/theme", payload);
  return result;
}

/**
 * Fetch store policies (Delivery, Refund, Privacy)
 * Endpoint: GET /api/v1/stores/current/policies
 */
export async function getStorePolicies(): Promise<StorePolicies> {
  const result = await apiClient.get<StorePolicies>("/stores/current/policies");
  return result;
}

/**
 * Update store policies
 * Endpoint: PUT /api/v1/stores/current/policies
 */
export async function updateStorePolicies(
  payload: UpdatePoliciesPayload
): Promise<StorePolicies> {
  const result = await apiClient.put<StorePolicies>("/stores/current/policies", payload);
  return result;
}

/**
 * Fetch custom domain configuration
 * Endpoint: GET /api/v1/custom-domains
 */
export async function getCustomDomain(): Promise<CustomDomainDetails> {
  const result = await apiClient.get<CustomDomainDetails>("/custom-domains");
  return result;
}

/**
 * Register a custom domain for current store
 * Endpoint: POST /api/v1/custom-domains
 */
export async function registerCustomDomain(
  domain: string
): Promise<CustomDomainDetails> {
  const result = await apiClient.post<CustomDomainDetails>("/custom-domains", {
    domain,
  });
  return result;
}

/**
 * Trigger verification of CNAME / DNS records for custom domain
 * Endpoint: POST /api/v1/custom-domains/verify
 */
export async function verifyCustomDomain(): Promise<{
  success: boolean;
  message?: string;
  verified?: boolean;
}> {
  const result = await apiClient.post<{
    success: boolean;
    message?: string;
    verified?: boolean;
  }>("/custom-domains/verify");
  return result;
}

/**
 * Disconnect custom domain
 * Endpoint: DELETE /api/v1/custom-domains
 */
export async function disconnectCustomDomain(): Promise<{ success: boolean }> {
  const result = await apiClient.delete<{ success: boolean }>("/custom-domains");
  return result;
}

