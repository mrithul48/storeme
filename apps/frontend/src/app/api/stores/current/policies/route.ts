// src/app/api/stores/current/policies/route.ts
// GET  — load store policies for current authenticated merchant
// PUT  — save or update store policies (scoped by storeId, merchant-isolated)

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getStoreByOwnerId,
  getStorePolicies,
  updateStorePolicies,
} from "@/services/store.service";
import { z } from "zod";

const policyPointSchema = z.object({
  id: z.string(),
  heading: z.string().max(200).optional().default(""),
  description: z.string().max(10000).optional().default(""),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const updatePoliciesSchema = z.object({
  policyType: z.enum(["delivery", "refund", "privacy", "all"]).optional(),
  deliveryPolicyHeading: z.string().max(200).optional().nullable(),
  deliveryPolicyDescription: z.string().max(50000).optional().nullable(),
  deliveryPoints: z.array(policyPointSchema).max(50).optional().nullable(),
  refundPolicyHeading: z.string().max(200).optional().nullable(),
  refundPolicyDescription: z.string().max(50000).optional().nullable(),
  refundPoints: z.array(policyPointSchema).max(50).optional().nullable(),
  privacyPolicyHeading: z.string().max(200).optional().nullable(),
  privacyPolicyDescription: z.string().max(50000).optional().nullable(),
  privacyPoints: z.array(policyPointSchema).max(50).optional().nullable(),
});

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

    const homePage = await getStorePolicies(store.id);

    return NextResponse.json({
      success: true,
      data: homePage || {
        deliveryPolicyHeading: null,
        deliveryPolicyDescription: null,
        deliveryPoints: [],
        refundPolicyHeading: null,
        refundPolicyDescription: null,
        refundPoints: [],
        privacyPolicyHeading: null,
        privacyPolicyDescription: null,
        privacyPoints: [],
      },
    });
  } catch (error) {
    console.error("[GET /api/stores/current/policies]", error);
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
    const parsed = updatePoliciesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateStorePolicies(store.id, parsed.data);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/stores/current/policies]", error);
    return NextResponse.json({ success: false, error: "Failed to save policies" }, { status: 500 });
  }
}
