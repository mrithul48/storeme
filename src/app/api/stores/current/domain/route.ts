// src/app/api/stores/current/domain/route.ts
// GET  — get custom domain configuration & verification instructions
// POST — register custom domain and generate DNS verification token

import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";
import { checkPlanAccess } from "@/lib/plan-limits";

function normalizeDomain(rawDomain: string): string {
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/\/.*$/, "");
  domain = domain.replace(/:\d+$/, "");
  return domain;
}

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

    return NextResponse.json({
      success: true,
      data: {
        customDomain: store.customDomain,
        domainStatus: store.domainStatus,
        verificationToken: store.domainVerificationToken,
        storeSlug: store.slug,
        isPlanAllowed: planAccess.allowed,
        planReason: planAccess.reason,
      },
    });
  } catch (error) {
    console.error("[GET /api/stores/current/domain]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch domain settings" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: planAccess.reason }, { status: 403 });
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ success: false, error: "Valid domain name is required" }, { status: 400 });
    }

    const normalized = normalizeDomain(domain);

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
    if (!domainRegex.test(normalized)) {
      return NextResponse.json({ success: false, error: "Invalid domain format. Example: mybrand.com" }, { status: 422 });
    }

    // Check if domain is already claimed by another store
    const existing = await prisma.store.findUnique({
      where: { customDomain: normalized },
      select: { id: true },
    });

    if (existing && existing.id !== store.id) {
      return NextResponse.json(
        { success: false, error: "This domain is already mapped to another store." },
        { status: 409 }
      );
    }

    // Generate secure single-use verification token
    const verificationToken = `launchcommerce-verify-${crypto.randomBytes(16).toString("hex")}`;

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        customDomain: normalized,
        domainVerificationToken: verificationToken,
        domainStatus: "PENDING_VERIFICATION",
      },
      select: {
        customDomain: true,
        domainStatus: true,
        domainVerificationToken: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      instructions: {
        recordType: "TXT",
        host: "@",
        value: verificationToken,
      },
    });
  } catch (error) {
    console.error("[POST /api/stores/current/domain]", error);
    return NextResponse.json({ success: false, error: "Failed to save domain" }, { status: 500 });
  }
}
