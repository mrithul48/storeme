// src/app/api/stores/[storeSlug]/shipping/calculate/route.ts
// Public endpoint for storefront shipping charge calculations via NestJS backend

import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api";

type RouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { storeSlug } = await params;

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    const res = await apiClient.post<any>(
      "/api/v1/orders/shipping/calculate",
      {
        storeSlug,
        items,
      },
      {
        storeSlug,
      }
    );

    return NextResponse.json(res);
  } catch (error) {
    console.error("[POST /api/stores/[storeSlug]/shipping/calculate]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to calculate shipping",
      },
      { status: 500 }
    );
  }
}
