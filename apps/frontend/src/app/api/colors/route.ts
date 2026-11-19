// src/app/api/colors/route.ts
// Tenant-scoped colors management via NestJS backend

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { getStoreByOwnerId } from "@/services/store.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const res = await apiClient.get<any>("/api/v1/stores/current/colors", {
      storeId: store.id,
      internalUser: session.user,
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("[GET /api/colors]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch colors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await req.json();
    const name = body?.name?.trim();
    let hex = body?.hex?.trim() || "#000000";

    if (!name) {
      return NextResponse.json({ success: false, error: "Color name is required" }, { status: 400 });
    }

    if (!hex.startsWith("#")) {
      hex = `#${hex}`;
    }

    const res = await apiClient.post<any>(
      "/api/v1/stores/current/colors",
      { name, hex },
      {
        storeId: store.id,
        internalUser: session.user,
      }
    );

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[POST /api/colors]", error);
    const message = error?.message || "Failed to create color";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
