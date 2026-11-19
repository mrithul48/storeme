// apps/frontend/src/app/api/admin/cms/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePlatformCms, getPlatformCms } from "@/services/platform-cms.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await getPlatformCms();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[GET /api/admin/cms]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const res = await updatePlatformCms(body);
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[PUT /api/admin/cms]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

