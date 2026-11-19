// src/app/api/auth/reset-password/route.ts
// POST — consume a reset token and set a new password (token is single-use and expiring).
// Native pg, no Prisma.

import { NextResponse } from "next/server";
import { hashPassword, hashToken } from "@/lib/password";
import { resetPasswordSchema } from "@/validations/auth.schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { consumePasswordResetToken } from "@/lib/db-pg";

export async function POST(request: Request) {
  if (!rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000).ok) {
    return NextResponse.json({ success: false, error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 }
    );
  }

  try {
    const tokenHash = hashToken(parsed.data.token);
    const newHash = await hashPassword(parsed.data.password);

    // Atomic consume: only succeeds if token matches AND is unexpired; clears token in the same write.
    const consumed = await consumePasswordResetToken(tokenHash, newHash);

    if (!consumed) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json({ success: false, error: "Unable to reset password" }, { status: 500 });
  }
}
