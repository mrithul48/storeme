// src/app/api/orders/receipts/route.ts
// Secure endpoint to fetch order details and store information for receipt printing

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";

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
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];

    if (orderIds.length === 0) {
      return NextResponse.json({ success: false, error: "No orders specified" }, { status: 400 });
    }

    // Tenant-isolated query: orders must belong to this store
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        storeId: store.id,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            productName: true,
            productSku: true,
            variantColor: true,
            price: true,
            quantity: true,
            subtotal: true,
          },
        },
        payment: {
          select: {
            status: true,
            amount: true,
            currency: true,
            razorpayPaymentId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      orderChannel: o.orderChannel,
      subtotal: Number(o.subtotal),
      shippingCharge: Number(o.shippingCharge || 0),
      total: Number(o.total),
      notes: o.notes,
      shippingAddress: o.shippingAddress,
      customer: o.customer,
      items: o.items.map((it) => ({
        ...it,
        price: Number(it.price),
        subtotal: Number(it.subtotal),
      })),
      payment: o.payment
        ? {
            ...o.payment,
            amount: Number(o.payment.amount),
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        company: store.company
          ? {
              address: store.company.address,
              phone: store.company.phone,
              email: store.company.email,
              businessType: store.company.businessType,
            }
          : null,
      },
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("[POST /api/orders/receipts]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order receipts" }, { status: 500 });
  }
}
