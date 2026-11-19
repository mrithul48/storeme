// src/app/api/auth/check-store/route.ts
// GET — called client-side after sign-in to determine whether to go to /dashboard or /onboarding.
// Returns { hasStore: boolean } based on the current NextAuth session.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userHasStore } from "@/services/store.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ hasStore: false }, { status: 401 });
    }

    let hasStore = false;
    if (session.user?.id) {
      hasStore = await userHasStore(session.user.id);
    }
    if (!hasStore && session.user?.email) {
      hasStore = await userHasStore(session.user.email);
    }
    return NextResponse.json({ hasStore });
  } catch {
    // If backend is unreachable, default to dashboard (better UX than stuck on onboarding)
    return NextResponse.json({ hasStore: true });
  }
}

