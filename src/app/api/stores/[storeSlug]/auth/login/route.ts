// src/app/api/stores/[storeSlug]/auth/login/route.ts
// Customer Email/Username + Password authentication handler

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import {
  createCustomerToken,
  getCustomerCookieName,
  verifyPassword,
} from "@/lib/customer-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const store = await getStorefrontConfig(storeSlug);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Username/Email and password are required" },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();

    // Find customer for this specific store
    const customer = await prisma.customer.findFirst({
      where: {
        storeId: store.id,
        OR: [
          { email: cleanIdentifier.toLowerCase() },
          { username: cleanIdentifier },
        ],
      },
    });

    // Always run password verification to prevent timing attack enumeration
    const storedHash =
      customer?.password ??
      "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
    const isValid = await verifyPassword(String(password), storedHash);

    if (!customer || !customer.password || !isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // Generate tenant-safe session token
    const token = createCustomerToken({
      customerId: customer.id,
      storeId: store.id,
      email: customer.email,
      name: customer.name,
    });

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        username: customer.username,
        phone: customer.phone,
      },
    });

    const cookieName = getCustomerCookieName(store.id);
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("[Customer Login]", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
