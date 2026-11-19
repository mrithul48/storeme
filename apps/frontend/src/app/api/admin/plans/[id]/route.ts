// apps/frontend/src/app/api/admin/plans/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePlan, deletePlan } from "@/services/plan.service";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const result = await updatePlan(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PUT /api/admin/plans/[id]]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update plan" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await deletePlan(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[DELETE /api/admin/plans/[id]]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete plan" }, { status: 400 });
  }
}

