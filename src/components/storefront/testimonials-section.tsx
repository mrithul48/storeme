import React from "react";
import { TestimonialsSlider } from "@/components/storefront/testimonials-slider";

interface Testimonial {
  id: string;
  name: string;
  description: string;
  rating: number;
  bgColor?: string | null;
  sortOrder: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  themeColor?: string | null;
}

export function TestimonialsSection({ testimonials, themeColor }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-xl font-bold sm:text-center text-start uppercase " style={{ color: "var(--store-page-heading, #ffffff)" }}>
          What Our Customers Say
        </h2>
        <TestimonialsSlider testimonials={testimonials} themeColor={themeColor} />
      </div>
    </section>
  );
}
