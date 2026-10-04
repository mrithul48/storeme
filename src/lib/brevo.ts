// src/lib/brevo.ts
// Brevo (Sendinblue) transactional email service

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface EmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send a transactional email via Brevo
 * All email sending happens server-side — API key never exposed to browser
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "EcomBuilder";

  if (!apiKey || !senderEmail) {
    console.error("[Brevo] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL");
    return;
  }

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to: options.to,
    subject: options.subject,
    htmlContent: options.htmlContent,
    ...(options.textContent ? { textContent: options.textContent } : {}),
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[Brevo] Email send failed:", response.status, body);
    throw new Error(`Brevo email failed: ${response.status}`);
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: { email: string; name: string }): Promise<void> {
  await sendEmail({
    to: [to],
    subject: "Welcome to EcomBuilder!",
    htmlContent: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827;">Welcome, ${to.name}! 👋</h1>
        <p style="color: #6b7280;">Your account has been created successfully. You're ready to build your online store.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Create Your Store
        </a>
      </div>
    `,
  });
}

export async function sendStoreCreatedEmail(
  to: { email: string; name: string },
  storeName: string,
  storeUrl: string
): Promise<void> {
  await sendEmail({
    to: [to],
    subject: `Your store "${storeName}" is live!`,
    htmlContent: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827;">🎉 Your store is live!</h1>
        <p style="color: #6b7280;"><strong>${storeName}</strong> has been successfully created.</p>
        <p style="color: #6b7280;">Your store URL:</p>
        <a href="${storeUrl}" style="color:#22c55e;">${storeUrl}</a>
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  to: { email: string; name: string },
  orderNumber: string,
  storeName: string,
  total: number
): Promise<void> {
  await sendEmail({
    to: [to],
    subject: `Order Confirmed — ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827;">Order Confirmed ✅</h1>
        <p style="color: #6b7280;">Thank you for your order from <strong>${storeName}</strong>.</p>
        <p style="color: #6b7280;">Order Number: <strong>${orderNumber}</strong></p>
        <p style="color: #6b7280;">Total: <strong>₹${total}</strong></p>
        <p style="color: #6b7280;">We'll notify you when your order is processed.</p>
      </div>
    `,
  });
}

export async function sendOrderStatusUpdateEmail(
  to: { email: string; name: string },
  orderNumber: string,
  storeName: string,
  status: string
): Promise<void> {
  await sendEmail({
    to: [to],
    subject: `Order Update — ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827;">Order Status Updated</h1>
        <p style="color: #6b7280;">Your order <strong>${orderNumber}</strong> from <strong>${storeName}</strong> has been updated.</p>
        <p style="color: #6b7280;">New Status: <strong>${status}</strong></p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail(
  to: { email: string; name: string },
  planName: string,
  amount: number
): Promise<void> {
  await sendEmail({
    to: [to],
    subject: `Subscription Activated — ${planName} Plan`,
    htmlContent: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827;">Subscription Activated 🎉</h1>
        <p style="color: #6b7280;">Your <strong>${planName}</strong> plan has been activated.</p>
        <p style="color: #6b7280;">Amount: <strong>₹${amount}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}
