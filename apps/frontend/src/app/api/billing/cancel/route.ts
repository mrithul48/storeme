// src/app/api/billing/cancel/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { cancelSubscription } from "@/services/subscription.service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body?.reason;
    } catch {
      // no body
    }

    const res = await cancelSubscription(store.id, reason);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[POST /api/billing/cancel]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

