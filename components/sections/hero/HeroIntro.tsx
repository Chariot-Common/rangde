"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WordReveal } from "@/components/ui/WordReveal";
import { usePageReady } from "@/lib/use-page-ready";
import { BODY_DURATION, BODY_STAGGER, EASE_OUT, TITLE_DURATION, TITLE_STAGGER, heroSequence } from "@/lib/hero-sequence";
import { HeroStats } from "./HeroStats";

const TITLE = "Invest in rural entrepreneurs,\nget repaid with interest";
const BODY =
  "Rang De bridges the gap between urban investors and rural India, turning investments into livelihoods and livelihoods into returns.";

// Headline, then the body copy, then the stats (lib/hero-sequence.ts).
const SEQ = heroSequence(TITLE, BODY);
const BODY_DELAY = SEQ.body;
const AFTER_BODY = SEQ.stats;

export function HeroIntro() {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const [statsStart, setStatsStart] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setStatsStart(true), reduce ? 0 : AFTER_BODY * 1000);
    return () => clearTimeout(id);
  }, [ready, reduce]);

  const after = (extra = 0) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 12 },
          animate: ready ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.45, delay: AFTER_BODY + extra, ease: EASE_OUT },
        };

  return (
    <>
      <div className="relative flex w-full max-w-[920px] flex-col items-center gap-2 text-center">
        <WordReveal
          as="h1"
          text={TITLE}
          from={0.48}
          stagger={TITLE_STAGGER}
          duration={TITLE_DURATION}
          play={ready}
          className="font-display text-h1 font-bold leading-[38px] text-green-dark [text-wrap:balance] md:leading-[64px]"
        />
        <WordReveal
          text={BODY}
          stagger={BODY_STAGGER}
          duration={BODY_DURATION}
          delay={BODY_DELAY}
          play={ready}
          className="max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] sm:max-w-[760px]"
        />
      </div>

      {/* "See how it works" now sits under the Why Rang De solution card: the mechanics come
          after the problem and solution, not straight after the headline. */}
      <motion.div className="relative w-full max-w-[1200px]" {...after()}>
        <HeroStats start={statsStart} />
      </motion.div>
    </>
  );
}
