import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

    const colors = await prisma.storeColor.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: colors });
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

    // Check if color already exists for this store (case-insensitive)
    const existing = await prisma.storeColor.findFirst({
      where: {
        storeId: store.id,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const newColor = await prisma.storeColor.create({
      data: {
        storeId: store.id,
        name,
        hex,
      },
    });

    return NextResponse.json({ success: true, data: newColor }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/colors]", error);
    return NextResponse.json({ success: false, error: "Failed to create color" }, { status: 500 });
  }
}
