// src/app/api/stores/route.ts
// GET  /api/stores — get current user's store
// POST /api/stores — create store (onboarding)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createStoreSchema } from "@/validations/store.schema";
import { createStore, getStoreByOwnerId, userHasStore } from "@/services/store.service";
import { sendStoreCreatedEmail, sendWelcomeEmail } from "@/lib/brevo";
import { findUserById, findUserByEmail, createEmailUser } from "@/lib/db-pg";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ownerId = session.user.id || session.user.email!;
    const store = await getStoreByOwnerId(ownerId);

    if (!store) {
      return NextResponse.json({ success: false, error: "No store found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("[GET /api/stores]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Robust user resolution: try session.user.id, then fallback to email lookup
  let dbUser = session.user?.id
    ? await findUserById(session.user.id)
    : null;

  if (!dbUser && session.user?.email) {
    dbUser = await findUserByEmail(session.user.email.toLowerCase());
  }

  // Self-heal: If user has a valid authenticated session but was purged from DB (e.g. migration reset)
  if (!dbUser && session.user?.email) {
    try {
      dbUser = await createEmailUser({
        email: session.user.email.toLowerCase(),
        name: session.user.name || "Founder",
        password: "TempMigrationPass2026!",
        avatar: session.user.image || undefined,
      });
    } catch (e) {
      console.error("[POST /api/stores] Failed to auto-create missing user:", e);
    }
  }

  if (!dbUser) {
    return NextResponse.json(
      { success: false, error: "User session expired or user not found. Please log out and sign in again." },
      { status: 401 }
    );
  }

  const userId = dbUser.id;

  // Prevent duplicate store creation
  if (await userHasStore(userId)) {
    return NextResponse.json(
      { success: false, error: "You already have a store" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = createStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const store = await createStore(userId, parsed.data);

    // Send async emails (non-blocking — don't fail store creation if email fails)
    if (dbUser.email) {
      const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${store.slug}`;
      sendWelcomeEmail({ email: dbUser.email, name: dbUser.name ?? "there" }).catch(() => {});
      sendStoreCreatedEmail(
        { email: dbUser.email, name: dbUser.name ?? "there" },
        store.name,
        storeUrl
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, data: { id: store.id, slug: store.slug } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/stores]", error);
    const status = error?.status || error?.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create store" },
      { status }
    );
  }
}
