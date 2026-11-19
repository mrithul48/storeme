// src/app/api/billing/verify/route.ts
// POST — verify Razorpay payment signature for subscription via NestJS backend
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { verifySubscriptionPayment } from "@/services/subscription.service";

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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId, billingPeriod = "YEARLY" } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
      return NextResponse.json({ success: false, error: "Missing required verification parameters" }, { status: 400 });
    }

    const result = await verifySubscriptionPayment(store.id, {
      planId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      billingPeriod,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/billing/verify]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 400 },
    );
  }
}
