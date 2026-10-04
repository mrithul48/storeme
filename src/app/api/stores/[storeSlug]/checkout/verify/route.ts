// src/app/api/stores/[storeSlug]/checkout/verify/route.ts
// Verifies Razorpay payment signature & marks order PAID

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";

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

    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order and payment status
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

    // Send emails
    if (updatedOrder && updatedOrder.customer) {
      const { sendOrderConfirmationEmail, sendMerchantNewOrderEmail } = await import("@/lib/brevo");
      const emailPayload = {
        orderNumber: updatedOrder.orderNumber,
        storeName: updatedOrder.store.name,
        customerName: updatedOrder.customer.name,
        customerEmail: updatedOrder.customer.email,
        customerPhone: updatedOrder.customer.phone || null,
        shippingAddress: updatedOrder.shippingAddress as any,
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
