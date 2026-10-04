// src/app/api/stores/route.ts
// GET  /api/stores — get current user's store
// POST /api/stores — create store (onboarding)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createStoreSchema } from "@/validations/store.schema";
import { createStore, getStoreByOwnerId, userHasStore } from "@/services/store.service";
import { sendStoreCreatedEmail, sendWelcomeEmail } from "@/lib/brevo";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
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
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Prevent duplicate store creation
  if (await userHasStore(session.user.id)) {
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
    const store = await createStore(session.user.id, parsed.data);

    // Send async emails (non-blocking — don't fail store creation if email fails)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (user?.email) {
      const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${store.slug}`;
      sendWelcomeEmail({ email: user.email, name: user.name ?? "there" }).catch(() => {});
      sendStoreCreatedEmail(
        { email: user.email, name: user.name ?? "there" },
        store.name,
        storeUrl
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, data: { id: store.id, slug: store.slug } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stores]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create store" },
      { status: 500 }
    );
  }
}
