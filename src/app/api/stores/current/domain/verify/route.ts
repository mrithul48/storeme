// src/app/api/stores/current/domain/verify/route.ts
// POST — check DNS records to verify custom domain ownership

import { NextResponse } from "next/server";
import dns from "dns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreByOwnerId } from "@/services/store.service";

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

    if (!store.customDomain || !store.domainVerificationToken) {
      return NextResponse.json(
        { success: false, error: "No custom domain pending verification" },
        { status: 400 }
      );
    }

    let isVerified = false;
    let dnsLookupError: string | null = null;

    try {
      // Query DNS TXT records for the domain
      const records = await dns.promises.resolveTxt(store.customDomain);
      const flattened = records.flat().join(" ");
      if (flattened.includes(store.domainVerificationToken)) {
        isVerified = true;
      }
    } catch (dnsErr: any) {
      dnsLookupError = dnsErr?.message || "DNS lookup failed";
    }

    if (isVerified) {
      await prisma.store.update({
        where: { id: store.id },
        data: { domainStatus: "CONNECTED" },
      });

      return NextResponse.json({
        success: true,
        status: "CONNECTED",
        message: "Domain successfully verified and connected!",
      });
    } else {
      await prisma.store.update({
        where: { id: store.id },
        data: { domainStatus: "VERIFICATION_FAILED" },
      });

      return NextResponse.json({
        success: false,
        status: "VERIFICATION_FAILED",
        error: `Verification record not found. Please ensure a TXT record with value "${store.domainVerificationToken}" is added to your DNS. (Note: DNS propagation can take 5-30 minutes).`,
        details: dnsLookupError,
      });
    }
  } catch (error) {
    console.error("[POST /api/stores/current/domain/verify]", error);
    return NextResponse.json({ success: false, error: "Domain verification check failed" }, { status: 500 });
  }
}
