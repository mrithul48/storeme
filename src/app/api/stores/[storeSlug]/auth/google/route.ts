// src/app/api/stores/[storeSlug]/auth/google/route.ts
// Initiates Google OAuth flow for a specific merchant's live store

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const store = await getStorefrontConfig(storeSlug);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const authConfig = await prisma.merchantAuthConfig.findUnique({
      where: { storeId: store.id },
    });

    if (!authConfig?.googleEnabled || !authConfig?.googleClientId || !authConfig?.encryptedGoogleClientSecret) {
      return NextResponse.json(
        { success: false, error: "Google login is not enabled or configured for this store" },
        { status: 400 }
      );
    }

    const host = request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;

    const redirectUri = `${origin}/api/stores/${storeSlug}/auth/google/callback`;

    // State encodes store info and random nonce to prevent CSRF
    const statePayload = {
      storeId: store.id,
      storeSlug,
      nonce: crypto.randomBytes(16).toString("hex"),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", authConfig.googleClientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("[Customer Google Auth Initiate]", error);
    return NextResponse.json({ success: false, error: "Failed to initiate Google login" }, { status: 500 });
  }
}
