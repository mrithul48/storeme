import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { getStoreLink } from "@/lib/store-url";

interface RelatedProductItem {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  salePrice?: number | string | null;
  stock: number;
  manageStockQuantity?: boolean;
  manageStockAvailability?: boolean;
  inStock?: boolean;
  variants?: Array<{
    id: string;
    color: string;
    manageAvailability: boolean;
    inStock: boolean;
    manageQuantity: boolean;
    stock: number;
  }>;
  images?: Array<{ url: string; altText?: string | null }>;
  category?: { id?: string; name: string; slug?: string } | null;
  brand?: { name: string } | string | null;
}

interface RelatedProductsSectionProps {
  products: RelatedProductItem[];
  storeSlug: string;
  storeName: string;
  categoryName?: string | null;
  categoryId?: string | null;
  whatsappNumber?: string | null;
  themeColor?: string | null;
  cardRadiusClass?: string;
  showSalePrice?: boolean;
  showOriginalPrice?: boolean;
  stockManagementType?: string | null;
  colorWiseStockType?: string | null;
}

export function RelatedProductsSection({
  products,
  storeSlug,
  storeName,
  categoryName,
  categoryId,
  whatsappNumber,
  themeColor,
  cardRadiusClass = "rounded-2xl",
  showSalePrice = true,
  showOriginalPrice = true,
  stockManagementType,
  colorWiseStockType,
}: RelatedProductsSectionProps) {
  if (!products || products.length === 0) return null;

  const viewAllUrl = categoryId
    ? getStoreLink(storeSlug, `/shop?category=${categoryId}`)
    : getStoreLink(storeSlug, "/shop");

  return (
    <section className="pt-12 sm:pt-16 pb-8 border-t" style={{ borderColor: "var(--store-border, rgba(255, 255, 255, 0.08))" }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
           
              <h2
                className="text-lg sm:text-xl font-extrabold tracking-tight uppercase"
                style={{ color: "var(--store-page-heading, #ffffff)" }}
              >
                Related Products
              </h2>
            </div>
            {categoryName && (
              <p
                className="text-xs"
                style={{ color: "var(--store-page-muted, #94a3b8)" }}
              >
                More items from <span className="font-semibold text-slate-200">{categoryName}</span>
              </p>
            )}
          </div>

          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--store-primary, #3b82f6)" }}
          >
            <span>View More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid — Reusing ProductCard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price: Number(product.price),
                salePrice: product.salePrice ? Number(product.salePrice) : null,
              }}
              storeSlug={storeSlug}
              storeName={storeName}
              whatsappNumber={whatsappNumber}
              themeColor={themeColor}
              cardRadiusClass={cardRadiusClass}
              showSalePrice={showSalePrice}
              showOriginalPrice={showOriginalPrice}
              stockManagementType={stockManagementType}
              colorWiseStockType={colorWiseStockType}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
