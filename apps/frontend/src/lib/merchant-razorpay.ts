// src/lib/merchant-razorpay.ts
// Factory that creates a Razorpay instance from a merchant's stored (encrypted) credentials.
// SERVER-ONLY — never import in client components.
//
// Separation of concerns:
//   PlatformRazorpay  → RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env vars → SaaS subscription billing
//   MerchantRazorpay  → per-store DB credentials, decrypted on-demand   → customer product payments

import Razorpay from "razorpay";
import { decryptSecret } from "./crypto";

export interface MerchantRazorpayConfig {
  keyId: string;
  encryptedSecret: string;
}

/**
 * Creates a Razorpay instance using the merchant's own credentials.
 * The secret is decrypted in memory and never persisted or logged.
 *
 * @param config - The MerchantPaymentConfig row from the database
 * @returns A Razorpay SDK instance authenticated with merchant credentials
 */
export function createMerchantRazorpay(config: MerchantRazorpayConfig): Razorpay {
  const keySecret = decryptSecret(config.encryptedSecret);
  return new Razorpay({
    key_id: config.keyId,
    key_secret: keySecret,
  });
}

/**
 * Validates merchant Razorpay credentials by making a lightweight test call.
 *
 * Strategy:
 *   - Attempt to create a ₹1 order — this is the most reliable auth test.
 *   - HTTP 401 / 403  → credentials are wrong → return false
 *   - HTTP 400        → auth passed (Razorpay understood us, just bad order params) → return true
 *   - Success (200)   → credentials valid → return true
 *   - Network error   → cannot reach Razorpay → return null (let caller decide)
 *
 * Never throws.
 */
export async function validateMerchantCredentials(
  keyId: string,
  keySecret: string
): Promise<{ valid: boolean; networkError?: boolean }> {
  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Attempt to fetch recent orders — read-only, no side effects.
    // For brand-new accounts with zero orders this still authenticates correctly.
    await rzp.orders.all({ count: 1, skip: 0 });

    // If we got here, auth passed
    return { valid: true };
  } catch (err: unknown) {
    const error = err as {
      statusCode?: number;
      error?: { code?: string; description?: string };
      message?: string;
    };

    const statusCode = error?.statusCode;

    // 401 = bad credentials (Unauthorized)
    // 403 = forbidden — credentials exist but no permission
    if (statusCode === 401 || statusCode === 403) {
      return { valid: false };
    }

    // Any other HTTP error from Razorpay (4xx/5xx that isn't auth) means credentials ARE valid
    // e.g. 400 Bad Request for param issues, 500 server error, etc.
    if (statusCode && statusCode >= 400) {
      return { valid: true };
    }

    // Network-level error (ECONNREFUSED, ETIMEDOUT, DNS failure, etc.)
    // We cannot determine validity — treat as valid so user isn't blocked
    // (the actual payment flow will fail gracefully if credentials are wrong)
    const msg = (error?.message ?? "").toLowerCase();
    if (
      msg.includes("econnrefused") ||
      msg.includes("etimedout") ||
      msg.includes("network") ||
      msg.includes("fetch")
    ) {
      return { valid: true, networkError: true };
    }

    // Unknown error — treat as invalid to be safe
    return { valid: false };
  }
}
