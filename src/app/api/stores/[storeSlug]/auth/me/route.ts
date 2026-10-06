// src/app/api/stores/[storeSlug]/auth/me/route.ts
// Returns current authenticated customer profile or null

import { NextResponse } from "next/server";
import { getStorefrontConfig } from "@/services/store.service";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    const { storeSlug } = await params;
    const store = await getStorefrontConfig(storeSlug);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const customer = await getCurrentCustomer(store.id);

    return NextResponse.json({
      success: true,
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            username: customer.username,
            phone: customer.phone,
          }
        : null,
    });
  } catch (error) {
    console.error("[Customer Me]", error);
    return NextResponse.json({ success: false, customer: null }, { status: 500 });
  }
}
