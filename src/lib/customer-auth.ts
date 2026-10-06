// src/lib/customer-auth.ts
// Tenant-safe customer authentication library for live stores.
// Handles session cookies, password hashing/verification, and token validation.

import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, generateToken, hashToken } from "@/lib/password";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "customer-auth-fallback-secret-at-least-32-chars-long";

export interface CustomerSessionPayload {
  customerId: string;
  storeId: string;
  email: string;
  name: string;
  exp: number; // Unix timestamp in seconds
}

export const CUSTOMER_COOKIE_PREFIX = "store_customer_session_";

export function getCustomerCookieName(storeId: string): string {
  return `${CUSTOMER_COOKIE_PREFIX}${storeId}`;
}

/**
 * Creates a signed HMAC-SHA256 JWT-like session token.
 */
export function createCustomerToken(
  payload: Omit<CustomerSessionPayload, "exp">,
  expiresInSeconds: number = 30 * 24 * 60 * 60 // 30 days
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: CustomerSessionPayload = { ...payload, exp };

  const json = JSON.stringify(fullPayload);
  const b64Payload = Buffer.from(json, "utf8").toString("base64url");
  const hmac = crypto.createHmac("sha256", authSecret);
  hmac.update(b64Payload);
  const signature = hmac.digest("base64url");

  return `${b64Payload}.${signature}`;
}

/**
 * Verifies a customer session token against the expected storeId.
 * Strictly prevents cross-tenant session sharing.
 */
export function verifyCustomerToken(
  token: string,
  expectedStoreId: string
): CustomerSessionPayload | null {
  if (!token || !expectedStoreId) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [b64Payload, signature] = parts;

    // Verify HMAC signature
    const hmac = crypto.createHmac("sha256", authSecret);
    hmac.update(b64Payload);
    const expectedSignature = hmac.digest("base64url");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const json = Buffer.from(b64Payload, "base64url").toString("utf8");
    const payload: CustomerSessionPayload = JSON.parse(json);

    // Verify expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify tenant isolation
    if (payload.storeId !== expectedStoreId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the current customer session from cookies (Server Component / Route Handler).
 */
export async function getCurrentCustomer(storeId: string) {
  try {
    const cookieStore = await cookies();
    const cookieName = getCustomerCookieName(storeId);
    const token = cookieStore.get(cookieName)?.value;

    if (!token) return null;

    const session = verifyCustomerToken(token, storeId);
    if (!session) return null;

    const customer = await prisma.customer.findFirst({
      where: {
        id: session.customerId,
        storeId,
      },
      select: {
        id: true,
        storeId: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
      },
    });

    return customer;
  } catch {
    return null;
  }
}

export { hashPassword, verifyPassword, generateToken, hashToken };
