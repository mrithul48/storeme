// src/services/custom-domain.service.ts
// Service layer for merchant custom domains.
// Enforces tenant isolation, domain normalization, DNS instructions, and synchronization.

import { prisma } from "@/lib/db";
import {
  normalizeDomain,
  validateDomain,
  generateVerificationToken,
  getDnsInstructions,
  verifyDomainDns,
  DnsInstructionsResult,
  DnsVerificationResult,
} from "@/lib/custom-domain";

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
  const record = await prisma.customDomain.findUnique({
    where: { storeId },
  });

  if (!record || record.status === "DISCONNECTED") {
    // Check fallback on Store model if legacy data exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { customDomain: true, domainStatus: true, domainVerificationToken: true },
    });

    if (store?.customDomain && store.domainStatus !== "NOT_CONNECTED") {
      const instructions = getDnsInstructions(
        store.customDomain,
        store.domainVerificationToken || ""
      );

      const status =
        store.domainStatus === "CONNECTED"
          ? "VERIFIED"
          : store.domainStatus === "VERIFICATION_FAILED"
          ? "FAILED"
          : "PENDING_VERIFICATION";

      return {
        id: storeId,
        domain: store.customDomain,
        status,
        verificationToken: store.domainVerificationToken || "",
        verifiedAt: store.domainStatus === "CONNECTED" ? new Date() : null,
        dnsInstructions: instructions,
      };
    }

    return null;
  }

  const instructions = getDnsInstructions(record.domain, record.verificationToken);

  return {
    id: record.id,
    domain: record.domain,
    status: record.status as "PENDING_VERIFICATION" | "VERIFIED" | "FAILED" | "DISCONNECTED",
    verificationToken: record.verificationToken,
    verifiedAt: record.verifiedAt,
    dnsInstructions: instructions,
  };
}

/**
 * Register or update a custom domain for a store
 */
export async function registerCustomDomain(
  storeId: string,
  rawDomain: string
): Promise<{ success: boolean; data?: CustomDomainData; error?: string }> {
  // 1. Validate and normalize domain
  const validation = validateDomain(rawDomain);
  if (!validation.valid || !validation.normalized) {
    return { success: false, error: validation.error || "Invalid domain format." };
  }

  const normalizedDomain = validation.normalized;

  // 2. Multi-tenant uniqueness check:
  // Prevent Store B from claiming a domain that belongs to Store A
  const existingDomain = await prisma.customDomain.findUnique({
    where: { domain: normalizedDomain },
    select: { storeId: true, status: true },
  });

  if (existingDomain && existingDomain.storeId !== storeId && existingDomain.status !== "DISCONNECTED") {
    return {
      success: false,
      error: "This domain is already registered to another store.",
    };
  }

  // Also check Store table for uniqueness
  const legacyConflict = await prisma.store.findFirst({
    where: {
      customDomain: normalizedDomain,
      id: { not: storeId },
    },
    select: { id: true },
  });

  if (legacyConflict) {
    return {
      success: false,
      error: "This domain is already registered to another store.",
    };
  }

  // 3. Generate secure verification token
  const verificationToken = generateVerificationToken();

  // 4. Upsert CustomDomain record and sync Store model in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    const customDomain = await tx.customDomain.upsert({
      where: { storeId },
      create: {
        storeId,
        domain: normalizedDomain,
        status: "PENDING_VERIFICATION",
        verificationToken,
        verifiedAt: null,
      },
      update: {
        domain: normalizedDomain,
        status: "PENDING_VERIFICATION",
        verificationToken,
        verifiedAt: null,
      },
    });

    await tx.store.update({
      where: { id: storeId },
      data: {
        customDomain: normalizedDomain,
        domainStatus: "PENDING_VERIFICATION",
        domainVerificationToken: verificationToken,
      },
    });

    return customDomain;
  });

  const dnsInstructions = getDnsInstructions(normalizedDomain, verificationToken);

  return {
    success: true,
    data: {
      id: result.id,
      domain: result.domain,
      status: "PENDING_VERIFICATION",
      verificationToken: result.verificationToken,
      verifiedAt: null,
      dnsInstructions,
    },
  };
}

