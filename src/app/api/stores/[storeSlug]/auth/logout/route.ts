// src/app/api/stores/[storeSlug]/auth/logout/route.ts
// Customer logout route — clears store-specific customer session cookie

import { NextResponse } from "next/server";
import { getStorefrontConfig } from "@/services/store.service";
import { getCustomerCookieName } from "@/lib/customer-auth";

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

    const response = NextResponse.json({ success: true });
    const cookieName = getCustomerCookieName(store.id);

    response.cookies.delete(cookieName);

    return response;
  } catch (error) {
    console.error("[Customer Logout]", error);
    return NextResponse.json({ success: false, error: "Failed to log out" }, { status: 500 });
  }
}
