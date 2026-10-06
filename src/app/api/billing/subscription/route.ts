// src/app/api/billing/subscription/route.ts
// GET — get current store subscription details

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { getStoreSubscription } from "@/lib/plan-limits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const subscription = await getStoreSubscription(store.id);

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        store: { id: store.id, name: store.name },
      },
    });
  } catch (error) {
    console.error("[GET /api/billing/subscription]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch subscription" }, { status: 500 });
  }
}
