// src/app/api/stores/[storeSlug]/checkout/route.ts
// Public checkout endpoint for a tenant store with multi-channel support (COD, Online, WhatsApp)
// Online payments use the MERCHANT'S own Razorpay account — not the platform account.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrder } from "@/services/order.service";
import { checkoutFormSchema } from "@/validations/order.schema";
import { sendOrderConfirmationEmail, sendMerchantNewOrderEmail } from "@/lib/brevo";
import { createMerchantRazorpay } from "@/lib/merchant-razorpay";

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
        company: true,
        owner: { select: { email: true } },
        merchantPaymentConfig: {
          where: { provider: "razorpay", isActive: true },
          take: 1,
        },
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

    // Determine and enforce enabled order channel
    const selectedMethod =
      paymentMethod === "RAZORPAY"
        ? "ONLINE_PAYMENT"
        : paymentMethod === "WHATSAPP"
        ? "WHATSAPP"
        : "COD";

    if (selectedMethod === "COD" && store.settings?.codEnabled === false) {
      return NextResponse.json(
        { success: false, error: "Cash on Delivery is currently disabled for this store" },
        { status: 400 }
      );
    }
    if (selectedMethod === "ONLINE_PAYMENT" && store.settings?.onlinePaymentEnabled === false) {
      return NextResponse.json(
        { success: false, error: "Online Payment is currently disabled for this store" },
        { status: 400 }
      );
    }
    if (selectedMethod === "WHATSAPP" && store.settings?.whatsappOrderEnabled === false) {
      return NextResponse.json(
        { success: false, error: "WhatsApp Ordering is currently disabled for this store" },
        { status: 400 }
      );
    }

    // For online payments, verify the merchant has a connected Razorpay account
    const merchantRazorpayConfig = store.merchantPaymentConfig?.[0] ?? null;
    if (selectedMethod === "ONLINE_PAYMENT" && !merchantRazorpayConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Online payment is not available for this store. The merchant has not connected a payment account.",
        },
        { status: 503 }
      );
    }

    // Create the order using secure order service (recalculates prices from DB)
    const order = await createOrder(store.id, {
      items: items.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      customer: customerValidation.data,
      paymentMethod: selectedMethod === "ONLINE_PAYMENT" ? "RAZORPAY" : selectedMethod,
      orderChannel: selectedMethod,
      notes,
    });

    let razorpayOrderData = null;
    let whatsappUrl: string | null = null;

    if (selectedMethod === "ONLINE_PAYMENT" && merchantRazorpayConfig) {
      try {
        // Use MERCHANT'S Razorpay — not the platform's
        const merchantRzp = createMerchantRazorpay(merchantRazorpayConfig);

        const rzpOrder = await merchantRzp.orders.create({
          amount: Math.round(Number(order.total) * 100), // paise
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            storeId: store.id,
            storeSlug: store.slug,
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });

        const rzpOrderTyped = rzpOrder as { id: string; amount: number | string; currency: string };
        const rzpOrderId = rzpOrderTyped.id;
        const rzpAmount =
          typeof rzpOrderTyped.amount === "number"
            ? rzpOrderTyped.amount
            : parseInt(String(rzpOrderTyped.amount));

        // Store payment intent record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: "INR",
            status: "PENDING",
            razorpayOrderId: rzpOrderId,
          },
        });

        razorpayOrderData = {
          id: rzpOrderId,
          amount: rzpAmount,
          currency: "INR",
          // Expose MERCHANT'S public key ID — never the platform key or any secret
          keyId: merchantRazorpayConfig.keyId,
        };
      } catch (rzpError) {
        console.warn("[Checkout] Merchant Razorpay order creation failed:", rzpError);
        return NextResponse.json(
          { success: false, error: "Payment could not be initiated. Please try again." },
          { status: 502 }
        );
      }
    } else if (selectedMethod === "WHATSAPP") {
      const rawPhone = store.company?.whatsapp || store.company?.phone || "";
      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

      const itemsList = order.items
        .map((i) => `• ${i.productName} × ${i.quantity} (₹${i.subtotal})`)
        .join("\n");

      const msg = `*New Order #${order.orderNumber}*\nStore: ${store.name}\n\n*Items:*\n${itemsList}\n\n*Total:* ₹${order.total}\n\n*Customer:*\nName: ${customerValidation.data.name}\nPhone: ${customerValidation.data.phone || "N/A"}\nAddress: ${customerValidation.data.address}, ${customerValidation.data.city}, ${customerValidation.data.state} - ${customerValidation.data.pincode}${notes ? `\n\n*Notes:* ${notes}` : ""}`;

      whatsappUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }

    // Trigger transactional emails for non-online or pending orders
    if (selectedMethod !== "ONLINE_PAYMENT") {
      const emailPayload = {
        orderNumber: order.orderNumber,
        storeName: store.name,
        customerName: customerValidation.data.name,
        customerEmail: customerValidation.data.email,
        customerPhone: customerValidation.data.phone || null,
        shippingAddress: customerValidation.data,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: Number(i.price),
          subtotal: Number(i.subtotal),
        })),
        subtotal: Number(order.subtotal),
        total: Number(order.total),
        channel: selectedMethod,
        paymentStatus: order.paymentStatus,
        orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/store/${store.slug}/orders/${order.orderNumber}`,
      };

      sendOrderConfirmationEmail(emailPayload, store.company?.email || null).catch((e) =>
        console.error("[Checkout] Brevo customer email error:", e)
      );

      const merchantEmail = store.company?.email || store.owner?.email;
      if (merchantEmail) {
        sendMerchantNewOrderEmail(merchantEmail, emailPayload).catch((e) =>
          console.error("[Checkout] Brevo merchant email error:", e)
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        orderChannel: order.orderChannel,
      },
      razorpayOrder: razorpayOrderData,
      whatsappUrl,
    });
  } catch (error) {
    console.error("[POST /api/stores/[storeSlug]/checkout]", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
