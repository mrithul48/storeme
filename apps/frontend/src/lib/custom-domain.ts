// src/lib/custom-domain.ts
// Comprehensive domain normalization, validation, DNS record instructions, and verification.

import dns from "dns";
import crypto from "crypto";

export interface DomainValidationResult {
  valid: boolean;
  normalized?: string;
  error?: string;
}

export interface DnsInstruction {
  type: "CNAME" | "A" | "TXT";
  name: string;
  value: string;
  purpose: string;
  description: string;
}

export interface DnsInstructionsResult {
  domain: string;
  isApex: boolean;
  records: DnsInstruction[];
}

export interface DnsVerificationResult {
  verified: boolean;
  status: "VERIFIED" | "PENDING_VERIFICATION" | "FAILED";
  txtMatched: boolean;
  cnameOrAMatched: boolean;
  message: string;
  details?: {
    expectedTxt: string;
    foundTxtRecords?: string[];
    cnameRecords?: string[];
    aRecords?: string[];
    error?: string;
  };
}

// Normalized Vercel targets
export const VERCEL_CNAME_TARGET = "cname.vercel-dns.com";
export const VERCEL_APEX_IP = "76.76.21.21";

/**
 * Normalizes a custom domain string:
 * - strips protocol (http://, https://)
 * - strips paths, query params, trailing slashes
 * - strips port numbers
 * - trims and converts to lowercase
 */
