// src/app/api/orders/route.ts
// GET — list store orders for dashboard

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId } from "@/services/store.service";
import { listOrders } from "@/services/order.service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;

    const result = await listOrders(store.id, {
      page,
      limit,
      search,
      status,
      paymentStatus,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
