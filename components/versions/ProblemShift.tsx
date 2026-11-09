"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

/*
 * Version 1.1: the problem, then what Rang De does about it, as one pinned section of text (no illustrations; a small
 * icon per point at most). It plays on scroll in two parts:
 *   1. The three problems come in one by one, in a single column in the middle, each one sentence: what happens, in
 *      bold, and why, in grey, at the same size (one level of text under the section heading).
 *   2. The column moves to the left and, one at a time, each problem is struck through and fades back while Rang De's
 *      answer to it comes in beside it, in green. The heading carries on with "So we built one at Rang De."
 * On phones the answers come in under each problem instead of beside it.
 */

type Point = { lead: string; rest: string; icon: ReactNode };

const I = (d: string) => (
  <svg viewBox="0 0 24 24" className="size-[20px] sm:size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const PROBLEMS: Point[] = [
  {
    lead: "Banks won’t lend to them,",
    rest: " because without a credit history or land to pledge, even a sound business looks too risky.",
    icon: I("M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"),
  },
  {
    // PLACEHOLDER: the 20–30% rate still has no confirmed source (MFI_RATE_SOURCE in approaches.tsx).
    lead: "Informal loans cost more,",
    rest: " at 20–30% a year from moneylenders, eating the income the loan was meant to grow.",
    icon: I("M17 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0M3 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 19L19 5"),
  },
  {
    lead: "No credit score gets built,",
    rest: " because informal loans leave no record, so every loan starts from zero.",
    icon: I("M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9.5 13.5l5 5m0-5l-5 5"),
  },
];

const SOLUTIONS: Point[] = [
  {
    lead: "Investors lend to them,",
    rest: " directly, with no land needed, and every borrower is vetted in person.",
    icon: I("M9 7a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"),
  },
  {
    lead: "Interest stays fair,",
    rest: " up to 8.5% a year, with no hidden charges and repayments that follow the business.",
    icon: I("M11.46 20.846A12 12 0 0 1 3.5 6A12 12 0 0 0 12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-.09 7.06M15 19l2 2l4-4"),
  },
  {
    lead: "Repaying builds credit,",
    rest: " because every repayment is reported to the credit bureaus.",
    icon: I("M4 19h16M4 15l4-6l4 2l4-5l4 4"),
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
// Where each part happens across the pinned scroll (0–1).
const IN = (i: number) => 0.04 + i * 0.1; // problem i comes in
const SPLIT = 0.36; // the column moves left, the heading carries on
const SWAP = (i: number) => 0.46 + i * 0.16; // problem i is struck through, its answer comes in

function Line({ p, tone, struck }: { p: Point; tone: "problem" | "solution"; struck?: boolean }) {
  const solution = tone === "solution";
  return (
    <div className="flex items-start gap-4">
      <span className={`mt-0.5 flex size-[40px] shrink-0 items-center justify-center rounded-[10px] sm:size-[44px] ${solution ? "bg-[#E6F1DA] text-green-dark" : "bg-white text-text-grey-64"}`}>{p.icon}</span>
      <p className="font-display text-[16px] font-medium leading-[24px] text-text-grey-64 [text-wrap:pretty] sm:text-[22px] sm:leading-[32px]">
        <span className={`relative font-bold ${solution ? "text-green-dark" : "text-text-grey-100"}`}>
          {p.lead}
          {/* The cancel-out: a line drawn through the problem's lead. */}
          {!solution && (
            <motion.span
              aria-hidden
              className="absolute left-0 right-0 top-[55%] h-[2.5px] origin-left rounded-full bg-text-grey-100"
              initial={false}
              animate={{ scaleX: struck ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          )}
        </span>
        {p.rest}
      </p>
    </div>
  );
}

export function ProblemShift() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  // Read into state (it only decides which part shows); not handed to the browser as a scroll-linked transform.
  useMotionValueEvent(scrollYProgress, "change", (v) => setPr(v));
  const p = reduce ? 1 : pr;
  const split = p >= SPLIT;

  return (
    <div ref={ref} className="relative" style={{ height: reduce ? "auto" : "calc(4.2 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <section
        aria-label="The problem, and what Rang De does about it"
        className={`${reduce ? "" : "sticky"} mx-2 flex flex-col justify-center overflow-hidden rounded-[16px] bg-bg-grey px-5 py-12 sm:px-10 lg:px-[80px]`}
        style={reduce ? undefined : { top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px) - 8px)" }}
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 sm:gap-12">
          <h2 className={`font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance] ${split ? "text-left" : "text-center"}`}>
            The financial system wasn’t built for rural India.{" "}
            <motion.span className="text-green-dark" initial={false} animate={{ opacity: split ? 1 : 0 }} transition={{ duration: 0.5 }}>
              So we built one at Rang De.
            </motion.span>
          </h2>

          <ol aria-hidden className="flex flex-col gap-6 sm:gap-8">
            {PROBLEMS.map((q, i) => {
              const shown = p >= IN(i);
              const swapped = p >= SWAP(i);
              return (
                <li key={q.lead} className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-12">
                  {/* The problem: in the middle at first, then in the left column once the answers start. */}
                  <motion.div
                    layout={!reduce}
                    className={split ? "" : "md:col-span-2 md:mx-auto md:w-full md:max-w-[680px]"}
                    initial={false}
                    animate={{ opacity: shown ? (swapped ? 0.45 : 1) : 0, y: shown ? 0 : 24 }}
                    transition={{ duration: 0.6, ease: EASE, layout: { duration: 0.7, ease: EASE } }}
                  >
                    <Line p={q} tone="problem" struck={swapped} />
                  </motion.div>
                  {/* Rang De's answer, coming in beside it (under it on phones) as the problem is struck through. */}
                  {split && (
                    <motion.div initial={false} animate={{ opacity: swapped ? 1 : 0, x: swapped ? 0 : -16 }} transition={{ duration: 0.6, ease: EASE, delay: swapped && !reduce ? 0.15 : 0 }}>
                      <Line p={SOLUTIONS[i]} tone="solution" />
                    </motion.div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        {/* All six, in order, for screen readers (the visible ones come in on scroll). */}
        <ol className="sr-only">
          {PROBLEMS.map((q, i) => (
            <li key={q.lead}>
              {q.lead}
              {q.rest} With Rang De: {SOLUTIONS[i].lead}
              {SOLUTIONS[i].rest}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
