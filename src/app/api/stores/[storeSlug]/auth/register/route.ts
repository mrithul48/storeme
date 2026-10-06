// src/app/api/stores/[storeSlug]/auth/register/route.ts
// Customer account registration for a store

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorefrontConfig } from "@/services/store.service";
import {
  createCustomerToken,
  getCustomerCookieName,
  hashPassword,
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
    const { name, email, username, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanUsername = username ? String(username).trim() : null;
    const cleanPhone = phone ? String(phone).trim() : null;

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already registered in this store
    const existingEmail = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: cleanEmail,
        },
      },
    });

    if (existingEmail && existingEmail.password) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check username uniqueness if provided
    if (cleanUsername) {
      const existingUsername = await prisma.customer.findFirst({
        where: {
          storeId: store.id,
          username: cleanUsername,
        },
      });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await hashPassword(String(password));

    let customer;
    if (existingEmail) {
      // If customer had an order previously as guest, upgrade them with credentials
      customer = await prisma.customer.update({
        where: { id: existingEmail.id },
        data: {
          name: cleanName,
          username: cleanUsername,
          password: hashedPassword,
          phone: cleanPhone || existingEmail.phone,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          storeId: store.id,
          name: cleanName,
          email: cleanEmail,
          username: cleanUsername,
          password: hashedPassword,
          phone: cleanPhone,
        },
      });
    }

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
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[Customer Register]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
