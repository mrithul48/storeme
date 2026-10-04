// src/lib/razorpay.ts
// Razorpay server-side utilities
// IMPORTANT: This file is server-only — never import in client components

import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

/**
 * Create a Razorpay order for subscription/payment
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paise (INR * 100)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: Math.round(params.amount * 100), // Convert rupees to paise
    currency: params.currency ?? "INR",
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    id: order.id,
    amount: typeof order.amount === "number" ? order.amount : parseInt(String(order.amount)),
    currency: order.currency,
  };
}

/**
 * Verify Razorpay payment signature
 * MUST be done server-side — never trust frontend payment data
 */
export function verifyRazorpaySignature(params: {
  razorpayOrderId?: string;
  orderId?: string;
  razorpayPaymentId?: string;
  paymentId?: string;
  razorpaySignature?: string;
  signature?: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const orderId = params.razorpayOrderId || params.orderId || "";
  const paymentId = params.razorpayPaymentId || params.paymentId || "";
  const sig = params.razorpaySignature || params.signature || "";

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === sig;
}

export const verifyPaymentSignature = verifyRazorpaySignature;

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Razorpay] RAZORPAY_WEBHOOK_SECRET not set");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );
}
