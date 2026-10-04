// src/app/api/stores/current/theme/route.ts
// PUT — update store theme settings

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { themeSettingsSchema } from "@/validations/store.schema";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = themeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const updatedTheme = await prisma.themeSettings.upsert({
      where: { storeId: store.id },
      update: parsed.data,
      create: {
        storeId: store.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: updatedTheme });
  } catch (error) {
    console.error("[PUT /api/stores/current/theme]", error);
    return NextResponse.json({ success: false, error: "Failed to update theme" }, { status: 500 });
  }
}
