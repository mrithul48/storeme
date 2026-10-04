// src/app/api/products/route.ts
// GET  /api/products  — paginated product list
// POST /api/products  — create product

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { productQuerySchema, createProductSchema } from "@/validations/product.schema";
import { listProducts, createProduct } from "@/services/product.service";
import { getStoreByOwnerId } from "@/services/store.service";

async function getAuthenticatedStore(userId: string) {
  const store = await getStoreByOwnerId(userId);
  if (!store) throw new Error("STORE_NOT_FOUND");
  return store;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getAuthenticatedStore(session.user.id);
    const { searchParams } = new URL(request.url);
    const params = productQuerySchema.parse(Object.fromEntries(searchParams));

    const result = await listProducts(store.id, params);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "STORE_NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }
    console.error("[GET /api/products]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getAuthenticatedStore(session.user.id);
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const product = await createProduct(store.id, parsed.data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "STORE_NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }
    console.error("[POST /api/products]", error);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
