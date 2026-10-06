// src/app/api/stores/[storeSlug]/auth/forgot-password/route.ts
// Secure password reset request with Brevo email

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import { generateToken } from "@/lib/customer-auth";
import { sendCustomerPasswordResetEmail } from "@/lib/brevo";
import { getStoreLink } from "@/lib/store-url";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const store = await getStorefrontConfig(storeSlug);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check customer for this store
    const customer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: cleanEmail,
        },
      },
    });

    if (customer) {
      const { token, tokenHash } = generateToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          passwordResetToken: tokenHash,
          passwordResetExpires: expires,
        },
      });

      // Construct reset URL respecting custom domain or default store URL
      const origin =
        request.headers.get("x-forwarded-proto") && request.headers.get("host")
          ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const resetPath = getStoreLink(storeSlug, `/account/reset-password?token=${token}`);
      const resetUrl = `${origin}${resetPath}`;

      await sendCustomerPasswordResetEmail(
        { email: customer.email, name: customer.name },
        store.name,
        resetUrl
      );
    }

    // Generic response regardless of whether email was found (prevents email enumeration attacks)
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("[Customer Forgot Password]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
