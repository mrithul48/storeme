// src/app/api/categories/route.ts
// GET  — list store categories
// POST — create category

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId } from "@/services/store.service";
import { listCategories, createCategory } from "@/services/category.service";
import { createCategorySchema } from "@/validations/category.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const categories = await listCategories(store.id);
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const category = await createCategory(store.id, parsed.data);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
