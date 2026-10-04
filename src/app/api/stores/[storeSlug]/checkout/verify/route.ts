// src/app/api/stores/[storeSlug]/checkout/verify/route.ts
// Verifies Razorpay payment signature using MERCHANT'S secret & marks order PAID.
// The storeSlug is used to resolve the merchant's Razorpay config for HMAC verification.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { decryptSecret } from "@/lib/crypto";

type RouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { storeSlug } = await params;

  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing required payment fields" }, { status: 400 });
    }

    // Resolve the store to get its merchant Razorpay config
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        merchantPaymentConfig: {
          where: { provider: "razorpay", isActive: true },
          take: 1,
        },
        company: true,
        owner: { select: { email: true } },
      },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const merchantConfig = store.merchantPaymentConfig?.[0] ?? null;
    if (!merchantConfig) {
      return NextResponse.json(
        { success: false, error: "Merchant payment configuration not found" },
        { status: 503 }
      );
    }

    // Decrypt the merchant secret server-side — only in memory, never logged
    const merchantSecret = decryptSecret(merchantConfig.encryptedSecret);

    // Verify signature using merchant's own secret (HMAC-SHA256)
    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", merchantSecret)
      .update(signatureBody)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(razorpaySignature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order and payment status atomically
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
        include: {
          items: true,
          customer: true,
          store: {
            include: {
              company: true,
              owner: { select: { email: true } },
            },
          },
        },
      }),
      prisma.payment.upsert({
        where: { orderId },
        update: {
          razorpayPaymentId,
          razorpaySignature,
          status: "PAID",
        },
        create: {
          orderId,
          amount: 0,
          currency: "INR",
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          status: "PAID",
        },
      }),
    ]);

    // Send confirmation emails after successful verification
    if (updatedOrder && updatedOrder.customer) {
      const { sendOrderConfirmationEmail, sendMerchantNewOrderEmail } = await import("@/lib/brevo");
      const emailPayload = {
        orderNumber: updatedOrder.orderNumber,
        storeName: updatedOrder.store.name,
        customerName: updatedOrder.customer.name,
        customerEmail: updatedOrder.customer.email,
        customerPhone: updatedOrder.customer.phone || null,
        shippingAddress: updatedOrder.shippingAddress as Record<string, unknown>,
        items: updatedOrder.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: Number(i.price),
          subtotal: Number(i.subtotal),
        })),
        subtotal: Number(updatedOrder.subtotal),
        total: Number(updatedOrder.total),
        channel: updatedOrder.orderChannel,
        paymentStatus: "PAID",
        orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/store/${storeSlug}/orders/${updatedOrder.orderNumber}`,
      };

      sendOrderConfirmationEmail(emailPayload, updatedOrder.store.company?.email || null).catch((e) =>
        console.error("[Verify] Brevo customer email error:", e)
      );

      const merchantEmail = updatedOrder.store.company?.email || updatedOrder.store.owner?.email;
      if (merchantEmail) {
        sendMerchantNewOrderEmail(merchantEmail, emailPayload).catch((e) =>
          console.error("[Verify] Brevo merchant email error:", e)
        );
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[POST checkout/verify]", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
