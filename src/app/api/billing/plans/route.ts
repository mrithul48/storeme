// src/app/api/billing/plans/route.ts
// GET — list all active subscription plans

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("[GET /api/billing/plans]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 });
  }
}
