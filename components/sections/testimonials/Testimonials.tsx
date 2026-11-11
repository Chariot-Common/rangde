"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { stories, testimonialsRow1, testimonialsRow2 } from "@/lib/content";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { TestimonialMarquee } from "./TestimonialMarquee";
import { TestimonialCard } from "./TestimonialCard";
import { SwipeCarousel } from "@/components/ui/SwipeCarousel";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { ScrollType } from "@/components/versions/ScrollType";
import { ScrollInk } from "@/components/versions/ScrollInk";

const allTestimonials = [...testimonialsRow1, ...testimonialsRow2];

/**
 * `withStories` (Version B): the investors' words on the top strip, ticking left, and the
 * borrowers' success stories on the bottom strip, ticking right.
 */
/** `typed`: the heading types itself out as it is scrolled into view (Version 5).
 * `refined` (Version 1.1): an H3 "Trusted by … across the world" heading, both rows (on phones too) stop on
 * hover and can be dragged left or right, and no "Explore more investors" button.
 * `inked` (with `refined`, Version 1.1): the heading fills in as it is read (plain, no coloured edge).
 * `evenRows` (Version 1): both rows as tall as the taller one. Each row is as tall as its longest quote, so the second
 * row came out shorter than the first; measured on load and on resize, since quote lengths and card widths vary. */
export function Testimonials({ withStories = false, typed = false, refined = false, inked = false, evenRows = false }: { withStories?: boolean; typed?: boolean; refined?: boolean; inked?: boolean; evenRows?: boolean }) {
  const { investors } = useRangDeStats();
  const rowsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rows = rowsRef.current;
    if (!evenRows || !rows) return;
    const even = () => {
      // Each row's track (the strip of cards inside it); clear any height set before so the natural heights are measured.
      const tracks = [...rows.children].map((row) => row.firstElementChild as HTMLElement | null).filter((t): t is HTMLElement => !!t);
      tracks.forEach((t) => (t.style.minHeight = ""));
      const tallest = Math.max(...tracks.map((t) => t.offsetHeight));
      tracks.forEach((t) => (t.style.minHeight = `${tallest}px`));
    };
    even();
    document.fonts?.ready.then(even);
    window.addEventListener("resize", even);
    return () => window.removeEventListener("resize", even);
  }, [evenRows]);
  return (
    <section className="mx-2 flex flex-col items-center gap-8 overflow-hidden rounded-[16px] bg-white px-4 py-12 sm:gap-sp9 sm:px-8 sm:py-16 lg:py-sp12">
      <div className="flex flex-col items-center gap-4 pt-sp6 text-center sm:gap-5">
        <div className="flex items-center gap-2" aria-hidden>
          {["in", "us", "de", "au", "gb", "se"].map((c) => (
            <FlagBadge key={c} flag={c} className="h-[24px] w-[32px] ring-0 shadow-[0_0_0_1px_rgba(41,45,54,0.08)]" />
          ))}
        </div>
        {refined && inked ? (
          // Keyed on the text so it starts afresh if the live investor count arrives after it has rendered.
          <ScrollInk
            key={investors}
            as="h2"
            tone="plain"
            text={`Trusted by ${investors.toLocaleString("en-IN")} social investors across the world.`}
            className="font-display text-h3 font-bold"
          />
        ) : refined && typed ? (
          <ScrollType text={`Trusted by ${investors.toLocaleString("en-IN")} social investors across the world.`} className="font-display text-h3 font-bold text-ink" />
        ) : refined ? (
          <h2 className="font-display text-h3 font-bold text-ink">
            Trusted by {investors.toLocaleString("en-IN")} social investors across the world.
          </h2>
        ) : typed ? (
          <ScrollType text={`${investors.toLocaleString("en-IN")} social investors and counting`} className="font-display text-h2 font-bold text-ink" />
        ) : (
          <h2 className="font-display text-h2 font-bold text-ink">
            {investors.toLocaleString("en-IN")} social investors and counting
          </h2>
        )}
      </div>

      {/* Mobile (<768px): edge to edge (-mx-4 undoes the section padding), the current card
          centred with its neighbours peeking in, moving on every 3 seconds — same as the
          hero's story cards. */}
      <div className={`-mx-4 w-[calc(100%+2rem)] flex-col gap-4 pb-sp6 md:hidden ${refined ? "hidden" : "flex"}`}>
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
      <div ref={rowsRef} className={`w-[calc(100%+2rem)] flex-col gap-sp3 pb-sp6 -mx-4 sm:-mx-8 sm:w-[calc(100%+4rem)] md:flex ${refined ? "flex" : "hidden"}`}>
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
            <TestimonialMarquee items={testimonialsRow1} align="left" direction="forward" draggable={refined} />
            <TestimonialMarquee items={testimonialsRow2} align="left" direction="reverse" draggable={refined} />
          </>
        )}
      </div>

      {!refined && (
      <Link
        href="/investors"
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[4px] bg-primary/16 px-[16px] font-display text-p3 font-bold text-primary transition-[filter,background-color] duration-150 hover:bg-primary/24"
      >
        Explore more investors
      </Link>
      )}
    </section>
  );
}
