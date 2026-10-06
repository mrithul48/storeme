// src/app/api/stores/[storeSlug]/enquiry/route.ts
// Public enquiry endpoint — validates input server-side, scoped to the store

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()),
  email: z.string().email().max(200).transform((s) => s.trim().toLowerCase()),
  phone: z.string().max(20).optional().transform((s) => s?.trim() || undefined),
  message: z.string().min(1).max(2000).transform((s) => s.trim()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;

  // Resolve the store — validates tenant
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: {
      id: true,
      status: true,
      homePage: { select: { contactEnabled: true } },
      company: { select: { email: true } },
    },
  });

  if (!store || store.status !== "ACTIVE") {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  if (!store.homePage?.contactEnabled) {
    return NextResponse.json({ success: false, error: "Contact form is not enabled for this store" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, message } = parsed.data;

  // For now: log the enquiry to console and return success.
  // TODO: integrate with existing Brevo email system if configured.
  console.log(`[ENQUIRY] Store: ${storeSlug} | From: ${name} <${email}>${phone ? ` | Phone: ${phone}` : ""} | Message: ${message}`);

  // If Brevo is platform-configured, email the store's support address
  try {
    const { sendEmail, isEmailConfigured } = await import("@/lib/brevo");

    if (isEmailConfigured() && store.company?.email) {
      await sendEmail({
        to: [{ email: store.company.email }],
        subject: `New Enquiry from ${name} — ${storeSlug}`,
        htmlContent: `
          <h2 style="color:#1e293b;">New Customer Enquiry</h2>
          <p><strong>Name:</strong> ${name.replace(/</g, "&lt;")}</p>
          <p><strong>Email:</strong> ${email.replace(/</g, "&lt;")}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone.replace(/</g, "&lt;")}</p>` : ""}
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #3b82f6;padding-left:12px;color:#374151;">
            ${message.replace(/</g, "&lt;").replace(/\n/g, "<br>")}
          </blockquote>
        `,
      });
    }
  } catch (err) {
    // Non-fatal — enquiry is still received, just email delivery failed
    console.error("[ENQUIRY] Email notification failed:", err);
  }


  return NextResponse.json({ success: true, message: "Enquiry received. We will get back to you shortly." });
}
