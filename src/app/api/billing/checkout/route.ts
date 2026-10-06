// src/app/api/billing/checkout/route.ts
// POST — initiate subscription upgrade via Razorpay

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { createRazorpayOrder } from "@/lib/razorpay";

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
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ success: false, error: "Plan ID is required" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId, status: "ACTIVE" },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found or inactive" }, { status: 404 });
    }

    const amountInRupees = Number(plan.price);

    const rzpOrder = await createRazorpayOrder({
      amount: amountInRupees,
      currency: "INR",
      receipt: `sub_${store.slug}_${Date.now()}`,
      notes: {
        storeId: store.id,
        planId: plan.id,
        planName: plan.name,
        type: "SUBSCRIPTION",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        plan: {
          id: plan.id,
          name: plan.name,
          price: amountInRupees,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/billing/checkout]", error);
    return NextResponse.json({ success: false, error: "Failed to initiate billing checkout" }, { status: 500 });
  }
}
