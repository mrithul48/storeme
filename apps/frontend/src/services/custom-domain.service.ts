// apps/frontend/src/services/custom-domain.service.ts
// Service layer for merchant custom domains consuming centralized NestJS REST APIs.
// Enforces tenant isolation, domain normalization, DNS instructions, and synchronization.

import { apiClient, getCurrentServerUser, unwrapData } from "@/lib/api";
import type { DnsInstructionsResult, DnsVerificationResult } from "@/lib/custom-domain";

export type { DnsInstructionsResult, DnsVerificationResult };

export interface CustomDomainData {
  id: string;
  domain: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "FAILED" | "DISCONNECTED";
  verificationToken: string;
  verifiedAt: Date | null;
  dnsInstructions: DnsInstructionsResult;
}

/**
 * Get custom domain details for a specific store
 */
export async function getCustomDomainForStore(storeId: string): Promise<CustomDomainData | null> {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.get<CustomDomainData | null>("/api/v1/custom-domains", {
      storeId,
      internalUser: serverUser,
    });
    return unwrapData<CustomDomainData | null>(res);
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw error;
  }
}

/**
 * Register or update a custom domain for a store
 */
export async function registerCustomDomain(
  storeId: string,
  rawDomain: string
): Promise<{ success: boolean; data?: CustomDomainData; error?: string }> {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.post<CustomDomainData>(
      "/api/v1/custom-domains",
      { domain: rawDomain },
      {
        storeId,
        internalUser: serverUser,
      }
    );
    const data = unwrapData<CustomDomainData>(res);
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to register custom domain.",
    };
  }
}

/**
 * Verify DNS configuration for a merchant's custom domain
 */
export async function verifyCustomDomain(
  storeId: string
): Promise<{ success: boolean; data?: CustomDomainData; error?: string; verification?: DnsVerificationResult }> {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.post<{
      success: boolean;
      data?: CustomDomainData;
      error?: string;
      verification?: DnsVerificationResult;
    }>(
      "/api/v1/custom-domains/verify",
      {},
      {
        storeId,
        internalUser: serverUser,
      }
    );
    return unwrapData<{
      success: boolean;
      data?: CustomDomainData;
      error?: string;
      verification?: DnsVerificationResult;
    }>(res);
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "DNS verification failed.",
    };
  }
}

/**
 * Disconnect a custom domain from a store
 * Preserves all store products, orders, customers, themes, settings, etc.
 */
export async function disconnectCustomDomain(
  storeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const serverUser = await getCurrentServerUser();
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      "/api/v1/custom-domains",
      {
        storeId,
        internalUser: serverUser,
      }
    );
    return unwrapData<{ success: boolean; message: string }>(res);
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to disconnect custom domain.",
    };
  }
}

/**
 * Fast indexed lookup: resolves a verified custom domain hostname to its store
 */
export async function resolveStoreByDomain(hostname: string) {
  try {
    const res = await apiClient.get<{
      id: string;
      slug: string;
      name: string;
      status: string;
    } | null>(`/api/v1/custom-domains/resolve/${encodeURIComponent(hostname)}`);
    return unwrapData<{
      id: string;
      slug: string;
      name: string;
      status: string;
    } | null>(res);
  } catch (error) {
    return null;
  }
}
