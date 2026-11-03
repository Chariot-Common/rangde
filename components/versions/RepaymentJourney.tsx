"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { formatInr } from "@/lib/investment-calculator";

// ILLUSTRATION ONLY — equal monthly instalments at Rang De's top published rate (8.5% p.a.,
// rangde.in's "upto 8.5%"). Real loans vary by rate, tenure and schedule (some repay in one
// go at the end), which the note says. Replace with real schedules before shipping.
const RATE = 0.085;
const MIN = 500;
const MAX = 100_000;
const STEP = 500;
const TENURES = [6, 12, 24];

function monthly(amount: number, months: number) {
  const r = RATE / 12;
  return (amount * r) / (1 - Math.pow(1 + r, -months));
}

/** Lend once, see it come back: one amount, one loan length, one row of months, two numbers. */
export function RepaymentJourney({ title }: { title?: { lead: string; rest: string } }) {
  const [amount, setAmount] = useState(10_000);
  const [months, setMonths] = useState(12);
  // How many months have come back so far; the bars and the total count up together.
  const [filled, setFilled] = useState(0);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  // Fills in, left to right, the first time the row is on screen and again after a new
  // loan length is picked (about 2.4s either way).
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const id = requestAnimationFrame(() => setFilled(months));
      return () => cancelAnimationFrame(id);
    }
    const id = setInterval(() => setFilled((f) => Math.min(f + 1, months)), 2400 / months);
    return () => clearInterval(id);
  }, [inView, months, reduce]);

  const emi = monthly(amount, months);
  const percent = ((amount - MIN) / (MAX - MIN)) * 100;

  return (
    <section className="relative mx-2 flex flex-col items-center rounded-[16px] bg-[#cbe0b8] px-4 py-16 sm:px-8 md:py-24">
      <div className="flex w-full max-w-[720px] flex-col items-center gap-10 md:gap-12">
        <AnimatedText
          as="h2"
          segments={[
            { text: title?.lead ?? "Lend once ~", className: "text-ink" },
            { text: title?.rest ?? "and watch it come back to you, month after month.", className: "text-green-dark" },
          ]}
          className="w-full text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />

        <div className="flex w-full flex-col gap-8 rounded-[16px] bg-white p-6 sm:p-10">
          {/* Input: the homepage's own green slider, and the loan length. */}
          <div className="flex flex-col items-center gap-3">
            <label htmlFor="journey-amount" className="font-display text-p2 font-medium text-ink/80">
              If you lend
            </label>
            <p className="font-display text-[32px] font-bold leading-[36px] text-ink md:text-h3 md:leading-[48px]">{formatInr(amount)}</p>
            <input
              id="journey-amount"
              type="range"
              className="rangde-slider"
              min={MIN}
              max={MAX}
              step={STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ ["--fill" as string]: `${percent}%` }}
              aria-valuetext={formatInr(amount)}
            />
            <div role="group" aria-label="Loan length" className="mt-2 flex gap-2">
              {TENURES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={t === months}
                  onClick={() => {
                    setMonths(t);
                    setFilled(0);
                  }}
                  className={`min-h-[44px] rounded-full px-4 font-display text-p3 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark ${t === months ? "bg-green-dark text-white" : "text-ink/80 hover:bg-bg-grey"}`}
                >
                  {t} months
                </button>
              ))}
            </div>
          </div>

          {/* One mark per month: each is a repayment arriving. */}
          <div ref={ref} className="flex flex-col gap-2" aria-hidden>
            <div className="flex h-[32px] items-end gap-[3px] sm:gap-[4px]">
              {Array.from({ length: months }, (_, i) => (
                <motion.div
                  key={i}
                  className="h-full flex-1 origin-bottom rounded-[3px] bg-green-dark"
                  initial={false}
                  animate={i < filled ? { scaleY: 1, opacity: 1 } : { scaleY: 0.15, opacity: 0.25 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>
            <div className="flex justify-between font-display text-p4 font-medium text-ink/72">
              <span>Month 1</span>
              <span>Month {months}</span>
            </div>
          </div>

          {/* Output: the only two numbers that matter. */}
          <div className="grid grid-cols-2 gap-4 border-t border-ink/8 pt-8 text-center">
            <div className="flex flex-col gap-1">
              <p className="font-display text-[24px] font-bold leading-[30px] text-ink sm:text-h4">{formatInr(emi)}</p>
              <p className="font-display text-p3 font-medium text-ink/72">back every month</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-[24px] font-bold leading-[30px] tabular-nums text-green-dark sm:text-h4">{formatInr(emi * filled)}</p>
              <p className="font-display text-p3 font-medium tabular-nums text-ink/72">
                back in {filled} month{filled === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <p className="max-w-[620px] text-center font-display text-p4 font-medium text-ink/72">
          Illustration at 8.5% p.a., Rang De&rsquo;s highest rate today, in equal monthly instalments. Each loan&rsquo;s rate and schedule are
          shown before you invest. As per RBI regulations, repayments cannot be guaranteed.
        </p>
      </div>
    </section>
  );
}
