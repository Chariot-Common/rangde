"use client";

import Image from "next/image";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SceneDef } from "./story-scenes";
import { UI_PROBLEM_SCENES as PROBLEM_SCENES, UI_SOLUTION_SCENES as SOLUTION_SCENES } from "./ui-scenes";

/*
 * Version 1.1: the problem and what Rang De built as one pinned section of two cards side by side, each half the width,
 * the page's full width between them (on phones, one above the other). The left card is the problem, the right card
 * Rang De's answer to it; the points are one-to-one. Scrolling moves through the three pairs: the problem card turns
 * to the next problem first, then the solution card follows a beat later with its answer.
 *
 * Text is two levels inside a card: a small label for the side, then the point (large) with one line under it.
 *
 * VISUALS: no drawn people. Each point shows a small piece of product UI (ui-scenes.tsx: the declined loan form and the
 * funded listing, the interest chart, the year of repayments), the same card on both sides so only the outcome
 * changes. Each point also has an `image` slot for the realistic illustrations; when one is set it replaces the UI.
 */

type Point = { title: string; line: string; image?: string; scene: SceneDef };

const PROBLEMS: Point[] = [
  { title: "Banks won’t lend to them", line: "Fewer than 15% of Indians have access to formal credit. No credit history or land means no loan.", scene: PROBLEM_SCENES[0] },
  // PLACEHOLDER: the 20–30% rate still has no confirmed source (MFI_RATE_SOURCE in approaches.tsx).
  { title: "Informal loans cost more", line: "Moneylenders and MFIs charge 20–30% a year, eating the income the loan was meant to grow.", scene: PROBLEM_SCENES[1] },
  { title: "No credit score built", line: "Informal loans leave no record, so every loan starts from zero.", scene: PROBLEM_SCENES[2] },
];
const SOLUTIONS: Point[] = [
  { title: "Investors lend to them", line: "Social investors fund them directly, with no land needed. Every borrower is vetted in person.", scene: SOLUTION_SCENES[0] },
  { title: "Interest stays fair", line: "Up to 8.5% a year, with no hidden charges and repayments that follow the business.", scene: SOLUTION_SCENES[1] },
  { title: "Repaying builds credit", line: "Every repayment is reported to the credit bureaus, so a credit history starts.", scene: SOLUTION_SCENES[2] },
];

const N = PROBLEMS.length;
// How far (in pairs) the solution card trails the problem card before it turns.
const LAG = 0.35;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Plays a scene once from the start each time it mounts. */
function PlayScene({ scene }: { scene: SceneDef }) {
  const reduce = useReducedMotion();
  const t = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(t, 1, { duration: 3.6, delay: 0.25, ease: "linear" });
    return () => c.stop();
  }, [t, reduce]);
  const { Scene } = scene;
  return <Scene t={t} />;
}

function Card({ side, points, at }: { side: "problem" | "solution"; points: Point[]; at: number }) {
  const solution = side === "solution";
  const p = points[at];
  const reduce = useReducedMotion();
  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] p-5 sm:p-8 lg:p-12 ${solution ? "bg-[#cbe0b8]" : "bg-bg-grey"}`}>
      <div className="flex items-center justify-between gap-4">
        <p className={`font-display text-p4 font-bold uppercase tracking-[1.2px] sm:text-p3 ${solution ? "text-green-dark" : "text-text-grey-64"}`}>
          {solution ? "With Rang De" : "The problem today"}
        </p>
        {/* Which of the three pairs this is. */}
        <div aria-hidden className="flex gap-1.5">
          {points.map((_, i) => (
            <span key={i} className={`h-[4px] w-6 rounded-full transition-colors duration-500 sm:w-8 ${i <= at ? (solution ? "bg-green-dark" : "bg-text-grey-100") : "bg-text-grey-16"}`} />
          ))}
        </div>
      </div>

      {/* The point: the new one rises in as the old one rises out. */}
      <div className="relative mt-4 min-h-0 flex-1 sm:mt-8">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={at}
            className="absolute inset-0 flex flex-col gap-4 sm:gap-6"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex flex-col gap-2 sm:gap-3">
              <h3 className="font-display text-[24px] font-bold leading-[30px] text-text-grey-100 [text-wrap:balance] sm:text-[32px] sm:leading-[40px] lg:text-[40px] lg:leading-[48px]">{p.title}</h3>
              <p className="max-w-[520px] font-display text-p2 font-medium text-text-grey-64 sm:text-p1 lg:text-[20px] lg:leading-[28px]">{p.line}</p>
            </div>
            {/* The visual sits straight on the card (no box of its own, so it isn't a card in a card) and fills the rest of it;
                an illustration image, when there is one, gets its own rounded frame. */}
            <div className="relative min-h-0 flex-1">
              {p.image ? <Image src={p.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="rounded-[12px] object-cover" /> : <PlayScene scene={p.scene} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ProblemSideBySide() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  // Read the progress into state (it only decides which pair shows), rather than handing a transform to the browser.
  useMotionValueEvent(scrollYProgress, "change", (v) => setPr(v));
  const pos = pr * N; // 0 → N across the section
  const problemAt = Math.min(N - 1, Math.floor(pos));
  const solutionAt = Math.min(N - 1, Math.max(0, Math.floor(pos - LAG)));

  return (
    <div ref={ref} className="relative" style={{ height: `calc(${N + 0.6} * (100svh - var(--navbar-bottom, 0px)))` }}>
      <section aria-label="The problem, and what Rang De does about it" className="sticky px-2" style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}>
        {/* The three pairs in order, for screen readers (the cards show one at a time). */}
        <ol className="sr-only">
          {PROBLEMS.map((q, i) => (
            <li key={q.title}>
              {q.title}: {q.line} With Rang De: {SOLUTIONS[i].title}: {SOLUTIONS[i].line}
            </li>
          ))}
        </ol>
        <div aria-hidden className="flex h-full flex-col gap-2 py-2 md:flex-row">
          <Card side="problem" points={PROBLEMS} at={problemAt} />
          <Card side="solution" points={SOLUTIONS} at={solutionAt} />
        </div>
      </section>
    </div>
  );
}
