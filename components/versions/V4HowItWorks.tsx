"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HowItWorksStage } from "@/components/how-it-works/HowItWorksStage";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";
import { CreditGrowsScene } from "./CreditGrowsScene";

/*
 * Version 2.1's How it works: the original How it works pop-up, laid out left and right, with its steps built like the
 * problem card on the section lab (app/v/sections, PairedStory's StoryCard): the "How it works" heading centred on top,
 * the same top and bottom padding; on the left the four steps, each a dot with a line down to the next that fills while
 * that step plays, a P1 bold title and a P2 body that opens only for the step that's on; on the right the pop-up's
 * animation for that step, at its own size, with the problem card's 1.2px outside stroke round the frame.
 * It moves on by itself while on screen (each step for as long as its animation takes); a click opens any.
 * `children` (the infrastructure row) sits under it.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
// The step dots once reached, and the step pills: a dark blue given for this section (no design-system token for it yet).
const DOT_BLUE = "#00517A";
// How long each step's animation takes to play through once (the pop-up's figma-motion loop for that step; step 5 is
// CreditGrowsScene).
const STEP_MS = [12000, 16800, 12400, 11700, 9500];
// From the review call (10 Nov 2026): every title short enough for one line, "invest in" rather than "support" (which
// reads like a donation), the 1st and 15th moved into step 3's body, and a fifth step for the borrower's side: their
// credit grows.
const STEPS = [
  { title: "We find and verify rural entrepreneurs", body: HOW_IT_WORKS_STEPS[0].description },
  { title: "Choose whom you’d like to invest in", body: HOW_IT_WORKS_STEPS[1].description },
  {
    title: "Payments are collected",
    body: "We collect on the 1st or 15th of the month, whichever comes next. Within 24 hours the money reaches the borrower’s bank account, as RBI regulations require.",
  },
  { title: "Track all your investments", body: "See every investment you’ve made, your total earnings, the repayments you’ve had and the ones still to come, borrower by borrower." },
  {
    title: "Their credit grows",
    body: "Every repayment is reported to the credit bureaus, so the borrower builds a formal credit history, and with it new possibilities: a bigger loan, new machinery, more clients.",
  },
];
const LABEL_5 = "Rekha Bai's repayments tick in month by month and her credit rating rises from new to credit to good; then her new possibilities appear: expand the business, buy new machinery, take on more clients, a bigger loan next time.";

export function V4HowItWorks({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);
  const running = inView && !reduce;
  // 0 → 1 through the open step: fills its line, and moves on to the next step when it's full.
  const fill = useMotionValue(0);
  const n = STEPS.length;

  useEffect(() => {
    if (!running) {
      fill.set(reduce ? 1 : 0);
      return;
    }
    fill.set(0);
    const a = animate(fill, 1, { duration: STEP_MS[open] / 1000, ease: "linear", onComplete: () => setOpen((o) => (o + 1) % n) });
    return () => a.stop();
  }, [open, running, reduce, fill, n]);

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="mx-2 flex flex-col items-center gap-ds-6 rounded-[16px] bg-[#ebeaea] px-4 pb-ds-6 pt-[40px] md:px-r3 md:pb-r8 md:pt-ds-9"
    >
      <h2 className="text-center font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance]">How it works</h2>

      {/* Steps take what the frame leaves; the block is held to the two of them so no gap opens up between. */}
      <div className="grid w-full max-w-[1320px] grid-cols-1 items-center gap-8 lg:max-w-[1360px] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-r7">
        {/* The steps (under the animation on phones, as on the section lab). */}
        <ol className="order-2 flex w-full flex-col lg:order-1">
          {STEPS.map((s, i) => (
            <StepRow
              key={s.title}
              step={i + 1}
              title={s.title}
              body={s.body}
              active={i === open}
              reached={i <= open}
              last={i === n - 1}
              fill={i === open ? fill : i < open ? 1 : 0}
              onSelect={() => setOpen(i)}
            />
          ))}
        </ol>

        {/* The pop-up's animation for the open step, with the problem card's outside stroke (text grey 8). On laptops it is about
            as tall as the steps beside it (520px), in its earlier 758 × 620 proportions. */}
        <motion.div
          className="order-1 h-[400px] w-full overflow-hidden rounded-[16px] bg-white shadow-[0_0_0_1.2px_var(--color-text-grey-8)] sm:h-[500px] lg:order-2 lg:h-[560px] lg:w-auto xl:h-[640px] lg:max-w-full lg:aspect-[758/620] lg:justify-self-end"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {open < HOW_IT_WORKS_STEPS.length ? (
            <HowItWorksStage wide stepIndex={open} label={HOW_IT_WORKS_STEPS[open].illustrationLabel} />
          ) : (
            <div role="img" aria-label={LABEL_5} className="size-full">
              <CreditGrowsScene />
            </div>
          )}
        </motion.div>
      </div>

      {children && (
        <>
          <div className="h-px w-full max-w-[1200px] bg-ink/8" />
          {children}
        </>
      )}
    </section>
  );
}

/** One step, as the section lab's StepRow: a dot (#00517A once reached, grey before), a line from it to the next dot that
 * fills in primary blue 64 while the step plays (the rows touch, so the line runs on unbroken), the title, and the body, which folds open
 * only while the step is on. */
function StepRow({ step, title, body, active, reached, last, fill, onSelect }: { step: number; title: string; body: ReactNode; active: boolean; reached: boolean; last: boolean; fill: MotionValue<number> | number; onSelect: () => void }) {
  return (
    <li className="relative flex gap-r4">
      <div aria-hidden className="relative w-3 shrink-0">
        {!last && (
          <span className="absolute left-1/2 top-[18px] -bottom-[6px] w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-text-grey-16">
            <motion.span className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-primary-64" style={{ scaleY: fill }} />
          </span>
        )}
        <span className={`absolute left-0 top-[6px] size-3 rounded-full transition-colors duration-300 ${reached ? "" : "bg-text-grey-16"}`} style={reached ? { backgroundColor: DOT_BLUE } : undefined} />
      </div>
      <div className={`flex min-w-0 flex-col ${last ? "" : "pb-8 lg:pb-10"}`}>
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "step" : undefined}
          className={`group flex flex-col items-start gap-2.5 text-left font-display text-p1 font-bold lg:whitespace-nowrap transition-colors duration-300 ${active ? "text-text-grey-100" : "text-text-grey-40 hover:text-text-grey-64"}`}
        >
          {/* "Step 1"…: primary blue 16 with #00517A text, filled #00517A with white text for the open step. */}
          <span
            className={`rounded-full px-3 py-1 font-display text-h5 font-bold uppercase tracking-[0.88px] transition-colors duration-300 ${active ? "text-white" : "bg-primary-16"}`}
            style={active ? { backgroundColor: DOT_BLUE } : { color: DOT_BLUE }}
          >
            Step {step}
          </span>
          {title}
        </button>
        {/* Opens and closes by its own height (grid rows 0fr ↔ 1fr). */}
        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <p className="overflow-hidden font-display text-p2 font-medium text-text-grey-64">
            <span className="block pt-2">{body}</span>
          </p>
        </div>
      </div>
    </li>
  );
}
