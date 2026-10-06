// src/app/api/stores/current/auth-config/route.ts
// Merchant API to configure store-specific customer authentication (Google OAuth)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

    const config = await prisma.merchantAuthConfig.findUnique({
      where: { storeId: store.id },
    });

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

    await prisma.merchantAuthConfig.upsert({
      where: { storeId: store.id },
      update: {
        googleEnabled: Boolean(googleEnabled),
        googleClientId: typeof googleClientId === "string" ? googleClientId.trim() : null,
        ...(encryptedSecret !== undefined ? { encryptedGoogleClientSecret: encryptedSecret } : {}),
      },
      create: {
        storeId: store.id,
        googleEnabled: Boolean(googleEnabled),
        googleClientId: typeof googleClientId === "string" ? googleClientId.trim() : null,
        encryptedGoogleClientSecret: encryptedSecret || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        googleEnabled: Boolean(googleEnabled),
        googleClientId: typeof googleClientId === "string" ? googleClientId.trim() : "",
        hasGoogleClientSecret: Boolean(encryptedSecret || (await prisma.merchantAuthConfig.findUnique({ where: { storeId: store.id } }))?.encryptedGoogleClientSecret),
      },
    });
  } catch (error) {
    console.error("[PUT /api/stores/current/auth-config]", error);
    return NextResponse.json({ success: false, error: "Failed to save auth config" }, { status: 500 });
  }
}
