"use client";

import Link from "next/link";
import { testimonialsRow1, testimonialsRow2 } from "@/lib/content";
import { TestimonialMarquee } from "./TestimonialMarquee";
import { TestimonialCard } from "./TestimonialCard";
import { SwipeCarousel } from "@/components/ui/SwipeCarousel";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useRangDeStats } from "@/components/providers/StatsProvider";

const allTestimonials = [...testimonialsRow1, ...testimonialsRow2];

export function Testimonials() {
  const { investors } = useRangDeStats();
  return (
    <section className="mx-2 flex flex-col items-center gap-8 overflow-hidden rounded-[16px] bg-white px-4 py-12 sm:gap-sp9 sm:px-8 sm:py-16 lg:py-sp12">
      <div className="flex flex-col items-center gap-4 pt-sp6 text-center sm:gap-5">
        <div className="flex items-center gap-2" aria-hidden>
          {["in", "us", "de", "au", "gb", "se"].map((c) => (
            <FlagBadge key={c} flag={c} className="h-[24px] w-[32px] ring-0 shadow-[0_0_0_1px_rgba(41,45,54,0.08)]" />
          ))}
        </div>
        <h2 className="font-display text-h2 font-bold text-ink">
          {investors.toLocaleString("en-IN")} social investors and counting
        </h2>
      </div>

      {/* Mobile (<768px): edge to edge (-mx-4 undoes the section padding), the current card
          centred with its neighbours peeking in, moving on every 3 seconds — same as the
          hero's story cards. */}
      <div className="-mx-4 w-[calc(100%+2rem)] pb-sp6 md:hidden">
        <SwipeCarousel
          items={allTestimonials}
          peek
          autoAdvanceMs={3000}
          ariaLabel="Social investor testimonials"
          renderItem={(testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} align="left" variant="grid" />
          )}
        />
      </div>

      {/* Bleeds past the section padding (-mx-8 = sm:px-8) so the rows run edge to edge. */}
      <div className="hidden w-[calc(100%+4rem)] flex-col gap-sp3 pb-sp6 md:-mx-8 md:flex">
        <TestimonialMarquee items={testimonialsRow1} align="left" direction="forward" />
        <TestimonialMarquee items={testimonialsRow2} align="left" direction="reverse" />
      </div>

      <Link
        href="/investors"
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[4px] bg-primary/16 px-[16px] font-display text-p3 font-bold text-primary transition-[filter,background-color] duration-150 hover:bg-primary/24"
      >
        Explore more investors
      </Link>
    </section>
  );
}
