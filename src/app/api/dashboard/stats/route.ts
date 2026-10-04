// src/app/api/dashboard/stats/route.ts
// GET /api/dashboard/stats — aggregate dashboard statistics

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId, getDashboardStats } from "@/services/store.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const stats = await getDashboardStats(store.id);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
