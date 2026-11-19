// src/app/api/stores/[storeSlug]/auth/register/route.ts
// Customer account registration for a store

import { NextResponse } from "next/server";
import { pgPool } from "@/lib/db-pg";
import { getStorefrontConfig } from "@/services/store.service";
import crypto from "crypto";
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
    const existingEmailResult = await pgPool.query(
      `SELECT id, password, phone FROM "Customer" WHERE "storeId" = $1 AND LOWER(email) = LOWER($2) LIMIT 1`,
      [store.id, cleanEmail]
    );
    const existingEmail = existingEmailResult.rows[0];

    if (existingEmail && existingEmail.password) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check username uniqueness if provided
    if (cleanUsername) {
      const existingUsernameResult = await pgPool.query(
        `SELECT id FROM "Customer" WHERE "storeId" = $1 AND username = $2 LIMIT 1`,
        [store.id, cleanUsername]
      );
      if (existingUsernameResult.rows.length > 0) {
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
      const updateResult = await pgPool.query(
        `UPDATE "Customer"
         SET name = $1, username = $2, password = $3, phone = COALESCE($4, phone), "updatedAt" = NOW()
         WHERE id = $5
         RETURNING id, name, email, username, phone`,
        [cleanName, cleanUsername, hashedPassword, cleanPhone, existingEmail.id]
      );
      customer = updateResult.rows[0];
    } else {
      const customerId = crypto.randomUUID();
      const insertResult = await pgPool.query(
        `INSERT INTO "Customer" (id, "storeId", name, email, username, password, phone, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, name, email, username, phone`,
        [customerId, store.id, cleanName, cleanEmail, cleanUsername, hashedPassword, cleanPhone]
      );
      customer = insertResult.rows[0];
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
