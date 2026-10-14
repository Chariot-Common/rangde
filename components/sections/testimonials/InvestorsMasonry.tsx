"use client";

import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { TestimonialCard } from "./TestimonialCard";
import type { Testimonial } from "@/lib/content";

interface InvestorsMasonryProps {
  testimonials: Testimonial[];
}

// Thin client wrapper so the (server) page can stay a Server Component — it exports
// `metadata`, which isn't allowed in a "use client" file — while still using
// MasonryGrid's render-prop API, which can't be handed a function from server code.
export function InvestorsMasonry({ testimonials }: InvestorsMasonryProps) {
  return (
    <MasonryGrid
      items={testimonials}
      renderItem={(testimonial, i) => (
        <TestimonialCard key={i} testimonial={testimonial} align="left" variant="grid" />
      )}
    />
  );
}
