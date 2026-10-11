import React from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/components/storefront/new-arrivals-section";

interface BestSellersSectionProps {
  products: StorefrontProduct[];
  storeSlug: string;
  storeName: string;
  shopUrl: string;
  whatsappNumber?: string | null;
  themeColor?: string | null;
  cardRadiusClass?: string;
  showSalePrice?: boolean;
  showOriginalPrice?: boolean;
}

export function BestSellersSection({
  products,
  storeSlug,
  storeName,
  shopUrl,
  whatsappNumber,
  themeColor,
  cardRadiusClass,
  showSalePrice,
  showOriginalPrice,
}: BestSellersSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 uppercase" style={{ color: "var(--store-page-heading, #ffffff)" }}>
           Best Sellers
          </h2>
          <Link
            href={shopUrl}
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--store-primary, #3b82f6)" }}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={storeSlug}
              storeName={storeName}
              whatsappNumber={whatsappNumber}
              themeColor={themeColor}
              cardRadiusClass={cardRadiusClass}
              showSalePrice={showSalePrice}
              showOriginalPrice={showOriginalPrice}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
