// src/app/api/admin/stores/[id]/status/route.ts
// PATCH — toggle store status (ACTIVE / SUSPENDED) for platform admin

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const { status } = body;

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const updated = await prisma.store.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/stores/[id]/status]", error);
    return NextResponse.json({ success: false, error: "Failed to update store status" }, { status: 500 });
  }
}
