// src/app/api/orders/receipts/route.ts
// Secure endpoint to fetch order details and store information for receipt printing via NestJS backend

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api";
import { getStoreByOwnerId } from "@/services/store.service";

export async function POST(request: Request) {
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
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];

    if (orderIds.length === 0) {
      return NextResponse.json({ success: false, error: "No orders specified" }, { status: 400 });
    }

    const res = await apiClient.post<any>(
      "/api/v1/orders/receipts",
      { orderIds },
      {
        storeId: store.id,
        internalUser: session.user,
      }
    );

    return NextResponse.json(res);
  } catch (error) {
    console.error("[POST /api/orders/receipts]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order receipts" }, { status: 500 });
  }
}
