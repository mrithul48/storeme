import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { getStoreLink } from "@/lib/store-url";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  salePrice?: number | string | null;
  stock: number;
  images?: Array<{ url: string; altText?: string | null }>;
  category?: { name: string } | null;
}

interface NewArrivalsSectionProps {
  products: StorefrontProduct[];
  storeSlug: string;
  storeName: string;
  whatsappNumber?: string | null;
  themeColor?: string | null;
  cardRadiusClass?: string;
  showSalePrice?: boolean;
  showOriginalPrice?: boolean;
}

export function NewArrivalsSection({
  products,
  storeSlug,
  storeName,
  whatsappNumber,
  themeColor,
  cardRadiusClass,
  showSalePrice,
  showOriginalPrice,
}: NewArrivalsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-start uppercase" style={{ color: "var(--store-page-heading, #ffffff)" }}>
            New Arrivals
          </h2>
          <Link
            href={getStoreLink(storeSlug, "/shop?newArrival=true")}
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
