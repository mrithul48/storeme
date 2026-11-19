// src/lib/store-url.ts
// Context-aware link builder for standard store slugs and custom domains.
// Ensures Store A visitors never get redirected to Store B or platform roots.

export function isCustomDomainHost(slugOrDomain: string): boolean {
  if (!slugOrDomain) return false;
  // If slug contains a dot and is not localhost/127.0.0.1, it's a domain
  return slugOrDomain.includes(".") && !slugOrDomain.startsWith("localhost");
}

export function getStoreLink(
  slugOrDomain: string,
  path: string = "",
  isCustomDomain?: boolean
): string {
  const isCustom = isCustomDomain ?? isCustomDomainHost(slugOrDomain);
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (isCustom) {
    return cleanPath || "/";
  }

  const base = `/store/${slugOrDomain}`;
  if (!cleanPath || cleanPath === "/") {
    return base;
  }
  return `${base}${cleanPath}`;
}
