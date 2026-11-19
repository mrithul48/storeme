// src/app/api/billing/plans/route.ts
// GET — list active subscription plans via NestJS backend
import { NextResponse } from "next/server";
import { getPublicPlans } from "@/services/plan.service";

export async function GET() {
  try {
    const plans = await getPublicPlans();
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    console.error("[GET /api/billing/plans]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch plans" }, { status: 500 });
  }
}
