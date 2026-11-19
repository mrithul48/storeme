// src/lib/brevo.ts
// Brevo (Sendinblue) transactional email service — server-only.
// sendEmail returns a real result; callers must never claim "email sent" unless sent === true.

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface EmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
}

export type EmailResult = { sent: true } | { sent: false; reason: "NOT_CONFIGURED" | "PROVIDER_ERROR" };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

/** Escape user-controlled values before interpolating into HTML emails. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

/**
 * Send a transactional email via Brevo.
 * All email sending happens server-side — API key never exposed to browser.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "EcomBuilder";

  if (!apiKey || !senderEmail) {
    console.warn("[Brevo] Email not sent — BREVO_API_KEY or BREVO_SENDER_EMAIL missing");
    return { sent: false, reason: "NOT_CONFIGURED" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey, accept: "application/json" },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        ...(options.textContent ? { textContent: options.textContent } : {}),
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[Brevo] Email send failed:", response.status, await response.text());
      return { sent: false, reason: "PROVIDER_ERROR" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[Brevo] Network error:", error);
    return { sent: false, reason: "PROVIDER_ERROR" };
  }
}

const wrap = (inner: string) =>
  `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color:#111827;">${inner}</div>`;

const button = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">${escapeHtml(label)}</a>`;

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: { email: string; name: string }) {
  return sendEmail({
    to: [to],
    subject: "Welcome to EcomBuilder!",
    htmlContent: wrap(`
      <h1>Welcome, ${escapeHtml(to.name)}!</h1>
      <p style="color:#4b5563;">Your account has been created successfully. You're ready to build your online store.</p>
      ${button(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`, "Create Your Store")}
    `),
  });
}

export async function sendStoreCreatedEmail(to: { email: string; name: string }, storeName: string, storeUrl: string) {
  return sendEmail({
    to: [to],
    subject: `Your store "${storeName}" is live!`,
    htmlContent: wrap(`
      <h1>Your store is live!</h1>
      <p style="color:#4b5563;"><strong>${escapeHtml(storeName)}</strong> has been successfully created.</p>
      <p style="color:#4b5563;">Your store URL: <a href="${escapeHtml(storeUrl)}" style="color:#16a34a;">${escapeHtml(storeUrl)}</a></p>
      ${button(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, "Go to Dashboard")}
    `),
  });
}

export async function sendPasswordResetEmail(to: { email: string; name?: string | null }, resetUrl: string) {
  return sendEmail({
    to: [{ email: to.email, name: to.name ?? undefined }],
    subject: "Reset your password",
    htmlContent: wrap(`
      <h1>Reset your password</h1>
      <p style="color:#4b5563;">We received a request to reset your password. This link expires in 30 minutes and can be used once.</p>
      ${button(resetUrl, "Reset Password")}
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
    `),
    textContent: `Reset your password (expires in 30 minutes): ${resetUrl}`,
  });
}

export const ORDER_CHANNEL_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  ONLINE_PAYMENT: "Online Payment",
  WHATSAPP: "WhatsApp Order",
};

export interface OrderEmailData {
  orderNumber: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  channel: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  items: { productName: string; quantity: number; price: number; subtotal: number }[];
  shippingAddress?: { address?: string; city?: string; state?: string; pincode?: string } | null;
  orderUrl?: string;
}

function orderTable(d: OrderEmailData) {
  const rows = d.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${escapeHtml(i.productName)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">${inr(i.subtotal)}</td>
      </tr>`
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <thead><tr style="color:#6b7280;text-align:left;">
        <th style="padding-bottom:8px;">Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;color:#4b5563;margin:12px 0 0;">Subtotal: ${inr(d.subtotal)}</p>
    <p style="text-align:right;font-size:16px;margin:4px 0 0;"><strong>Total: ${inr(d.total)}</strong></p>
    <p style="color:#4b5563;margin-top:16px;">Order method: <strong>${escapeHtml(ORDER_CHANNEL_LABELS[d.channel] ?? d.channel)}</strong>
    &nbsp;·&nbsp; Payment: <strong>${escapeHtml(d.paymentStatus)}</strong></p>`;
}

export async function sendOrderConfirmationEmail(d: OrderEmailData, replyTo?: string | null) {
  return sendEmail({
    to: [{ email: d.customerEmail, name: d.customerName }],
    subject: `Order received — ${d.orderNumber} (${d.storeName})`,
    replyTo: replyTo ? { email: replyTo, name: d.storeName } : undefined,
    htmlContent: wrap(`
      <h1 style="margin-bottom:4px;">Thank you, ${escapeHtml(d.customerName)}!</h1>
      <p style="color:#4b5563;">Your order <strong>${escapeHtml(d.orderNumber)}</strong> from <strong>${escapeHtml(d.storeName)}</strong> has been received.</p>
      ${orderTable(d)}
      ${d.orderUrl ? button(d.orderUrl, "View Order") : ""}
    `),
  });
}

export async function sendMerchantNewOrderEmail(merchantEmail: string, d: OrderEmailData) {
  const addr = d.shippingAddress
    ? [d.shippingAddress.address, d.shippingAddress.city, d.shippingAddress.state, d.shippingAddress.pincode]
        .filter(Boolean)
        .map(escapeHtml)
        .join(", ")
    : "";
  return sendEmail({
    to: [{ email: merchantEmail }],
    subject: `New order ${d.orderNumber} — ${inr(d.total)} via ${ORDER_CHANNEL_LABELS[d.channel] ?? d.channel}`,
    replyTo: { email: d.customerEmail, name: d.customerName },
    htmlContent: wrap(`
      <h1 style="margin-bottom:4px;">New order received</h1>
      <p style="color:#4b5563;">Order <strong>${escapeHtml(d.orderNumber)}</strong> was placed on <strong>${escapeHtml(d.storeName)}</strong>.</p>
      <p style="color:#4b5563;">Customer: <strong>${escapeHtml(d.customerName)}</strong> · ${escapeHtml(d.customerEmail)}${d.customerPhone ? ` · ${escapeHtml(d.customerPhone)}` : ""}</p>
      ${addr ? `<p style="color:#4b5563;">Ship to: ${addr}</p>` : ""}
      ${orderTable(d)}
      ${button(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`, "Open Orders")}
    `),
  });
}

export async function sendOrderStatusUpdateEmail(
  to: { email: string; name: string },
  orderNumber: string,
  storeName: string,
  status: string
) {
  return sendEmail({
    to: [to],
    subject: `Order Update — ${orderNumber}`,
    htmlContent: wrap(`
      <h1>Order Status Updated</h1>
      <p style="color:#4b5563;">Your order <strong>${escapeHtml(orderNumber)}</strong> from <strong>${escapeHtml(storeName)}</strong> has been updated.</p>
      <p style="color:#4b5563;">New Status: <strong>${escapeHtml(status)}</strong></p>
    `),
  });
}

export async function sendSubscriptionConfirmationEmail(to: { email: string; name: string }, planName: string, amount: number) {
  return sendEmail({
    to: [to],
    subject: `Subscription Activated — ${planName}`,
    htmlContent: wrap(`
      <h1>Subscription Activated</h1>
      <p style="color:#4b5563;">Your <strong>${escapeHtml(planName)}</strong> plan has been activated.</p>
      <p style="color:#4b5563;">Amount paid: <strong>${inr(amount)}</strong></p>
      ${button(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`, "View Billing")}
    `),
  });
}

export async function sendCustomerPasswordResetEmail(
  to: { email: string; name: string },
  storeName: string,
  resetUrl: string
) {
  return sendEmail({
    to: [to],
    subject: `Reset your password for ${storeName}`,
    htmlContent: wrap(`
      <h1>Password Reset Request</h1>
      <p style="color:#4b5563;">We received a request to reset your password for your account at <strong>${escapeHtml(storeName)}</strong>.</p>
      <p style="color:#4b5563;">Click the button below to reset your password. This link is valid for 1 hour.</p>
      ${button(resetUrl, "Reset Password")}
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you did not request this password reset, please ignore this email.</p>
    `),
  });
}

