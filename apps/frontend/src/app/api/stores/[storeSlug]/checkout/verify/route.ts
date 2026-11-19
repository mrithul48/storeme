// src/app/api/stores/[storeSlug]/checkout/verify/route.ts
// Verifies Razorpay payment signature using MERCHANT'S secret & marks order PAID.
// The storeSlug is used to resolve the merchant's Razorpay config for HMAC verification.

import { NextResponse } from "next/server";
import { pgPool } from "@/lib/db-pg";
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
    const storeRes = await pgPool.query<{
      id: string;
      name: string;
      slug: string;
      ownerId: string;
    }>(
      `SELECT id, name, slug, "ownerId" FROM "Store" WHERE slug = $1 LIMIT 1`,
      [storeSlug]
    );

    const store = storeRes.rows[0];
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const [configRes, companyRes, ownerRes] = await Promise.all([
      pgPool.query<{ encryptedSecret: string }>(
        `SELECT "encryptedSecret" FROM "MerchantPaymentConfig" WHERE "storeId" = $1 AND provider = 'razorpay' AND "isActive" = true LIMIT 1`,
        [store.id]
      ),
      pgPool.query<{ email: string }>(`SELECT email FROM "CompanyDetails" WHERE "storeId" = $1 LIMIT 1`, [store.id]),
      pgPool.query<{ email: string }>(`SELECT email FROM "User" WHERE id = $1 LIMIT 1`, [store.ownerId]),
    ]);

    const merchantConfig = configRes.rows[0] ?? null;
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
    const client = await pgPool.connect();
    let updatedOrder: any = null;

    try {
      await client.query("BEGIN");

      const updateRes = await client.query(
        `UPDATE "Order"
            SET "paymentStatus" = 'PAID', status = 'CONFIRMED', "updatedAt" = NOW()
          WHERE (id = $1 OR "orderNumber" = $1) AND "storeId" = $2
          RETURNING *`,
        [orderId, store.id]
      );
      updatedOrder = updateRes.rows[0];

      if (!updatedOrder) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      await client.query(
        `INSERT INTO "Payment" (id, "orderId", amount, currency, "razorpayOrderId", "razorpayPaymentId", "razorpaySignature", status, "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, 'INR', $3, $4, $5, 'PAID', NOW())
         ON CONFLICT ("orderId") DO UPDATE SET
           "razorpayPaymentId" = EXCLUDED."razorpayPaymentId",
           "razorpaySignature" = EXCLUDED."razorpaySignature",
           status = 'PAID',
           "updatedAt" = NOW()`,
        [updatedOrder.id, updatedOrder.total || 0, razorpayOrderId, razorpayPaymentId, razorpaySignature]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // Send confirmation emails after successful verification
    if (updatedOrder) {
      const [itemsRes, custRes] = await Promise.all([
        pgPool.query(`SELECT * FROM "OrderItem" WHERE "orderId" = $1`, [updatedOrder.id]),
        pgPool.query(`SELECT * FROM "Customer" WHERE id = $1`, [updatedOrder.customerId]),
      ]);

      const customer = custRes.rows[0];
      if (customer) {
        const { sendOrderConfirmationEmail, sendMerchantNewOrderEmail } = await import("@/lib/brevo");
        const emailPayload = {
          orderNumber: updatedOrder.orderNumber,
          storeName: store.name,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || null,
          shippingAddress: updatedOrder.shippingAddress as Record<string, unknown>,
          items: itemsRes.rows.map((i: any) => ({
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

        const companyEmail = companyRes.rows[0]?.email || null;
        sendOrderConfirmationEmail(emailPayload, companyEmail).catch((e) =>
          console.error("[Verify] Brevo customer email error:", e)
        );

        const merchantEmail = companyEmail || ownerRes.rows[0]?.email;
        if (merchantEmail) {
          sendMerchantNewOrderEmail(merchantEmail, emailPayload).catch((e) =>
            console.error("[Verify] Brevo merchant email error:", e)
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[POST checkout/verify]", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
