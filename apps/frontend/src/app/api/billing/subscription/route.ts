// src/app/api/billing/subscription/route.ts
// GET — get current store subscription details via NestJS backend
// DELETE / POST — cancel subscription
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { getCurrentSubscription, cancelSubscription } from "@/services/subscription.service";

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

    const data = await getCurrentSubscription(store.id);

    return NextResponse.json({
      success: true,
      data: {
        subscription: data.subscription,
        limits: data.limits,
        payments: data.payments,
        store: { id: store.id, name: store.name },
      },
    });
  } catch (error: any) {
    console.error("[GET /api/billing/subscription]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch subscription" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
      reason = body.reason;
    } catch {
      // no body
    }

    const res = await cancelSubscription(store.id, reason);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[DELETE /api/billing/subscription]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to cancel subscription" }, { status: 500 });
  }
}
