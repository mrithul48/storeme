// src/app/api/stores/[storeSlug]/auth/google/callback/route.ts
// Handles Google OAuth callback, decrypts merchant secret, upserts customer, and sets session

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import { decryptSecret } from "@/lib/crypto";
import { createCustomerToken, getCustomerCookieName } from "@/lib/customer-auth";
import { getStoreLink } from "@/lib/store-url";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const loginRedirect = `${origin}${getStoreLink(storeSlug, "/account/login?error=oauth_failed")}`;

  if (errorParam || !code || !state) {
    console.error("[Google OAuth Callback] Error or missing code/state:", errorParam);
    return NextResponse.redirect(loginRedirect);
  }

  try {
    const store = await getStorefrontConfig(storeSlug);
    if (!store) {
      return NextResponse.redirect(loginRedirect);
    }

    // Verify state token
    let stateData: { storeId: string; storeSlug: string } | null = null;
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch {
      return NextResponse.redirect(loginRedirect);
    }

    if (stateData?.storeId !== store.id) {
      console.error("[Google OAuth Callback] Store ID mismatch in state token");
      return NextResponse.redirect(loginRedirect);
    }

    // Load merchant OAuth credentials
    const authConfig = await prisma.merchantAuthConfig.findUnique({
      where: { storeId: store.id },
    });

    if (
      !authConfig?.googleEnabled ||
      !authConfig?.googleClientId ||
      !authConfig?.encryptedGoogleClientSecret
    ) {
      console.error("[Google OAuth Callback] Store Google auth not configured");
      return NextResponse.redirect(loginRedirect);
    }

    // Decrypt merchant secret securely on server
    const clientSecret = decryptSecret(authConfig.encryptedGoogleClientSecret);
    const redirectUri = `${origin}/api/stores/${storeSlug}/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: authConfig.googleClientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("[Google OAuth Callback] Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(loginRedirect);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoResponse.ok) {
      console.error("[Google OAuth Callback] Fetching Google profile failed");
      return NextResponse.redirect(loginRedirect);
    }

    const googleUser = await userinfoResponse.json();
    const email = googleUser.email?.toLowerCase();
    const name = googleUser.name || "Customer";
    const googleId = googleUser.sub;

    if (!email) {
      return NextResponse.redirect(loginRedirect);
    }

    // Tenant-isolated customer upsert
    const customer = await prisma.customer.upsert({
      where: {
        storeId_email: {
          storeId: store.id,
          email,
        },
      },
      update: {
        googleId,
        name: name || undefined,
      },
      create: {
        storeId: store.id,
        email,
        name,
        googleId,
      },
    });

    // Generate customer session token
    const sessionToken = createCustomerToken({
      customerId: customer.id,
      storeId: store.id,
      email: customer.email,
      name: customer.name,
    });

    const accountUrl = `${origin}${getStoreLink(storeSlug, "/account")}`;
    const response = NextResponse.redirect(accountUrl);

    const cookieName = getCustomerCookieName(store.id);
    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[Google OAuth Callback] Unexpected error:", error);
    return NextResponse.redirect(loginRedirect);
  }
}
