"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/*
 * Version 2's "Why aren't Rang De returns higher?" (review call, 10 Nov 2026): no comparison with the stock market or
 * other investments. The answer is what Rang De does: the rate stays fair for the borrower, and the same rupee keeps
 * working after it has paid you your interest. Shown as a returns statement for one loan: your interest is the first
 * line, then the returns that don't show up in a percentage (a business, a livelihood, a credit history, a community).
 * The lines tick in one by one as the card comes into view, and it closes on "Not a higher number. A wider return."
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = "/images/why-rangde-v2";
const GREEN_DARK = "#3A6E0C";

const LINES = [
  { label: "For you", value: "Up to 8.5% a year", note: "Interest, paid back to your bank account along with your money.", icon: `${ICONS}/icon-banknotes.webp`, mine: true },
  { label: "A business", value: "That grows", note: "Stock for a shop, tools for a workshop, a second income beside the first.", icon: `${ICONS}/icon-bank.webp` },
  { label: "A livelihood", value: "Steady work", note: "Days of work for the borrower, and often for the people they hire.", icon: `${ICONS}/icon-hand-check.webp` },
  { label: "A credit history", value: "One repayment at a time", note: "Every repayment is reported to the credit bureaus, so the next loan is easier to get.", icon: `${ICONS}/icon-bar-chart.webp` },
  { label: "A community", value: "That does better", note: "When a local business does well, the families and suppliers around it do too.", icon: `${ICONS}/icon-network.webp` },
];

export function V4Returns() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const shown = reduce || inView;
  const line = (i: number) =>
    reduce ? { initial: false as const } : { initial: { opacity: 0, y: 12 }, animate: shown ? { opacity: 1, y: 0 } : undefined, transition: { duration: 0.5, delay: 0.25 + i * 0.22, ease: EASE } };

  return (
    <section className="mx-2 flex justify-center rounded-[16px] bg-[#cbe0b8] px-4 py-16 sm:px-8 md:py-24 lg:py-[120px]">
      <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* The answer. */}
        <div className="flex flex-col gap-5 text-center lg:text-left">
          <h2 className="font-display text-[28px] font-bold leading-[34px] text-ink [text-wrap:balance] md:text-[36px] md:leading-[44px] lg:text-[40px] lg:leading-[48px]">
            Why aren’t Rang De returns higher? <span className="text-green-dark">Because your money earns more than interest.</span>
          </h2>
          <p className="mx-auto max-w-[560px] font-display text-p1 font-medium text-ink/72 lg:mx-0 lg:text-[20px] lg:leading-[30px]">
            We keep the rate fair for the people who borrow, so the loan lifts them up rather than weighs them down. You still earn up to 8.5% a year, and the same
            rupee keeps working long after.
          </p>
        </div>

        {/* A returns statement for one loan. */}
        <div ref={ref} className="w-full rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_16px_40px_rgba(41,45,54,0.08)] sm:p-7 lg:p-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/16 pb-4">
            <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-ink/56">What one loan returns</p>
            <p className="font-display text-[12px] font-medium leading-[16px] text-ink/40">Statement</p>
          </div>

          <ul className="flex flex-col">
            {LINES.map((l, i) => (
              <motion.li key={l.label} {...line(i)} className={`flex items-start gap-4 py-4 ${i < LINES.length - 1 ? "border-b border-ink/8" : ""}`}>
                {/* The animated icon, as a mask, on a light green tile (blue for your own line). */}
                <span aria-hidden className="flex size-[44px] shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: l.mine ? "#E6F2FC" : "#EEF6E6" }}>
                  <span
                    className="block size-[24px]"
                    style={{ backgroundColor: l.mine ? "#00517A" : GREEN_DARK, WebkitMask: `url(${l.icon}) center / contain no-repeat`, mask: `url(${l.icon}) center / contain no-repeat` }}
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <p className="font-display text-[16px] font-bold leading-[22px] text-ink">{l.label}</p>
                    <p className="font-display text-[15px] font-bold leading-[22px] sm:text-right" style={{ color: l.mine ? "#00517A" : GREEN_DARK }}>
                      {l.value}
                    </p>
                  </div>
                  <p className="font-display text-[14px] font-medium leading-[20px] text-ink/64">{l.note}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.div {...line(LINES.length)} className="mt-2 flex items-center justify-between gap-4 rounded-[12px] bg-[#EEF6E6] px-4 py-3">
            <p className="font-display text-[15px] font-bold leading-[20px] text-ink">Not a higher number.</p>
            <p className="font-display text-[15px] font-bold leading-[20px] text-green-dark">A wider return.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
