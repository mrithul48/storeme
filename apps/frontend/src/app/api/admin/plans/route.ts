// apps/frontend/src/app/api/admin/plans/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPlan, getAllPlansForAdmin } from "@/services/plan.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const plans = await getAllPlansForAdmin();
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await createPlan(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/admin/plans]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create plan" }, { status: 400 });
  }
}

