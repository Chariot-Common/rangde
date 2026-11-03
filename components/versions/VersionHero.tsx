"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WordReveal } from "@/components/ui/WordReveal";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { HeroStatsStart } from "@/components/sections/hero/HeroStats";
import { usePageReady } from "@/lib/use-page-ready";
import { BODY_DURATION, BODY_STAGGER, EASE_OUT, TITLE_DURATION, TITLE_STAGGER, heroSequence } from "@/lib/hero-sequence";
import { Eyebrow } from "./ui";

/**
 * The homepage hero's layout for the test versions: the same golden glow, a two-tone
 * headline, a supporting line, the version's own actions, then (optionally) the homepage's
 * real story carousel bleeding edge to edge. It comes in like the homepage: the headline fills
 * in, then the sub-heading, then the button, then the stats count up (lib/hero-sequence.ts).
 */
export function VersionHero({
  eyebrow,
  headline,
  lead,
  actions,
  below,
  stories = true,
  leadClassName = "sm:max-w-[760px]",
}: {
  /** Optional small label above the headline. */
  eyebrow?: string;
  headline: { text: string; green?: boolean }[];
  lead: ReactNode;
  actions: ReactNode;
  below?: ReactNode;
  stories?: boolean;
  leadClassName?: string;
}) {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const title = headline.map((h) => h.text).join(" ");
  const body = typeof lead === "string" ? lead : "";
  const seq = heroSequence(title, body);
  const [statsStart, setStatsStart] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setStatsStart(true), reduce ? 0 : seq.stats * 1000);
    return () => clearTimeout(id);
  }, [ready, reduce, seq.stats]);

  // The button and the stats rise in after the copy above them has finished.
  const after = (at: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 12 },
          animate: ready ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.45, delay: at, ease: EASE_OUT },
        };

  // Each headline segment carries on the word count from the ones before it, so the two colours
  // fill in as one sentence.
  const counts = headline.map((h) => h.text.split(/\s+/).filter(Boolean).length);
  const startsAt = counts.map((_, i) => counts.slice(0, i).reduce((a, n) => a + n, 0) * TITLE_STAGGER);

  return (
    <div className="relative isolate flex w-full flex-col items-center gap-12 px-4 pt-12 sm:px-2 md:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[33px] -z-10 h-[1040px] w-[1040px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_250px_rgba(254,199,0,0.64)] sm:top-[-95px] sm:h-[650px] sm:w-[650px] md:top-[-125px] md:h-[850px] md:w-[850px] lg:top-[-174px] lg:h-[1250px] lg:w-[1250px]"
      />
      <div className="flex w-full max-w-[920px] flex-col items-center gap-3 text-center">
        {eyebrow && <Eyebrow className="text-green-dark">{eyebrow}</Eyebrow>}
        <h1 aria-label={title} className="font-display text-h1 font-bold leading-[38px] [text-wrap:balance] md:leading-[64px]">
          {headline.map((h, i) => {
            return (
              <span key={i}>
                {i > 0 && " "}
                <WordReveal
                  as="span"
                  text={h.text}
                  from={0.48}
                  stagger={TITLE_STAGGER}
                  duration={TITLE_DURATION}
                  delay={startsAt[i]}
                  play={ready}
                  className={`sm:block ${h.green === false ? "text-ink" : "text-green-dark"}`}
                />
              </span>
            );
          })}
        </h1>
        {body ? (
          <WordReveal
            text={body}
            stagger={BODY_STAGGER}
            duration={BODY_DURATION}
            delay={seq.body}
            play={ready}
            className={`max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] ${leadClassName}`}
          />
        ) : (
          <p className={`max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] ${leadClassName}`}>{lead}</p>
        )}
        <motion.div className="mt-3 flex flex-col items-center gap-3 sm:flex-row" {...after(seq.button)}>
          {actions}
        </motion.div>
      </div>
      {below && (
        <motion.div className="w-full max-w-[1200px]" {...after(seq.stats)}>
          <HeroStatsStart.Provider value={statsStart}>{below}</HeroStatsStart.Provider>
        </motion.div>
      )}
      {stories && (
        <div className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]">
          <StoryCarousel />
        </div>
      )}
    </div>
  );
}
