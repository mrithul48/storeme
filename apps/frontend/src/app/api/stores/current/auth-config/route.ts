// src/app/api/stores/current/auth-config/route.ts
// Merchant API to configure store-specific customer authentication (Google OAuth)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pgPool } from "@/lib/db-pg";
import { getStoreByOwnerId } from "@/services/store.service";
import { encryptSecret } from "@/lib/crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const res = await pgPool.query<{
      googleEnabled: boolean;
      googleClientId: string | null;
      encryptedGoogleClientSecret: string | null;
    }>(
      `SELECT "googleEnabled", "googleClientId", "encryptedGoogleClientSecret"
       FROM "MerchantAuthConfig"
       WHERE "storeId" = $1 LIMIT 1`,
      [store.id]
    );

    const config = res.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        googleEnabled: config?.googleEnabled ?? false,
        googleClientId: config?.googleClientId ?? "",
        hasGoogleClientSecret: Boolean(config?.encryptedGoogleClientSecret),
      },
    });
  } catch (error) {
    console.error("[GET /api/stores/current/auth-config]", error);
    return NextResponse.json({ success: false, error: "Failed to load auth config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { googleEnabled, googleClientId, googleClientSecret } = body;

    const trimmedSecret = typeof googleClientSecret === "string" ? googleClientSecret.trim() : "";
    let encryptedSecret: string | undefined = undefined;

    if (trimmedSecret) {
      encryptedSecret = encryptSecret(trimmedSecret);
    }

    const client = await pgPool.connect();
    try {
      const existing = await client.query<{ id: string; encryptedGoogleClientSecret: string | null }>(
        `SELECT id, "encryptedGoogleClientSecret" FROM "MerchantAuthConfig" WHERE "storeId" = $1 LIMIT 1`,
        [store.id]
      );

      const secretToSave = encryptedSecret !== undefined
        ? encryptedSecret
        : (existing.rows[0]?.encryptedGoogleClientSecret || null);

      await client.query(
        `INSERT INTO "MerchantAuthConfig" (id, "storeId", "googleEnabled", "googleClientId", "encryptedGoogleClientSecret", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
         ON CONFLICT ("storeId") DO UPDATE SET
           "googleEnabled" = EXCLUDED."googleEnabled",
           "googleClientId" = EXCLUDED."googleClientId",
           "encryptedGoogleClientSecret" = EXCLUDED."encryptedGoogleClientSecret",
           "updatedAt" = NOW()`,
        [
          store.id,
          Boolean(googleEnabled),
          typeof googleClientId === "string" ? googleClientId.trim() : null,
          secretToSave,
        ]
      );

      return NextResponse.json({
        success: true,
        data: {
          googleEnabled: Boolean(googleEnabled),
          googleClientId: typeof googleClientId === "string" ? googleClientId.trim() : "",
          hasGoogleClientSecret: Boolean(secretToSave),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[PUT /api/stores/current/auth-config]", error);
    return NextResponse.json({ success: false, error: "Failed to save auth config" }, { status: 500 });
  }
}
