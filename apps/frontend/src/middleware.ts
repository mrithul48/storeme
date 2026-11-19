// src/middleware.ts
// Global request router for Next.js multi-tenant SaaS architecture.
// Routes custom domains to the corresponding merchant storefront without changing the browser URL.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // 1. Never intercept internal next assets, APIs, dashboard, admin, auth, or static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.includes(".") // Static assets (.ico, .png, .jpg, .svg, .css, .js)
  ) {
    return NextResponse.next();
  }

  // 2. Extract and normalize hostname
  const hostHeader = request.headers.get("x-custom-domain") || request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  // 3. Identify platform root hosts
  const platformUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  let platformHost = "";
  try {
    if (platformUrl) {
      platformHost = new URL(platformUrl).hostname.toLowerCase();
    }
  } catch {
    // Ignore invalid URL
  }

  const isPlatformHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    (platformHost && hostname === platformHost) ||
    hostname.endsWith(".vercel.app");

  // If this request is for the main platform domain:
  if (isPlatformHost) {
    // Standard routing: / -> SaaS homepage, /store/[slug] -> storefront
    return NextResponse.next();
  }

  // 4. CUSTOM DOMAIN ROUTING
  // If the visitor on a custom domain clicked an internal link with /store/[slug],
  // redirect them to the clean root-relative path (e.g. /store/abc/checkout -> /checkout)
  const legacyStorePrefixRegex = /^\/store\/[^/]+(\/.*)?$/;
  const match = pathname.match(legacyStorePrefixRegex);
  if (match) {
    const cleanPath = match[1] || "/";
    const redirectUrl = new URL(cleanPath + url.search, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Rewrite custom domain requests internally to /store/[hostname][pathname]
  // The browser address bar retains https://www.abcfashion.com[pathname]
  const rewriteUrl = new URL(`/store/${hostname}${pathname}`, request.url);

  // Propagate custom domain metadata via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-custom-domain", hostname);
  requestHeaders.set("x-is-custom-domain", "true");

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
