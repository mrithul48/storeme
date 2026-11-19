// src/app/api/auth/register/route.ts
// POST — create an email/password account (native pg, no Prisma)

import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/validations/auth.schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { findUserByEmail, createEmailUser } from "@/lib/db-pg";

export async function POST(request: Request) {
  const rl = rateLimit(`register:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 }
      );
    }
    const { name, email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      // Never attach a password to an existing (e.g. Google-only) account without proof of ownership.
      // Owners can use "Forgot password" which verifies the mailbox.
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists. Sign in, or use Forgot password to set a password.",
        },
        { status: 409 }
      );
    }

    await createEmailUser({
      email,
      name,
      password: await hashPassword(password),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ success: false, error: "Unable to create account" }, { status: 500 });
  }
}
