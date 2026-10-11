import React from "react";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/components/storefront/new-arrivals-section";

interface AllProductsSectionProps {
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

export function AllProductsSection({
  products,
  storeSlug,
  storeName,
  shopUrl,
  whatsappNumber,
  themeColor,
  cardRadiusClass,
  showSalePrice,
  showOriginalPrice,
}: AllProductsSectionProps) {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase" style={{ color: "var(--store-page-heading, #ffffff)" }}>
            All Products
          </h2>
          <Link
            href={shopUrl}
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--store-primary, #3b82f6)" }}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-3">
            <div className="w-14 h-14 rounded-xl bg-slate-800/60 flex items-center justify-center">
              <Package className="w-7 h-7 text-slate-500 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-white">No products yet</h3>
            <p className="text-sm text-slate-400">Products will appear here once added to the store.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
        )}
      </div>
    </section>
  );
}
