// src/app/api/stores/current/domain/verify/route.ts
// POST — check DNS records to verify custom domain ownership

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreByOwnerId } from "@/services/store.service";
import { checkPlanAccess } from "@/lib/plan-limits";
import { verifyCustomDomain } from "@/services/custom-domain.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStoreByOwnerId(session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    // Verify plan access
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

    const result = await verifyCustomDomain(store.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: "VERIFIED",
        message: "Domain successfully verified and connected!",
        data: result.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: "FAILED",
        error:
          result.error ||
          "DNS verification token not detected yet. DNS changes may take some time to propagate across global DNS servers.",
        details: result.verification?.details,
      });
    }
  } catch (error) {
    console.error("[POST /api/stores/current/domain/verify]", error);
    return NextResponse.json(
      { success: false, error: "Domain verification check failed" },
      { status: 500 }
    );
  }
}
