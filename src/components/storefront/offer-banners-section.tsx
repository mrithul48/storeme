import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const OFFER_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
};

function getOfferRadiusClass(radius?: string | null) {
  return OFFER_RADIUS_MAP[radius ?? "MD"] ?? "rounded-xl";
}

export interface OfferBannerItem {
  url: string;
  publicId?: string;
  borderRadius?: string | null;
  linkType?: string | null;
  linkValue?: string | null;
}

interface OfferBannersSectionProps {
  banners: OfferBannerItem[];
  bannerLinks: (string | null)[];
}

export function OfferBannersSection({ banners, bannerLinks }: OfferBannersSectionProps) {
  const visibleBanners = banners.filter((b) => b.url);
  if (visibleBanners.length === 0) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((banner, idx) => {
            if (!banner.url) return null;
            const linkUrl = bannerLinks[idx];
            const radiusClass = getOfferRadiusClass(banner.borderRadius);
            const inner = (
              <div className={cn("relative overflow-hidden aspect-[2/1] w-full", radiusClass)}>
                <Image
                  src={banner.url}
                  alt={`Offer ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            );
            return linkUrl ? (
              <Link key={idx} href={linkUrl}>
                {inner}
              </Link>
            ) : (
              <div key={idx}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
