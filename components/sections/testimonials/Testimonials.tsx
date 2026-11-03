"use client";

import Link from "next/link";
import { stories, testimonialsRow1, testimonialsRow2 } from "@/lib/content";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { TestimonialMarquee } from "./TestimonialMarquee";
import { TestimonialCard } from "./TestimonialCard";
import { SwipeCarousel } from "@/components/ui/SwipeCarousel";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useRangDeStats } from "@/components/providers/StatsProvider";

const allTestimonials = [...testimonialsRow1, ...testimonialsRow2];

/**
 * `withStories` (Version B): the investors' words on the top strip, ticking left, and the
 * borrowers' success stories on the bottom strip, ticking right.
 */
export function Testimonials({ withStories = false }: { withStories?: boolean }) {
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
      <div className="-mx-4 flex w-[calc(100%+2rem)] flex-col gap-4 pb-sp6 md:hidden">
        <SwipeCarousel
          items={allTestimonials}
          peek
          autoAdvanceMs={3000}
          ariaLabel="Social investor testimonials"
          renderItem={(testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} align="left" variant="grid" />
          )}
        />
        {withStories && (
          <SwipeCarousel
            items={stories}
            peek
            autoAdvanceMs={3000}
            ariaLabel="Borrower success stories"
            renderItem={(story, i) => <StoryCard key={i} story={story} variant="grid" loading="lazy" />}
          />
        )}
      </div>

      {/* Bleeds past the section padding (-mx-8 = sm:px-8) so the rows run edge to edge. */}
      <div className="hidden w-[calc(100%+4rem)] flex-col gap-sp3 pb-sp6 md:-mx-8 md:flex">
        {withStories ? (
          <>
            <TestimonialMarquee items={allTestimonials} align="left" direction="forward" />
            <div className="group w-full overflow-hidden">
              <div className="flex w-max items-stretch gap-sp3 animate-marquee-reverse group-hover:[animation-play-state:paused]">
                {Array.from({ length: 8 }, () => stories)
                  .flat()
                  .map((story, i) => (
                    <StoryCard key={i} story={story} hiddenFromAT={i >= stories.length} loading="lazy" />
                  ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <TestimonialMarquee items={testimonialsRow1} align="left" direction="forward" />
            <TestimonialMarquee items={testimonialsRow2} align="left" direction="reverse" />
          </>
        )}
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
