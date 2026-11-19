// src/app/api/stores/current/payment/razorpay/route.ts
// Merchant Razorpay Connect/Disconnect API
// POST   — connect or update Razorpay credentials (validates, encrypts, stores)
// GET    — fetch connection status (never returns the secret)
// DELETE — disconnect Razorpay (soft-delete: sets isActive=false)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { pgPool } from "@/lib/db-pg";
import { getStoreByOwnerId } from "@/services/store.service";
import { encryptSecret } from "@/lib/crypto";
import { validateMerchantCredentials } from "@/lib/merchant-razorpay";

// ─── GET: Connection Status ────────────────────────────────────────────────────
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
      id: string;
      keyId: string;
      isActive: boolean;
      mode: string;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `SELECT id, "keyId", "isActive", mode, "createdAt", "updatedAt"
       FROM "MerchantPaymentConfig"
       WHERE "storeId" = $1 AND provider = 'razorpay'
       LIMIT 1`,
      [store.id]
    );

    const config = res.rows[0];

    if (!config) {
      return NextResponse.json({ success: true, data: { connected: false } });
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: config.isActive,
        keyId: config.keyId,
        mode: config.mode,
        connectedAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/stores/current/payment/razorpay]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// ─── POST: Connect / Update Credentials ───────────────────────────────────────
export async function POST(request: Request) {
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
    const { keyId, keySecret, mode } = body;

    // Basic field validation
    if (!keyId || typeof keyId !== "string" || keyId.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "A valid Razorpay Key ID is required" },
        { status: 422 }
      );
    }
    if (!keySecret || typeof keySecret !== "string" || keySecret.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "A valid Razorpay Key Secret is required" },
        { status: 422 }
      );
    }

    const trimmedKeyId = keyId.trim();
    const trimmedSecret = keySecret.trim();
    const resolvedMode = mode === "live" ? "live" : "test";

    // Validate credentials against Razorpay API server-side
    const validation = await validateMerchantCredentials(trimmedKeyId, trimmedSecret);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to connect Razorpay. Please verify your Key ID and Key Secret.",
        },
        { status: 400 }
      );
    }

    // Encrypt the secret — never store plain text
    const encryptedSecret = encryptSecret(trimmedSecret);

    // Upsert: create or replace merchant config
    await pgPool.query(
      `INSERT INTO "MerchantPaymentConfig" (id, "storeId", provider, "keyId", "encryptedSecret", "isActive", mode, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, 'razorpay', $2, $3, true, $4, NOW())
       ON CONFLICT ("storeId", provider) DO UPDATE SET
         "keyId" = EXCLUDED."keyId",
         "encryptedSecret" = EXCLUDED."encryptedSecret",
         "isActive" = true,
         mode = EXCLUDED.mode,
         "updatedAt" = NOW()`,
      [store.id, trimmedKeyId, encryptedSecret, resolvedMode]
    );

    return NextResponse.json({
      success: true,
      message: "Razorpay connected successfully",
      data: { connected: true, keyId: trimmedKeyId, mode: resolvedMode },
    });
  } catch (error) {
    console.error("[POST /api/stores/current/payment/razorpay]", error);
    return NextResponse.json({ success: false, error: "Failed to connect Razorpay" }, { status: 500 });
  }
}

// ─── DELETE: Disconnect ────────────────────────────────────────────────────────
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const existing = await pgPool.query<{ id: string }>(
      `SELECT id FROM "MerchantPaymentConfig" WHERE "storeId" = $1 AND provider = 'razorpay' LIMIT 1`,
      [store.id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Razorpay is not connected" }, { status: 404 });
    }

    // Soft-delete: keep historical payment references intact
    await pgPool.query(
      `UPDATE "MerchantPaymentConfig" SET "isActive" = false, "updatedAt" = NOW() WHERE "storeId" = $1 AND provider = 'razorpay'`,
      [store.id]
    );

    return NextResponse.json({ success: true, message: "Razorpay disconnected" });
  } catch (error) {
    console.error("[DELETE /api/stores/current/payment/razorpay]", error);
    return NextResponse.json({ success: false, error: "Failed to disconnect Razorpay" }, { status: 500 });
  }
}
