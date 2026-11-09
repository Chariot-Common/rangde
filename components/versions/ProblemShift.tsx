"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ScrollInk } from "./ScrollInk";

/*
 * Version 1.1 B: the problem and what Rang De built, as one section of three before → after pairs instead of two
 * stacked sections with illustrations. Two levels of text only: the heading, then the pairs themselves, set large.
 * The points are one-to-one (banks won't lend → investors lend, informal loans cost more → interest stays fair,
 * no credit score → repaying builds credit), so each row shows the change Rang De makes: the problem is read first,
 * then it is struck through and fades as the Rang De side slides in beside it.
 */

const PAIRS: [string, string][] = [
  ["Banks won’t lend to them", "Investors lend to them"],
  ["Informal loans cost more", "Interest stays fair"],
  ["No credit score built", "Repaying builds credit"],
];

const EASE = [0.22, 1, 0.36, 1] as const;
const TEXT =
  "font-display text-[26px] font-bold leading-[32px] [text-wrap:balance] sm:text-[32px] sm:leading-[40px] lg:text-[40px] lg:leading-[48px]";

function Row({
  before,
  after,
  index,
}: {
  before: string;
  after: string;
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const on = inView || !!reduce;
  // The problem holds for a beat before the change happens.
  const t = (d: number) => ({
    duration: reduce ? 0 : 0.6,
    delay: reduce ? 0 : 0.5 + d,
    ease: EASE,
  });

  return (
    <li
      ref={ref}
      className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:gap-3"
    >
      <span className="sr-only">{`${index + 1}. ${before}. With Rang De: ${after}.`}</span>

      {/* Before: ink, then struck through and faded once Rang De's answer arrives. */}
      <div
        aria-hidden
        className="flex min-h-[120px] items-center rounded-[16px] bg-white px-6 py-7 sm:min-h-[160px] sm:px-10"
      >
        {/* The strike: a line drawn left to right through every line of the text (a background per line fragment). */}
        <p className={TEXT}>
          <span
            className="text-text-grey-100 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
            style={{
              backgroundImage: "linear-gradient(currentColor, currentColor)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 58%",
              backgroundSize: on ? "100% 0.1em" : "0% 0.1em",
              opacity: on ? 0.4 : 1,
              transition: reduce
                ? "none"
                : "background-size .7s cubic-bezier(.22,1,.36,1) .5s, opacity .6s ease .5s",
            }}
          >
            {before}
          </span>
        </p>
      </div>

      {/* The turn: an arrow between the two (down on phones, across from md up). */}
      <motion.div
        aria-hidden
        className="flex items-center justify-center"
        initial={false}
        animate={{ scale: on ? 1 : 0.4, opacity: on ? 1 : 0 }}
        transition={{
          ...t(0.25),
          type: reduce ? undefined : "spring",
          stiffness: 320,
          damping: 20,
        }}
      >
        <span className="flex size-[44px] items-center justify-center rounded-full bg-green-dark text-white md:size-[56px]">
          <svg
            viewBox="0 0 24 24"
            className="size-[20px] rotate-90 md:size-[24px] md:rotate-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </motion.div>

      {/* After: Rang De's answer, sliding in from the arrow. */}
      <motion.div
        aria-hidden
        className="flex min-h-[120px] items-center rounded-[16px] bg-[#cbe0b8] px-6 py-7 sm:min-h-[160px] sm:px-10"
        initial={false}
        animate={{ opacity: on ? 1 : 0, x: on ? 0 : -32 }}
        transition={t(0.35)}
      >
        <span className={`${TEXT} text-text-grey-100`}>{after}</span>
      </motion.div>
    </li>
  );
}

export function ProblemShift() {
  return (
    <section className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-bg-grey px-4 py-14 sm:px-8 sm:py-20 md:gap-16 md:py-24 lg:py-[120px]">
      <h2 className="max-w-[1100px] text-center font-display text-h3 font-bold [text-wrap:balance]">
        <ScrollInk
          as="span"
          tone="plain"
          text="The financial system wasn’t built for the businesses of rural India."
        />{" "}
        <span className="text-green-dark">So we built one at Rang De.</span>
      </h2>

      <div className="flex w-full max-w-[1200px] flex-col gap-3">
        {/* Column labels, desktop only (on phones the arrow between the cards says it). */}
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] gap-3 px-2 md:grid"
        >
          <p className="font-display text-p3 font-bold uppercase tracking-[1.2px] text-text-grey-48">
            Today
          </p>
          <span />
          <p className="font-display text-p3 font-bold uppercase tracking-[1.2px] text-green-dark">
            With Rang De
          </p>
        </div>
        <ol className="flex flex-col gap-6 md:gap-3">
          {PAIRS.map(([b, a], i) => (
            <Row key={b} before={b} after={a} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
