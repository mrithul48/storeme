// src/app/api/billing/verify/route.ts
// POST — verify Razorpay payment signature for subscription and activate plan

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendSubscriptionConfirmationEmail } from "@/lib/brevo";

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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
      return NextResponse.json({ success: false, error: "Missing required verification parameters" }, { status: 400 });
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    const now = new Date();
    const oneYearFromNow = new Date(now);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Update or create subscription
    const updatedSub = await prisma.subscription.upsert({
      where: { storeId: store.id },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: oneYearFromNow,
        razorpayPaymentId: razorpayPaymentId,
      },
      create: {
        storeId: store.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: oneYearFromNow,
        razorpayPaymentId: razorpayPaymentId,
      },
      include: { plan: true },
    });

    // Send confirmation email
    if (session.user.email) {
      sendSubscriptionConfirmationEmail(
        { email: session.user.email, name: session.user.name || "Merchant" },
        plan.name,
        Number(plan.price)
      ).catch((e) => console.error("[Billing] Brevo email error:", e));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      subscription: updatedSub,
    });
  } catch (error) {
    console.error("[POST /api/billing/verify]", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
