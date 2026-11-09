"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ScrollInk } from "./ScrollInk";
import type { SceneDef } from "./story-scenes";
import { UI_PROBLEM_SCENES as PROBLEM_SCENES, UI_SOLUTION_SCENES as SOLUTION_SCENES } from "./ui-scenes";

/*
 * Version 1.1 B: the problem and what Rang De built as ONE section of three tabs. Each tab is a pair, shown side by
 * side: today on the left (white card), with Rang De on the right (green card), each with its product-UI scene from
 * ui-scenes.tsx (drawn as pairs: the same card on both sides, only the outcome changes). Two levels of
 * text only: the section heading, then the two titles (the tabs are bare progress bars, named for screen readers). The tabs advance by themselves while the section is on screen
 * (the active tab's bar fills as it runs) and a click jumps to a tab.
 */

const PAIRS = [
  { tab: "Getting a loan", before: "Banks won’t lend to them", after: "Investors lend to them" },
  { tab: "What it costs", before: "Informal loans cost more", after: "Interest stays fair" },
  { tab: "Credit history", before: "No credit score built", after: "Repaying builds credit" },
];

const STEP_MS = 7000; // how long each tab stays before the next
const PLAY_S = 3.4; // each scene plays through in this long, then holds
const AFTER_DELAY_S = 1.1; // Rang De's side starts once the problem has had a moment

const TITLE = "font-display text-[28px] font-bold leading-[34px] [text-wrap:balance] sm:text-[36px] sm:leading-[44px] lg:text-[48px] lg:leading-[56px]";

/** One scene, played once from the start each time it mounts (the tab change remounts it). */
function Scene({ scene, delay, play }: { scene: SceneDef; delay: number; play: boolean }) {
  const t = useMotionValue(play ? 0 : scene.still ?? 1);
  useEffect(() => {
    if (!play) return;
    const c = animate(t, 1, { duration: PLAY_S, delay, ease: "easeInOut" });
    return () => c.stop();
  }, [play, delay, t]);
  const { Scene: S } = scene;
  return <S t={t} />;
}

export function ProblemTabs() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  // Once the section has been on screen the scenes play; before that they wait at their start.
  const started = useInView(ref, { amount: 0.4, once: true });
  const running = inView && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % PAIRS.length), STEP_MS);
    return () => clearTimeout(id);
  }, [active, running]);

  const pair = PAIRS[active];
  const play = started && !reduce;

  return (
    <section ref={ref} className="mx-2 flex flex-col items-center gap-8 rounded-[16px] bg-bg-grey px-4 py-14 sm:px-8 sm:py-20 md:gap-12 md:py-24 lg:py-[120px]">
      <h2 className="max-w-[1100px] text-center font-display text-h3 font-bold [text-wrap:balance]">
        <ScrollInk as="span" tone="plain" text="The financial system wasn’t built for the businesses of rural India." />{" "}
        <span className="text-green-dark">So we built one at Rang De.</span>
      </h2>

      <div className="flex w-full max-w-[1440px] flex-col gap-4 md:gap-6">
        {/* The tabs: a bar on top of each that fills while it is the one showing. */}
        <div role="tablist" aria-label="What changes with Rang De" className="grid grid-cols-3 gap-2 md:gap-3">
          {PAIRS.map((p, i) => (
            <button
              key={p.tab}
              role="tab"
              type="button"
              id={`problem-tab-${i}`}
              aria-selected={i === active}
              aria-controls="problem-tabpanel"
              aria-label={p.tab}
              onClick={() => setActive(i)}
              className="group flex h-6 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-grey-100"
            >
              <span className="relative h-[4px] w-full overflow-hidden rounded-full bg-text-grey-16 transition-colors group-hover:bg-text-grey-24">
                {i < active && <span className="absolute inset-0 rounded-full bg-text-grey-100" />}
                {i === active && (
                  <motion.span
                    key={`${active}-${running}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-text-grey-100"
                    initial={{ width: running ? "0%" : "100%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: running ? STEP_MS / 1000 : 0, ease: "linear" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* The pair, side by side (stacked on phones). */}
        <div id="problem-tabpanel" role="tabpanel" aria-labelledby={`problem-tab-${active}`} className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          <Card key={`b-${active}`} tone="before" label="Today" title={pair.before} scene={PROBLEM_SCENES[active]} delay={0} play={play} />
          <Card key={`a-${active}`} tone="after" label="With Rang De" title={pair.after} scene={SOLUTION_SCENES[active]} delay={AFTER_DELAY_S} play={play} />
        </div>
      </div>
    </section>
  );
}

function Card({ tone, label, title, scene, delay, play }: { tone: "before" | "after"; label: string; title: string; scene: SceneDef; delay: number; play: boolean }) {
  const after = tone === "after";
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`flex h-[380px] flex-col gap-6 overflow-hidden rounded-[20px] px-6 py-7 sm:h-[600px] sm:px-10 sm:py-10 lg:h-[680px] lg:px-12 lg:py-12 ${after ? "bg-[#cbe0b8]" : "bg-white"}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : delay * 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Just the title: the white card is today, the green one is Rang De, so no label is needed above it. */}
      <p className={`${TITLE} text-text-grey-100`}>
        <span className="sr-only">{label}: </span>
        {title}
      </p>
      {/* The visual, as large as fits, rising in from below. */}
      <div className="relative min-h-0 w-full flex-1">
        <Scene scene={scene} delay={delay} play={play} />
      </div>
    </motion.div>
  );
}
