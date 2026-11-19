// apps/frontend/src/app/api/admin/merchants/[id]/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateMerchantStatus } from "@/services/admin.service";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized — Admin role required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, reason } = body;

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return NextResponse.json({ success: false, error: "Status must be ACTIVE or SUSPENDED" }, { status: 400 });
    }

    const res = await updateMerchantStatus(id, status, reason);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[PATCH /api/admin/merchants/[id]/status]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update merchant status" }, { status: 500 });
  }
}

