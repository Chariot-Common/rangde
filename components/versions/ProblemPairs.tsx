"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ScrollInk } from "./ScrollInk";

/*
 * Version 1.1: the problem and what Rang De built, as one section of three before → after pairs. Each card is one
 * sentence at one size: the point in bold, then why (the problem) or how (Rang De) running on after it.
 * The points are one-to-one (banks won't lend → investors lend, informal loans cost more → interest stays fair,
 * no credit score → repaying builds credit), so each row shows the change Rang De makes: the problem is read first,
 * then it is struck through and fades as the Rang De side slides in beside it.
 */

export type Side = { title: string; line: string };
export const PAIRS: [Side, Side][] = [
  [
    { title: "Banks won’t lend to them", line: "No credit history or land to pledge, so even a sound business looks too risky." },
    { title: "Investors lend to them", line: "Directly, with no land needed. Every borrower is vetted in person first." },
  ],
  [
    // PLACEHOLDER: the 20–30% rate still has no confirmed source (MFI_RATE_SOURCE in approaches.tsx).
    { title: "Informal loans cost more", line: "Moneylenders charge 20–30% a year, eating the income the loan was meant to grow." },
    { title: "Interest stays fair", line: "Up to 8.5% a year, no hidden charges, repayments that follow the business." },
  ],
  [
    { title: "No credit score built", line: "Informal loans leave no record, so every new loan starts from zero." },
    { title: "Repaying builds credit", line: "Every repayment is reported to the credit bureaus, so a credit history starts." },
  ],
];

const EASE = [0.22, 1, 0.36, 1] as const;
// One size for the whole sentence: the point in bold ink, the rest in medium grey.
const TEXT = "font-display text-[20px] font-medium leading-[28px] text-text-grey-64 [text-wrap:pretty] sm:text-[24px] sm:leading-[32px] lg:text-[28px] lg:leading-[38px]";

function Row({
  before,
  after,
  index,
}: {
  before: Side;
  after: Side;
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
      <span className="sr-only">{`${index + 1}. ${before.title}: ${before.line} With Rang De: ${after.title}: ${after.line}`}</span>

      {/* Before: ink, then struck through and faded once Rang De's answer arrives. */}
      <div
        aria-hidden
        className="flex min-h-[140px] items-center rounded-[16px] bg-white px-6 py-7 sm:min-h-[180px] sm:px-10"
        style={{ opacity: on ? 0.55 : 1, transition: reduce ? "none" : "opacity .6s ease .5s" }}
      >
        {/* The strike: a line drawn left to right through every line of the text (a background per line fragment). */}
        <p className={TEXT}>
          <span
            className="font-bold text-text-grey-100 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
            style={{
              backgroundImage: "linear-gradient(currentColor, currentColor)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 58%",
              backgroundSize: on ? "100% 0.1em" : "0% 0.1em",
              transition: reduce ? "none" : "background-size .7s cubic-bezier(.22,1,.36,1) .5s",
            }}
          >
            {before.title}.
          </span>{" "}
          {before.line}
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
        className="flex min-h-[140px] items-center rounded-[16px] bg-[#cbe0b8] px-6 py-7 sm:min-h-[180px] sm:px-10"
        initial={false}
        animate={{ opacity: on ? 1 : 0, x: on ? 0 : -32 }}
        transition={t(0.35)}
      >
        <p className={`${TEXT} !text-text-grey-80`}>
          <span className="font-bold text-text-grey-100">{after.title}.</span> {after.line}
        </p>
      </motion.div>
    </li>
  );
}

export function ProblemPairs() {
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
        <ol className="flex flex-col gap-6 md:gap-3">
          {PAIRS.map(([b, a], i) => (
            <Row key={b.title} before={b} after={a} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
