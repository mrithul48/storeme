// src/app/api/billing/webhook/route.ts
// POST — idempotent Razorpay webhook handler for payments and subscriptions

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendSubscriptionConfirmationEmail } from "@/lib/brevo";

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Idempotent processing of payment/order captured events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};

      if (notes.type === "SUBSCRIPTION" && notes.storeId && notes.planId) {
        const { storeId, planId } = notes;

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (plan) {
          const now = new Date();
          const oneYear = new Date(now);
          oneYear.setFullYear(oneYear.getFullYear() + 1);

          await prisma.subscription.upsert({
            where: { storeId },
            update: {
              planId,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: oneYear,
              razorpayPaymentId: paymentEntity.id,
            },
            create: {
              storeId,
              planId,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: oneYear,
              razorpayPaymentId: paymentEntity.id,
            },
          });

          // Fetch owner email for notification
          const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: { select: { email: true, name: true } } },
          });

          if (store?.owner?.email) {
            sendSubscriptionConfirmationEmail(
              { email: store.owner.email, name: store.owner.name || "Merchant" },
              plan.name,
              Number(plan.price)
            ).catch((err) => console.error("[Webhook] Brevo notification error:", err));
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[POST /api/billing/webhook]", error);
    return NextResponse.json({ success: false, error: "Webhook processing error" }, { status: 500 });
  }
}
