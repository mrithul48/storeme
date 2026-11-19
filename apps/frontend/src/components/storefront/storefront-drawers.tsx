"use client";

/**
 * StorefrontDrawers — Client Component wrapper
 *
 * CartDrawer and WishlistDrawer must be lazy-loaded with { ssr: false }
 * because they rely on browser-only APIs (localStorage, etc.).
 * Since `ssr: false` is not allowed inside Server Components, we wrap
 * both drawers here (a Client Component) and import this wrapper from
 * any Server Component page that needs them.
 */

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () =>
    import("@/components/storefront/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false }
);

const WishlistDrawer = dynamic(
  () =>
    import("@/components/storefront/wishlist-drawer").then(
      (m) => m.WishlistDrawer
    ),
  { ssr: false }
);

interface StorefrontDrawersProps {
  storeSlug: string;
}

export function StorefrontDrawers({ storeSlug }: StorefrontDrawersProps) {
  return (
    <>
      <CartDrawer storeSlug={storeSlug} />
      <WishlistDrawer storeSlug={storeSlug} />
    </>
  );
}

