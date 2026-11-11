"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/*
 * Version 2's "Why aren't Rang De returns higher?" (review call, 10 Nov 2026): no comparison with the stock market or
 * other investments. The answer is what Rang De does: the rate stays fair for the borrower, and the same rupee keeps
 * working for them. One card, kept light (11 Nov 2026): your return as one big line, then theirs as four tiles (an icon
 * and a few words each), closing on "Not a higher number. A wider return." Each part rises in as the card comes into view.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = "/images/why-rangde-v2";
const GREEN_DARK = "#3A6E0C";

// Simplified (review, 11 Nov 2026: five rows of label, value and sentence read as too heavy): your return as one big
// line, then theirs as four tiles of an icon and a few words.
const THEIRS = [
  { label: "A business that grows", icon: `${ICONS}/icon-bank.webp` },
  { label: "Steady work", icon: `${ICONS}/icon-hand-check.webp` },
  { label: "A credit history", icon: `${ICONS}/icon-bar-chart.webp` },
  { label: "A stronger community", icon: `${ICONS}/icon-network.webp` },
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
          <p className="mx-auto max-w-[480px] font-display text-p1 font-medium text-ink/72 lg:mx-0 lg:text-[20px] lg:leading-[30px]">
            We keep the rate fair for the people who borrow, so the same rupee keeps working for them.
          </p>
        </div>

        {/* What one loan returns: yours, then theirs. */}
        <div ref={ref} className="w-full rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_16px_40px_rgba(41,45,54,0.08)] sm:p-7 lg:p-8">
          <motion.div {...line(0)} className="flex flex-col gap-1 border-b border-dashed border-ink/16 pb-5">
            <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-ink/56">For you</p>
            <p className="font-display text-[32px] font-bold leading-[38px] text-[#00517A] lg:text-[40px] lg:leading-[46px]">Up to 8.5% a year</p>
          </motion.div>
          <motion.p {...line(1)} className="pt-5 font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-ink/56">
            For them
          </motion.p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {THEIRS.map((t, i) => (
              <motion.li key={t.label} {...line(i + 2)} className="flex flex-col items-start gap-3 rounded-[12px] bg-[#EEF6E6] p-4">
                <span
                  aria-hidden
                  className="block size-[28px]"
                  style={{ backgroundColor: GREEN_DARK, WebkitMask: `url(${t.icon}) center / contain no-repeat`, mask: `url(${t.icon}) center / contain no-repeat` }}
                />
                <span className="font-display text-[15px] font-bold leading-[20px] text-ink">{t.label}</span>
              </motion.li>
            ))}
          </ul>
          <motion.p {...line(THEIRS.length + 2)} className="mt-5 text-center font-display text-[15px] font-bold leading-[20px] text-ink">
            Not a higher number. <span className="text-green-dark">A wider return.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
