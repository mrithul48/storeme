// src/app/api/brands/route.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId } from "@/services/store.service";
import { listBrands, createBrand } from "@/services/category.service";
import { createBrandSchema } from "@/validations/category.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const brands = await listBrands(store.id);
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("[GET /api/brands]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
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
    const parsed = createBrandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const brand = await createBrand(store.id, parsed.data);
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/brands]", error);
    return NextResponse.json({ success: false, error: "Failed to create brand" }, { status: 500 });
  }
}
