// src/lib/api/api-config.ts
// Central configuration for NestJS API client communication

import { API_ROUTES } from "@launchcommerce/api-contracts";

export const API_BASE_URL =
  (typeof window === "undefined"
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL) || "http://localhost:4000";

export const DEFAULT_INTERNAL_KEY_ID =
  process.env.INTERNAL_SERVICE_KEY_ID || "k1";

export { API_ROUTES };

