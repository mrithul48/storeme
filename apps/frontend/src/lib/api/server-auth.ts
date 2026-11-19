// src/lib/api/server-auth.ts
// Resolve authenticated NextAuth session context for server-side API requests

import { auth } from "@/lib/auth";

export interface ServerAuthUser {
  id: string;
  email: string;
  role: "USER" | "PLATFORM_ADMIN";
}

export async function getCurrentServerUser(): Promise<ServerAuthUser | undefined> {
  if (typeof window !== "undefined") {
    return undefined;
  }

  // 1. Try resolving authenticated NextAuth v5 session
  try {
    const session = await auth();
    if (session?.user?.id && session.user.email) {
      return {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any).role === "PLATFORM_ADMIN" ? "PLATFORM_ADMIN" : "USER",
      };
    }
  } catch {
    // Session not present (e.g. server execution outside web request context)
  }

  // 2. Fallback for server-side scripts / background workers / integration tests
  if (process.env.INTERNAL_SERVICE_USER_ID && process.env.INTERNAL_SERVICE_USER_EMAIL) {
    return {
      id: process.env.INTERNAL_SERVICE_USER_ID,
      email: process.env.INTERNAL_SERVICE_USER_EMAIL,
      role:
        process.env.INTERNAL_SERVICE_USER_ROLE === "PLATFORM_ADMIN"
          ? "PLATFORM_ADMIN"
          : "USER",
    };
  }

  return undefined;
}
