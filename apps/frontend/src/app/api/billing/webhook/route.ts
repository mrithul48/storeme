// src/app/api/billing/webhook/route.ts
// POST — forwards Razorpay webhook to NestJS backend with signature and raw body

import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/api-config";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    const backendUrl = `${API_BASE_URL.replace(/\/+$/, "")}/api/v1/subscriptions/webhook`;

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, error: errText || "Backend rejected webhook" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[POST /api/billing/webhook]", error);
    return NextResponse.json(
      { success: false, error: "Webhook proxy failure" },
      { status: 500 }
    );
  }
}
