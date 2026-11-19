"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroBanner {
  url: string;
  publicId: string;
  mobileUrl?: string | null;
  mobilePublicId?: string | null;
  sortOrder: number;
}

interface HeroSliderProps {
  banners: HeroBanner[];
  themeColor?: string | null;
}

export function HeroSlider({ banners, themeColor }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % sorted.length);
  }, [sorted.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + sorted.length) % sorted.length);
  };

  // Auto-slide
  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [sorted.length, next]);

  if (sorted.length === 0) return null;

  return (
    <section className="relative overflow-hidden w-full h-[70vh] min-h-[420px] md:h-[calc(100vh-5rem)] md:min-h-[550px] bg-slate-950">
      {/* Slides */}
      {sorted.map((banner, idx) => (
        <div
          key={banner.publicId || idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Desktop & Tablet Banner */}
          <div className={cn("relative w-full h-full", banner.mobileUrl ? "hidden sm:block" : "block")}>
            <Image
              src={banner.url}
              alt={`Banner ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="100vw"
              unoptimized
            />
          </div>

          {/* Mobile Banner */}
          {banner.mobileUrl && (
            <div className="relative w-full h-full block sm:hidden">
              <Image
                src={banner.mobileUrl}
                alt={`Banner ${idx + 1} Mobile`}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="100vw"
                unoptimized
              />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ))}

      {/* Nav buttons — only show when >1 banner */}
      {sorted.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {sorted.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to banner ${idx + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === current
                    ? "w-6"
                    : "w-2 bg-white/40 hover:bg-white/60"
                )}
                style={idx === current ? { backgroundColor: themeColor || "#3b82f6", width: "24px" } : {}}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
