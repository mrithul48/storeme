"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, animate, useMotionValue, useReducedMotion } from "framer-motion"; // or "motion/react"
import { cn } from "@/lib/utils";

const CATEGORY_RADIUS_MAP: Record<string, string> = {
  NONE: "rounded-none",
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
  FULL: "rounded-full",
};

function getCategoryRadiusClass(radius?: string | null) {
  return CATEGORY_RADIUS_MAP[radius ?? "MD"] ?? "rounded-xl";
}

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
}

interface CategorySectionProps {
  categories: CategoryItem[];
  categoryShape?: string;
  categoryRadius?: string;
  shopUrl: string;
}

const SPEED = 40; // px per second

export function CategorySection({
  categories,
  categoryShape = "SQUARE",
  categoryRadius = "MD",
  shopUrl,
}: CategorySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  const [setWidth, setSetWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const isRound = categoryShape === "ROUND";
  const isRect = categoryShape === "RECTANGLE";
  const radiusClass = isRound ? "rounded-full" : getCategoryRadiusClass(categoryRadius);

  // Card width and image ratio change with the shape
  const cardWidthClass = isRect
    ? "w-36 sm:w-48 md:w-56"
    : "w-28 sm:w-36 md:w-40";
  const imageRatioClass = isRect ? "aspect-[3/2]" : "aspect-square";

  // Measure one set of cards and the visible area
  useEffect(() => {
    const container = containerRef.current;
    const set = setRef.current;
    if (!container || !set) return;

    const measure = () => {
      setContainerWidth(container.clientWidth);
      setSetWidth(set.offsetWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(set);
    return () => ro.disconnect();
  }, [categories, categoryShape]);

  // Slide only when the cards are wider than the screen
  const shouldSlide = !reduceMotion && containerWidth > 0 && setWidth > containerWidth;

  // Infinite right-to-left loop
  useEffect(() => {
    x.set(0);
    if (!shouldSlide) return;

    controlsRef.current = animate(x, -setWidth, {
      duration: setWidth / SPEED,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });

    return () => controlsRef.current?.stop();
  }, [shouldSlide, setWidth, x]);

  if (!categories || categories.length === 0) return null;

  const renderCards = () =>
    categories.map((cat) => (
      <Link
        key={cat.id}
        href={`${shopUrl}?category=${cat.id}`}
        className={cn(
          "group shrink-0 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95",
          cardWidthClass
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden w-full",
            imageRatioClass,
            radiusClass
          )}
        >
          {cat.imageUrl ? (
            <Image
              src={cat.imageUrl}
              alt={cat.name}
              fill
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 224px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center text-3xl font-bold"
              style={{ color: "var(--store-page-heading, #ffffff)" }}
            >
              {cat.name.charAt(0)}
            </span>
          )}
        </div>

        <span
          className="w-full text-xs sm:text-sm font-medium text-center truncate uppercase"
          style={{ color: "var(--store-page-heading, #ffffff)" }}
        >
          {cat.name}
        </span>
      </Link>
    ));

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-start sm:text-center px-4 sm:px-6 lg:px-8 uppercase"
          style={{ color: "var(--store-page-heading, #ffffff)" }}
        >
          Browse Categories
        </h2>
      </div>

      <div
        ref={containerRef}
        className={cn("overflow-hidden py-2", !shouldSlide && "flex justify-center")}
      >
        <motion.div
          style={{ x }}
          className="flex w-max"
          onHoverStart={() => controlsRef.current?.pause()}
          onHoverEnd={() => controlsRef.current?.play()}
          onTouchStart={() => controlsRef.current?.pause()}
          onTouchEnd={() => controlsRef.current?.play()}
          onTouchCancel={() => controlsRef.current?.play()}
        >
          {/* First set (measured) */}
          <div
            ref={setRef}
            className={cn(
              "flex shrink-0 items-start gap-4 sm:gap-6",
              shouldSlide ? "pr-4 sm:pr-6" : "px-4"
            )}
          >
            {renderCards()}
          </div>

          {/* Duplicate set for the seamless loop */}
          {shouldSlide && (
            <div
              className="flex shrink-0 items-start gap-4 sm:gap-6 pr-4 sm:pr-6"
              aria-hidden="true"
            >
              {renderCards()}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}