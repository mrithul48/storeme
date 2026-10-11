"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, animate, useMotionValue, useReducedMotion } from "framer-motion"; // or "motion/react"
import { cn } from "@/lib/utils";

export interface BrandItem {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
}

interface BrandSectionProps {
  brands: BrandItem[];
  brandShape?: string;
  shopUrl: string;
}

const PAUSE = 1500; // ms to wait between each slide
const SLIDE_DURATION = 0.6; // seconds for one card to slide

export function BrandSection({
  brands,
  brandShape = "SQUARE",
  shopUrl,
}: BrandSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  const [setWidth, setSetWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const isRound = brandShape === "ROUND";
  const isRect = brandShape === "RECTANGLE";
  const count = brands?.length ?? 0;

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
  }, [brands]);

  // Slide only when the cards are wider than the screen
  const shouldSlide = !reduceMotion && containerWidth > 0 && setWidth > containerWidth;

  // Width of one step = card width + gap
  const step = count > 0 ? setWidth / count : 0;

  // One-by-one slide, right to left, infinite
  useEffect(() => {
    x.set(0);
    if (!shouldSlide || step <= 0) return;

    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    let index = 0;

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      while (!cancelled) {
        await wait(PAUSE);
        while (pausedRef.current && !cancelled) await wait(200);
        if (cancelled) return;

        index += 1;
        controls = animate(x, -index * step, {
          duration: SLIDE_DURATION,
          ease: [0.65, 0, 0.35, 1],
        });

        try {
          await controls;
        } catch {
          return;
        }

        // After a full set, jump back to start (looks identical because of the duplicate set)
        if (index >= count) {
          index = 0;
          x.set(0);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [shouldSlide, step, count, x]);

  if (!brands || brands.length === 0) return null;

  const renderCards = () =>
    brands.map((brand) => (
      // Hover animation is on the whole card (not the image)
      <motion.div
        key={brand.id}
        className="shrink-0"
        whileHover={reduceMotion ? undefined : { y: -8, scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        <Link
          href={`${shopUrl}?brand=${brand.id}`}
          className={cn(
            "flex flex-col items-center gap-2",
            isRect ? "w-36 sm:w-44 md:w-52" : "w-28 sm:w-36 md:w-40"
          )}
        >
          {/* Logo: same fixed size for every card */}
          <div
            className={cn(
              "relative overflow-hidden shrink-0",
              isRound
                ? "w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full"
                : isRect
                ? "w-36 h-24 sm:w-44 sm:h-28 md:w-52 md:h-32 rounded-xl"
                : "w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl"
            )}
          >
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                className="object-cover"
              />
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center text-3xl font-bold"
                style={{ color: "var(--store-page-heading, #ffffff)" }}
              >
                {brand.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Brand name at bottom */}
          <span
            className="w-full text-xs sm:text-sm font-medium text-center truncate uppercase"
            style={{ color: "var(--store-page-heading, #ffffff)" }}
          >
            {brand.name}
          </span>
        </Link>
      </motion.div>
    ));

  return (
    <section
      className="py-8 sm:py-10"
      
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-start sm:text-center px-4 sm:px-6 lg:px-8 uppercase"
          style={{ color: "var(--store-page-heading, #ffffff)" }}
        >
          Our Brands
        </h2>
      </div>

      {/* pt-4 / pb-3 leave room so the lifted card is not clipped */}
      <div
        ref={containerRef}
        className={cn("overflow-hidden pt-4 pb-3", !shouldSlide && "flex justify-center")}
      >
        <motion.div
          style={{ x }}
          className="flex w-max flex-nowrap"
          onHoverStart={() => (pausedRef.current = true)}
          onHoverEnd={() => (pausedRef.current = false)}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => (pausedRef.current = false)}
          onTouchCancel={() => (pausedRef.current = false)}
        >
          {/* First set (measured) */}
          <div
            ref={setRef}
            className={cn(
              "flex flex-nowrap shrink-0 items-start gap-4 sm:gap-6",
              shouldSlide ? "pr-4 sm:pr-6" : "px-4"
            )}
          >
            {renderCards()}
          </div>

          {/* Duplicate set for the seamless loop */}
          {shouldSlide && (
            <div
              className="flex flex-nowrap shrink-0 items-start gap-4 sm:gap-6 pr-4 sm:pr-6"
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