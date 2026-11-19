// src/app/api/stores/current/route.ts
// GET  — get authenticated user's store
// PUT  — update store details (company, settings, working hours)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStoreByOwnerId, updateStore } from "@/services/store.service";
import { updateCompanyDetailsSchema } from "@/validations/store.schema";

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

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("[GET /api/stores/current]", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, company, settings } = body;

    let companyData = company;
    if (company) {
      const parsed = updateCompanyDetailsSchema.safeParse(company);
      if (parsed.success) {
        companyData = parsed.data;
      }
    }

    const updated = await updateStore(store.id, {
      name,
      company: companyData,
      settings,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/stores/current]", error);
    return NextResponse.json({ success: false, error: "Failed to update store" }, { status: 500 });
  }
}