export function normalizeDomain(rawDomain: string): string {
  if (!rawDomain || typeof rawDomain !== "string") {
    return "";
  }

  let domain = rawDomain.trim().toLowerCase();

  // Strip protocol
  domain = domain.replace(/^[a-z]+:\/\//i, "");

  // Strip path, query params, hash
  domain = domain.replace(/[/?#].*$/, "");

  // Strip port
  domain = domain.replace(/:\d+$/, "");

  // Strip trailing dot if any
  domain = domain.replace(/\.+$/, "");

  return domain;
}

/**
 * Validates domain format strictly:
 * - rejects localhost, 127.0.0.1, internal IP addresses
 * - rejects javascript:, data:, and paths
 * - validates standard domain / subdomain syntax (RFC 1035 / RFC 1123)
 */
export function validateDomain(rawDomain: string): DomainValidationResult {
  const normalized = normalizeDomain(rawDomain);

  if (!normalized) {
    return { valid: false, error: "Please enter a valid domain name." };
  }

  // Reject localhost and IP addresses
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "127.0.0.1" ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(normalized) ||
    normalized.includes(":")
  ) {
    return {
      valid: false,
      error: "IP addresses and localhost cannot be registered as custom domains.",
    };
  }

  // Reject malicious or special URI schemes
  if (
    normalized.includes("javascript:") ||
    normalized.includes("data:") ||
    normalized.includes("/") ||
    normalized.includes("\\") ||
    normalized.includes("?") ||
    normalized.includes("#") ||
    normalized.includes("@")
  ) {
    return { valid: false, error: "Invalid domain format. Characters like '/', '?', '#' are not allowed." };
  }

  // Check total length
  if (normalized.length > 253) {
    return { valid: false, error: "Domain name cannot exceed 253 characters." };
  }

  // Standard domain regex:
  // - labels separated by dots
  // - each label 1-63 chars: alphanumeric and hyphens (cannot start or end with hyphen)
  // - TLD must be alphabetic and at least 2 chars
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainRegex.test(normalized)) {
    return {
      valid: false,
      error: "Invalid domain format. Example: store.mybrand.com or mybrand.com",
    };
  }

  // Prevent claiming platform's own domain or known public suffix collisions
  const platformUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  try {
    if (platformUrl) {
      const platformHost = new URL(platformUrl).hostname.toLowerCase();
      if (normalized === platformHost || normalized.endsWith(`.${platformHost}`)) {
        return {
          valid: false,
          error: "You cannot use the platform root domain as a custom domain.",
        };
      }
    }
  } catch {
    // Ignore URL parse error
  }

  if (normalized.endsWith(".vercel.app")) {
    return {
      valid: false,
      error: "Vercel default domains (.vercel.app) cannot be registered as merchant custom domains.",
    };
  }

  return { valid: true, normalized };
}

/**
 * Checks if the domain is an apex domain (e.g., example.com) or a subdomain (e.g., www.example.com, shop.example.com)
 */
export function isApexDomain(domain: string): boolean {
  const parts = domain.split(".");
  return parts.length === 2;
}

/**
 * Generates the DNS instructions needed for a given domain
 */
export function getDnsInstructions(domain: string, verificationToken: string): DnsInstructionsResult {
  const normalized = normalizeDomain(domain);
  const apex = isApexDomain(normalized);

  const records: DnsInstruction[] = [];

  // Routing record (CNAME for subdomain, A for apex)
  if (apex) {
    records.push({
      type: "A",
      name: "@",
      value: VERCEL_APEX_IP,
      purpose: "Traffic Routing",
      description: `Points your apex domain to the platform hosting servers.`,
    });
  } else {
    const parts = normalized.split(".");
    const hostPrefix = parts.slice(0, parts.length - 2).join(".");
    records.push({
      type: "CNAME",
      name: hostPrefix,
      value: VERCEL_CNAME_TARGET,
      purpose: "Traffic Routing",
      description: `Points your subdomain (${normalized}) to the platform Vercel deployment.`,
    });
  }

  // Ownership verification TXT record
  records.push({
    type: "TXT",
    name: apex ? "@" : `_launchcommerce.${normalized.split(".")[0]}`,
    value: verificationToken,
    purpose: "Ownership Verification",
    description: "Proves you own this domain and prevents unauthorized domain takeover.",
  });

  return {
    domain: normalized,
    isApex: apex,
    records,
  };
}

/**
 * Generates an unguessable cryptographically secure domain verification token
 */
export function generateVerificationToken(): string {
  return `launchcommerce-verify-${crypto.randomBytes(24).toString("hex")}`;
}

/**
 * Performs actual DNS lookups to verify:
 * 1. Ownership via TXT record containing the verification token
 * 2. Routing via CNAME (for subdomain) or A (for apex)
 */
export async function verifyDomainDns(
  domain: string,
  expectedToken: string
): Promise<DnsVerificationResult> {
  const normalized = normalizeDomain(domain);
  let txtMatched = false;
  let cnameOrAMatched = false;
  const foundTxtRecords: string[] = [];
  let foundCnames: string[] = [];
  let foundIps: string[] = [];
  let lookupError: string | undefined;

  // 1. Check TXT records on domain and sub-names
  const hostsToCheck = [
    normalized,
    `_launchcommerce.${normalized}`,
    isApexDomain(normalized) ? normalized : normalized.split(".").slice(1).join("."),
  ];

  for (const host of hostsToCheck) {
    try {
      const records = await dns.promises.resolveTxt(host);
      const flattened = records.flat();
      foundTxtRecords.push(...flattened);

      if (flattened.some((rec) => rec.trim() === expectedToken.trim() || rec.includes(expectedToken.trim()))) {
        txtMatched = true;
        break;
      }
    } catch (err: any) {
      // ENOTFOUND or ENODATA is expected if not configured yet
    }
  }

  // 2. Check routing record (CNAME or A)
  try {
    if (isApexDomain(normalized)) {
      const ips = await dns.promises.resolve4(normalized);
      foundIps = ips;
      if (ips.includes(VERCEL_APEX_IP)) {
        cnameOrAMatched = true;
      }
    } else {
      const cnames = await dns.promises.resolveCname(normalized);
      foundCnames = cnames;
      if (
        cnames.some(
          (c) =>
            c.toLowerCase().includes("vercel-dns.com") ||
            c.toLowerCase().includes("vercel.app") ||
            c.toLowerCase().includes(VERCEL_CNAME_TARGET)
        )
      ) {
        cnameOrAMatched = true;
      }
    }
  } catch (err: any) {
    // ENODATA or ENOTFOUND is normal if DNS is not yet propagated
    lookupError = err?.message;
  }

  // Domain verification is successful if TXT token matches
  // (CNAME/A can also be reported to help merchant diagnose)
  if (txtMatched) {
    return {
      verified: true,
      status: "VERIFIED",
      txtMatched: true,
      cnameOrAMatched,
      message: cnameOrAMatched
        ? "Domain successfully verified and routing confirmed!"
        : "Domain ownership verified! Note: DNS routing record (CNAME/A) may still be propagating.",
      details: {
        expectedTxt: expectedToken,
        foundTxtRecords,
        cnameRecords: foundCnames,
        aRecords: foundIps,
      },
    };
  }

  return {
    verified: false,
    status: "FAILED",
    txtMatched: false,
    cnameOrAMatched,
    message:
      "DNS verification token was not detected yet. DNS changes can take up to 10-30 minutes to propagate across global DNS servers.",
    details: {
      expectedTxt: expectedToken,
      foundTxtRecords,
      cnameRecords: foundCnames,
      aRecords: foundIps,
      error: lookupError,
    },
  };
}
