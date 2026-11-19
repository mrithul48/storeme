// src/app/api/categories/[id]/route.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId } from "@/services/store.service";
import { updateCategory, deleteCategory } from "@/services/category.service";
import { updateCategorySchema } from "@/validations/category.schema";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const updated = await updateCategory(store.id, id, parsed.data);
    if (!updated) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/categories/[id]]", error);
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const deleted = await deleteCategory(store.id, id);
    if (!deleted) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error);
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}
