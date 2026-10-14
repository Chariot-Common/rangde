"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WordReveal, wordRevealLength } from "@/components/ui/WordReveal";
import { HowItWorksTrigger } from "@/components/how-it-works/HowItWorksTrigger";
import { usePageReady } from "@/lib/use-page-ready";
import { HeroStats } from "./HeroStats";

const TITLE = "Invest in rural entrepreneurs,\nget repaid with interest";
const BODY =
  "Rang De bridges the gap between urban investors and rural India, turning investments into livelihoods and livelihoods into returns.";

// One sequence, in the order of rangde.org's programme pages: the headline fills in word
// by word (pale → full, like Swabhimaan), then the body copy appears word by word (like
// the About page), and only once it has finished do the link and the stats come in.
const TITLE_STAGGER = 0.08;
const TITLE_DURATION = 0.5;
const BODY_STAGGER = 0.035;
const BODY_DURATION = 0.4;
const BODY_DELAY = wordRevealLength(TITLE, TITLE_STAGGER, TITLE_DURATION) - 0.15;
const AFTER_BODY = BODY_DELAY + wordRevealLength(BODY, BODY_STAGGER, BODY_DURATION) - 0.1;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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
          transition: { duration: 0.6, delay: AFTER_BODY + extra, ease: EASE_OUT },
        };

  return (
    <>
      <div className="relative flex w-full max-w-[920px] flex-col items-center gap-4 text-center sm:gap-sp6">
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
        <motion.div {...after()}>
          <HowItWorksTrigger className="font-display text-p3 font-bold text-primary transition-colors [--dot-color:rgb(13_170_222/0.72)] hover:text-primary/80 hover:[--dot-color:var(--color-primary)]">
            <span className="dot-underline">See how it works</span>
          </HowItWorksTrigger>
        </motion.div>
      </div>

      <motion.div className="relative w-full max-w-[1200px]" {...after(0.1)}>
        <HeroStats start={statsStart} />
      </motion.div>
    </>
  );
}
