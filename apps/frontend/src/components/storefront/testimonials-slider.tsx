"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  description: string;
  rating: number;
  bgColor?: string | null;
  sortOrder: number;
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  themeColor?: string | null;
}

// Minimum cards in one loop so the track is always wider than the screen
const MIN_LOOP_CARDS = 6;
// Seconds each card takes to pass; higher = slower
const SECONDS_PER_CARD = 6;

export function TestimonialsSlider({ testimonials, themeColor }: TestimonialsSliderProps) {
  const sorted = [...testimonials].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  const accent = themeColor || "#3b82f6";

  // Repeat the list until one loop is long enough, then render the loop twice
  // so translating by -50% lands exactly on the start again (seamless).
  const repeats = Math.ceil(MIN_LOOP_CARDS / sorted.length);
  const loop = Array.from({ length: repeats }, () => sorted).flat();
  const track = [...loop, ...loop];
  const duration = loop.length * SECONDS_PER_CARD;

  return (
    <div className="relative mx-auto w-full max-w-7xl">
      <style>{`
        @keyframes testimonialMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .testimonial-track {
          animation: testimonialMarquee var(--marquee-duration) linear infinite;
        }
        .testimonial-viewport:hover .testimonial-track,
        .testimonial-viewport:focus-within .testimonial-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .testimonial-track { animation: none; }
          .testimonial-viewport { overflow-x: auto; }
        }
      `}</style>

      <div className="testimonial-viewport overflow-hidden py-2">
        <div
          className="testimonial-track flex w-max"
          style={{ ["--marquee-duration" as string]: `${duration}s` }}
        >
          {track.map((t, idx) => (
            <article
              key={`${t.id}-${idx}`}
              aria-hidden={idx >= loop.length}
              className="mr-5 flex w-[280px] shrink-0 flex-col justify-between gap-5 rounded-2xl  p-6 md:w-[340px]"
              style={{
                backgroundColor: t.bgColor || "#1e293b",
              }}
            >
              <div>
                {/* Stars */}
                <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      aria-hidden
                      className={cn(
                        "text-base",
                        star <= t.rating ? "text-amber-400" : "text-white/15"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-slate-100">
                  &ldquo;{t.description}&rdquo;
                </p>
              </div>

              <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-white/80">
                <span className="truncate">{t.name}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}