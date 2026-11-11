"use client";

import Image from "next/image";
import { useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { stories, testimonialsRow1, testimonialsRow2, type Testimonial } from "@/lib/content";

/*
 * Version 6: what comes after Rekha and Arjun, in the same flow (StoryHowItWorks renders it inside its own card,
 * after the story has turned into the wall of real people (CrowdWall, the story's last phase)), two rows that drift
 * opposite ways — the borrowers to the right, the investors to the left:
 * the borrowers as the green investee cards (Figma 2687:30126, the site's StoryCard) and the investors as the
 * testimonial cards (Figma 2687:31165) in white. The rows only start drifting once they are on screen.
 */

type Person = { key: string; words: ReactNode; name: string; meta: string; photo: ReactNode };

const investor = (t: Testimonial): Person => ({
  key: t.name,
  words: t.quote.map((q, i) => (
    <span key={i} className={q.emphasized ? "text-ink max-sm:text-p1" : undefined}>
      {q.text}
    </span>
  )),
  name: t.name,
  meta: t.since ?? t.role ?? "Social investor",
  photo: <Image src={t.avatar} alt="" fill sizes="64px" className="object-cover" />,
});

function PersonCard({ p, hidden }: { p: Person; hidden?: boolean }) {
  return (
    <article
      aria-hidden={hidden || undefined}
      className="flex min-h-[340px] w-[300px] shrink-0 flex-col justify-between gap-6 rounded-[8px] bg-white p-6 sm:w-[400px] sm:p-sp7 lg:min-h-[380px] lg:w-[440px]"
    >
      {/* Tall enough for the whole quote in most cases; only the longest are trimmed. */}
      {/* The quote set as Version 1's investor cards set it (TestimonialCard): p2 at 22/24px, the emphasised words in ink. */}
      <p className="line-clamp-[9] font-display text-p2 leading-[22px] text-ink/64 sm:leading-[24px]">{p.words}</p>
      <div className="flex items-end gap-sp7">
        <div className="flex flex-1 flex-col gap-sp1 font-display text-h6 font-semibold uppercase tracking-[0.8px]">
          <p className="text-ink">{p.name}</p>
          <p className="text-ink/64">{p.meta}</p>
        </div>
        <div className="relative size-[64px] shrink-0 overflow-hidden rounded-[8px] bg-white">{p.photo}</div>
      </div>
    </article>
  );
}

/** A row that drifts for ever (two copies, moved by half), left or right, from the moment it comes on screen. Hovering
 * a row pauses that row only (the other keeps drifting); the cards don't grow on hover.
 * `copy` is the same cards again, hidden from assistive tech. */
function Row({ children, copy, seconds, label, run, dir }: { children: ReactNode; copy: ReactNode; seconds: number; label: string; run: boolean; dir: "left" | "right" }) {
  const track = (
    <div role="region" aria-label={label} className="group min-w-0 flex-1 overflow-hidden px-4 motion-reduce:overflow-x-auto sm:px-8">
      {/* The animation is set as longhands, not the `animation` shorthand: the shorthand inline would reset the play
          state to running and override the hover pause. */}
      <div
        className={`flex w-max items-stretch gap-sp3 group-hover:[animation-play-state:paused] motion-reduce:!animate-none ${run ? "" : "[animation-play-state:paused]"}`}
        style={{ animationName: dir === "right" ? "marquee-reverse" : "marquee", animationDuration: `${seconds}s`, animationTimingFunction: "linear", animationIterationCount: "infinite" }}
      >
        {children}
        {copy}
      </div>
    </div>
  );
  return track;
}

export function StoriesTwoRows() {
  const ref = useRef<HTMLDivElement>(null);
  const run = useInView(ref, { once: true, amount: 0.15 });
  const borrowers = (hidden?: boolean) => [...stories, ...stories].map((st, i) => <StoryCard key={i} story={st} stretch still hiddenFromAT={hidden} />);
  const investors = [...testimonialsRow1, ...testimonialsRow2].map(investor);
  return (
    <div ref={ref} className="flex flex-col items-center gap-6 pb-14 pt-16 sm:pb-20 sm:pt-24 md:gap-8 lg:pb-[120px] lg:pt-[120px]">
      <div className="flex w-full flex-col gap-sp3">
        <Row
          seconds={110}
          dir="right"
          label="Borrowers on Rang De"
          run={run}
          copy={<div aria-hidden className="contents">{borrowers(true)}</div>}
        >
          {borrowers()}
        </Row>
        <Row
          seconds={130}
          dir="left"
          label="Investors on Rang De"
          run={run}
          copy={investors.map((p, i) => <PersonCard key={`b${i}`} p={p} hidden />)}
        >
          {investors.map((p, i) => <PersonCard key={`a${i}`} p={p} />)}
        </Row>
      </div>
    </div>
  );
}
