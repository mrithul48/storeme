// src/app/api/stores/[storeSlug]/shipping/calculate/route.ts
// Public endpoint for storefront shipping charge calculations based on actual DB product weights and settings.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateShippingCharge } from "@/lib/shipping-calculator";

type RouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { storeSlug } = await params;

  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, status: "ACTIVE" },
      select: {
        id: true,
        slug: true,
        settings: {
          select: {
            shippingType: true,
            shippingFixedCharge: true,
            shippingMinOrderAmount: true,
            shippingFallbackCharge: true,
            shippingDefaultWeight: true,
            shippingWeightRates: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const items: Array<{ productId: string; quantity: number }> = Array.isArray(body.items)
      ? body.items
      : [];

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          subtotal: 0,
          shippingCharge: 0,
          total: 0,
          isFree: true,
          shippingType: store.settings?.shippingType || null,
        },
      });
    }

    // Fetch actual products and DB prices & weights
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        weight: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Calculate subtotal from DB prices
    let subtotal = 0;
    const shippingItems = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) continue;

      const unitPrice =
        prod.salePrice !== null && prod.salePrice !== undefined && Number(prod.salePrice) > 0
          ? Number(prod.salePrice)
          : Number(prod.price);

      subtotal += unitPrice * Math.max(1, item.quantity);

      shippingItems.push({
        quantity: Math.max(1, item.quantity),
        product: {
          id: prod.id,
          name: prod.name,
          weight: prod.weight !== null && prod.weight !== undefined ? Number(prod.weight) : null,
        },
      });
    }

    try {
      const calculation = calculateShippingCharge(store.settings, subtotal, shippingItems);
      return NextResponse.json({
        success: true,
        data: calculation,
      });
    } catch (calcError: any) {
      return NextResponse.json(
        {
          success: false,
          error: calcError.message || "Failed to calculate shipping charge",
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error("[POST /api/stores/[storeSlug]/shipping/calculate]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
