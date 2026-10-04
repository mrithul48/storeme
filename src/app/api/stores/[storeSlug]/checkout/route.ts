// src/app/api/stores/[storeSlug]/checkout/route.ts
// Public checkout endpoint for a tenant store

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrder } from "@/services/order.service";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkoutFormSchema } from "@/validations/order.schema";

type RouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { storeSlug } = await params;

  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, status: "ACTIVE" },
      include: {
        settings: true,
      },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found or inactive" }, { status: 404 });
    }

    if (!store.settings?.ordersEnabled) {
      return NextResponse.json(
        { success: false, error: "This store is currently not accepting new orders" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { items, customer, paymentMethod, notes } = body;

    // Validate customer form
    const customerValidation = checkoutFormSchema.safeParse(customer);
    if (!customerValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid customer details", details: customerValidation.error.flatten() },
        { status: 422 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    // Create the order using secure order service (recalculates prices from DB)
    const order = await createOrder(store.id, {
      items: items.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      customer: customerValidation.data,
      paymentMethod: paymentMethod === "RAZORPAY" ? "RAZORPAY" : "COD",
      notes,
    });

    let razorpayOrderData = null;

    if (paymentMethod === "RAZORPAY") {
      try {
        const rzpOrder = await createRazorpayOrder({
          amount: Number(order.total),
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            storeId: store.id,
            storeSlug: store.slug,
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });

        // Store payment intent record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: "INR",
            status: "PENDING",
            razorpayOrderId: rzpOrder.id,
          },
        });

        razorpayOrderData = {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        };
      } catch (rzpError) {
        console.warn("Razorpay order creation failed, falling back to COD", rzpError);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
      },
      razorpayOrder: razorpayOrderData,
    });
  } catch (error) {
    console.error("[POST /api/stores/[storeSlug]/checkout]", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
