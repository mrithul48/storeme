import React from "react";

export interface StatisticBadge {
  id: string;
  count?: string;
  heading?: string;
  description?: string;
  text?: string;
  sortOrder?: number;
}

interface StoreStatisticsProps {
  badges?: StatisticBadge[] | null;
  className?: string;
}

export function StoreStatistics({ badges, className = "" }: StoreStatisticsProps) {
  if (!badges || !Array.isArray(badges) || badges.length === 0) {
    return null;
  }

  // Filter out completely empty items and sort by sortOrder
  const validBadges = badges
    .filter((b) => Boolean(b.count || b.heading || b.description || b.text))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (validBadges.length === 0) {
    return null;
  }

  const gridColsClass =
    validBadges.length === 1
      ? "grid-cols-1 max-w-sm"
      : validBadges.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
      : validBadges.length === 3
      ? "grid-cols-1 sm:grid-cols-3 max-w-4xl"
      : "grid-cols-2 lg:grid-cols-4 max-w-7xl";

  return (
    <section
      className={`border-t py-12 sm:py-16 px-4 sm:px-6 lg:px-8 ${className}`}
      style={{ borderColor: "var(--store-border)" }}
    >
      <div className={`mx-auto grid ${gridColsClass} gap-4 sm:gap-6`}>
        {validBadges.map((badge) => {
          const count =
            badge.count || (!badge.heading && !badge.description ? badge.text : "");
          const heading = badge.heading || (badge.count ? "" : badge.text);
          const description = badge.description || "";

          return (
            <div
              key={badge.id}
              className="p-6 border transition-all flex flex-col justify-center items-center sm:items-start text-center sm:text-left"
              style={{
                backgroundColor: "var(--store-surface, rgba(15, 23, 42, 0.6))",
                borderColor: "var(--store-border, rgba(255, 255, 255, 0.1))",
                borderRadius: "var(--store-image-radius, 10px)",
                color: "var(--store-page-text, #f8fafc)",
              }}
            >
              {count && (
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: "var(--store-button-bg, #22c55e)" }}
                >
                  {count}
                </span>
              )}
              {heading && (
                <h3
                  className="text-sm sm:text-base font-bold mt-2 leading-snug"
                  style={{ color: "var(--store-page-heading, #ffffff)" }}
                >
                  {heading}
                </h3>
              )}
              {description && (
                <p
                  className="text-xs sm:text-sm mt-1 leading-relaxed opacity-80"
                  style={{ color: "var(--store-page-paragraph, #94a3b8)" }}
                >
                  {description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
