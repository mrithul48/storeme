// src/app/api/stores/[storeSlug]/auth/reset-password/route.ts
// Verifies password reset token and sets new password

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import { hashPassword, hashToken } from "@/lib/customer-auth";

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

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
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
        { success: false, error: "Invalid or expired password reset link" },
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

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("[Customer Reset Password]", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
