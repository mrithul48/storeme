"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function TestimonialsSlider({ testimonials, themeColor }: TestimonialsSliderProps) {
  const sorted = [...testimonials].sort((a, b) => a.sortOrder - b.sortOrder);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % sorted.length);
  }, [sorted.length]);

  const prev = () => setCurrent((c) => (c - 1 + sorted.length) % sorted.length);

  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [sorted.length, next]);

  if (sorted.length === 0) return null;

  const t = sorted[current];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Card */}
      <div
        key={t.id}
        className="rounded-2xl p-6 md:p-8 text-center space-y-4 transition-all duration-500"
        style={{ backgroundColor: t.bgColor || "#1e293b" }}
      >
        {/* Stars */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={cn("text-xl", star <= t.rating ? "text-amber-400" : "text-slate-700")}
            >
              ★
            </span>
          ))}
        </div>

        <p className="text-slate-200 text-sm md:text-base leading-relaxed italic">
          &ldquo;{t.description}&rdquo;
        </p>

        <p className="font-bold text-white text-sm">— {t.name}</p>
      </div>

      {/* Controls */}
      {sorted.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {sorted.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Testimonial ${idx + 1}`}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: idx === current ? (themeColor || "#3b82f6") : "#334155",
                  width: idx === current ? "20px" : "8px",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