/**
 * Verify DNS configuration for a merchant's custom domain
 */
export async function verifyCustomDomain(
  storeId: string
): Promise<{ success: boolean; data?: CustomDomainData; error?: string; verification?: DnsVerificationResult }> {
  // 1. Get current custom domain
  const domainRecord = await prisma.customDomain.findUnique({
    where: { storeId },
  });

  // Fallback to Store fields if needed
  let domain = domainRecord?.domain;
  let token = domainRecord?.verificationToken;

  if (!domain || !token) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { customDomain: true, domainVerificationToken: true },
    });
    domain = store?.customDomain || undefined;
    token = store?.domainVerificationToken || undefined;
  }

  if (!domain || !token) {
    return {
      success: false,
      error: "No custom domain has been registered for this store yet.",
    };
  }

  // 2. Perform REAL DNS verification
  const verificationResult = await verifyDomainDns(domain, token);

  const newStatus = verificationResult.verified ? "VERIFIED" : "FAILED";
  const verifiedAt = verificationResult.verified ? new Date() : null;

  // 3. Update database with real verification status
  await prisma.$transaction(async (tx) => {
    await tx.customDomain.upsert({
      where: { storeId },
      create: {
        storeId,
        domain,
        status: newStatus,
        verificationToken: token!,
        verifiedAt,
      },
      update: {
        status: newStatus,
        verifiedAt,
      },
    });

    await tx.store.update({
      where: { id: storeId },
      data: {
        domainStatus: verificationResult.verified ? "CONNECTED" : "VERIFICATION_FAILED",
      },
    });
  });

  const dnsInstructions = getDnsInstructions(domain, token);

  return {
    success: verificationResult.verified,
    data: {
      id: domainRecord?.id || storeId,
      domain,
      status: newStatus,
      verificationToken: token,
      verifiedAt,
      dnsInstructions,
    },
    verification: verificationResult,
    error: verificationResult.verified ? undefined : verificationResult.message,
  };
}

/**
 * Disconnect a custom domain from a store
 * Preserves all store products, orders, customers, themes, settings, etc.
 */
export async function disconnectCustomDomain(
  storeId: string
): Promise<{ success: boolean; message: string }> {
  await prisma.$transaction(async (tx) => {
    // Update CustomDomain to DISCONNECTED
    await tx.customDomain
      .update({
        where: { storeId },
        data: {
          status: "DISCONNECTED",
        },
      })
      .catch(() => {
        // If no customDomain record exists, ignore
      });

    // Clear Store domain fields
    await tx.store.update({
      where: { id: storeId },
      data: {
        customDomain: null,
        domainStatus: "NOT_CONNECTED",
        domainVerificationToken: null,
      },
    });
  });

  return {
    success: true,
    message: "Custom domain successfully disconnected.",
  };
}

/**
 * Fast indexed lookup: resolves a verified custom domain hostname to its store
 */
export async function resolveStoreByDomain(hostname: string) {
  const normalized = normalizeDomain(hostname);
  if (!normalized) return null;

  // Check CustomDomain first
  const customDomain = await prisma.customDomain.findFirst({
    where: {
      domain: normalized,
      status: "VERIFIED",
    },
    include: {
      store: {
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
        },
      },
    },
  });

  if (customDomain?.store && customDomain.store.status === "ACTIVE") {
    return customDomain.store;
  }

  // Fallback to Store.customDomain for backwards compatibility
  const legacyStore = await prisma.store.findFirst({
    where: {
      customDomain: normalized,
      domainStatus: "CONNECTED",
      status: "ACTIVE",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
    },
  });

  return legacyStore || null;
}
