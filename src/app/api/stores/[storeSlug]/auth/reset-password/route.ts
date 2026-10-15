// src/app/api/stores/[storeSlug]/auth/reset-password/route.ts
// Verifies password reset token and sets new password with automatic session establishment

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import {
  hashPassword,
  hashToken,
  createCustomerToken,
  getCustomerCookieName,
} from "@/lib/customer-auth";

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
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required. Please check the link sent to your email." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "New password is required." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(String(token).trim());

    // Find customer by valid unexpired token for this specific store
    const customer = await prisma.customer.findFirst({
      where: {
        storeId: store.id,
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(String(password));

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Generate tenant-safe session token so user is automatically authenticated
    const sessionToken = createCustomerToken({
      customerId: customer.id,
      storeId: store.id,
      email: customer.email,
      name: customer.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password has been successfully reset. Redirecting to your account…",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        username: customer.username,
        phone: customer.phone,
      },
    });

    const cookieName = getCustomerCookieName(store.id);
    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("[Customer Reset Password]", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
