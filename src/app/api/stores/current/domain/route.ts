// src/app/api/stores/current/domain/route.ts
// GET    — get custom domain configuration & verification instructions
// POST   — register custom domain and generate DNS verification token
// DELETE — disconnect custom domain (preserves all store data)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { checkPlanAccess } from "@/lib/plan-limits";
import {
  getCustomDomainForStore,
  registerCustomDomain,
  disconnectCustomDomain,
} from "@/services/custom-domain.service";

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

    const planAccess = await checkPlanAccess(store.id, "CUSTOM_DOMAIN");
    const domainData = await getCustomDomainForStore(store.id);

    return NextResponse.json({
      success: true,
      data: domainData
        ? {
            ...domainData,
            storeSlug: store.slug,
            isPlanAllowed: planAccess.allowed,
            planReason: planAccess.reason,
          }
        : {
            domain: null,
            status: "NOT_CONNECTED",
            verificationToken: null,
            verifiedAt: null,
            dnsInstructions: null,
            storeSlug: store.slug,
            isPlanAllowed: planAccess.allowed,
            planReason: planAccess.reason,
          },
    });
  } catch (error) {
    console.error("[GET /api/stores/current/domain]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch domain settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    // Enforce plan access for custom domain
    const planAccess = await checkPlanAccess(store.id, "CUSTOM_DOMAIN");
    if (!planAccess.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: planAccess.reason || "Custom domains are not available on your current plan.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid domain name." },
        { status: 400 }
      );
    }

    const result = await registerCustomDomain(store.id, domain);

    if (!result.success || !result.data) {
      const statusCode =
        result.error?.includes("already registered") || result.error?.includes("already mapped")
          ? 409
          : 422;
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      instructions: result.data.dnsInstructions,
    });
  } catch (error) {
    console.error("[POST /api/stores/current/domain]", error);
    return NextResponse.json(
      { success: false, error: "Failed to save custom domain" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const result = await disconnectCustomDomain(store.id);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("[DELETE /api/stores/current/domain]", error);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect custom domain" },
      { status: 500 }
    );
  }
}
