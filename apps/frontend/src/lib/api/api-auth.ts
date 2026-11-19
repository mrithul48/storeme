// src/lib/api/api-auth.ts
// SERVER-ONLY internal token generator for secure Next.js -> NestJS communication

import * as crypto from "crypto";

export interface InternalAuthPayload {
  userId: string;
  email: string;
  role: "USER" | "PLATFORM_ADMIN";
  storeId?: string;
}

export function generateInternalServiceToken(payload: InternalAuthPayload): string {
  if (typeof (globalThis as any).window !== "undefined") {
    throw new Error("SECURITY_VIOLATION: Internal service tokens can never be generated on the client");
  }

  const secret =
    process.env.INTERNAL_SERVICE_SECRET_CURRENT ||
    process.env.INTERNAL_SERVICE_SECRET ||
    "launchcommerce-dev-internal-secret-current-32-chars!";
  const kid = process.env.INTERNAL_SERVICE_KEY_ID || "k1";

  const header = {
    alg: "HS256",
    typ: "LC-INTERNAL+JWT",
    kid,
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: "launchcommerce-nextjs",
    aud: "launchcommerce-nestjs",
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    ...(payload.storeId ? { storeId: payload.storeId } : {}),
    iat: now,
    exp: now + 60, // 60 seconds lifespan
    jti: crypto.randomUUID(),
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest("base64url");

  return `${b64Header}.${b64Payload}.${signature}`;
}

