// src/app/api/billing/checkout/route.ts
// POST — initiate subscription upgrade via NestJS backend and Razorpay
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { initiateSubscriptionCheckout } from "@/services/subscription.service";

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
    const { planId, billingPeriod = "YEARLY" } = body;

    if (!planId) {
      return NextResponse.json({ success: false, error: "Plan ID is required" }, { status: 400 });
    }

    const checkoutData = await initiateSubscriptionCheckout(store.id, planId, billingPeriod);

    return NextResponse.json({
      success: true,
      data: checkoutData,
    });
  } catch (error: any) {
    console.error("[POST /api/billing/checkout]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate billing checkout" },
      { status: 500 },
    );
  }
}
