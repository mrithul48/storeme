// src/app/api/brands/[id]/route.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId } from "@/services/store.service";
import { deleteBrand } from "@/services/category.service";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const deleted = await deleteBrand(store.id, id);
    if (!deleted) return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    console.error("[DELETE /api/brands/[id]]", error);
    return NextResponse.json({ success: false, error: "Failed to delete brand" }, { status: 500 });
  }
}
