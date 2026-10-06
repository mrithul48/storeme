// src/app/api/auth/forgot-password/route.ts
// POST — request a password reset link. Always returns the same response to prevent email enumeration.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/password";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/brevo";
import { forgotPasswordSchema } from "@/validations/auth.schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const RESET_TTL_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000).ok) {
    return NextResponse.json({ success: false, error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Valid email is required" }, { status: 422 });
  }

  if (!isEmailConfigured()) {
    // Honest failure: we cannot deliver a reset link without an email provider.
    return NextResponse.json(
      { success: false, error: "Password reset is temporarily unavailable. Please contact support." },
      { status: 503 }
    );
  }

  const { email } = parsed.data;
  // Per-email throttle too, so one address can't be spammed from many IPs.
  const emailAllowed = rateLimit(`forgot-email:${email}`, 3, 15 * 60 * 1000).ok;

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
    if (user && emailAllowed) {
      const { token, tokenHash } = generateToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: tokenHash, passwordResetExpires: new Date(Date.now() + RESET_TTL_MS) },
      });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
      const result = await sendPasswordResetEmail(user, `${appUrl}/auth/reset-password?token=${token}`);
      if (!result.sent) console.error("[forgot-password] reset email not delivered for user", user.id);
    }
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });
}
