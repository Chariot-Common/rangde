"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HowItWorksStage } from "@/components/how-it-works/HowItWorksStage";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";
import { Eyebrow } from "./ui";

/*
 * Version 4's How it works: the original How it works pop-up, laid out left and right. On the left the four steps as an
 * accordion, in the pop-up's own words (one open at a time, moving on by itself while on screen, with a thin bar
 * running for the open one; a click opens any); on the right the pop-up's animation for the open step (the vetting
 * funnel, choosing and lending, collection, tracking). `children` (the infrastructure row) sits under it.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
// How long each step's animation takes to play through once (the pop-up's figma-motion loop for that step).
const STEP_MS = [12000, 16800, 12400, 11700];
// The pop-up's titles, except step 1 drops "in need" (it reads like a donation).
const TITLES = ["We find, select and verify rural entrepreneurs", ...HOW_IT_WORKS_STEPS.slice(1).map((s) => s.headingParts.map((p) => p.text).join(""))];

export function V4HowItWorks({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);
  const running = inView && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setOpen((o) => (o + 1) % HOW_IT_WORKS_STEPS.length), STEP_MS[open]);
    return () => clearTimeout(id);
  }, [open, running]);

  return (
    <section ref={ref} id="how-it-works" className="mx-2 flex flex-col items-center gap-12 rounded-[16px] bg-[#ebeaea] px-4 py-14 sm:px-8 sm:py-20 lg:px-[80px] lg:py-[120px]">
      <div className="grid w-full max-w-[1320px] grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-14">
        {/* The steps. */}
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <div className="flex flex-col gap-2">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">Investment to repayment, you’re in control at every step</h2>
          </div>
          <ol className="flex flex-col border-t border-ink/12">
            {HOW_IT_WORKS_STEPS.map((s, i) => {
              const on = i === open;
              return (
                <li key={s.eyebrow} className="border-b border-ink/12">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setOpen(i)}
                    className="relative flex w-full items-start gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span className={`mt-0.5 font-display text-p3 font-bold tabular-nums transition-colors ${on ? "text-primary" : "text-ink/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 font-display text-p1 font-bold transition-colors sm:text-[20px] sm:leading-[28px] ${on ? "text-ink" : "text-ink/56 hover:text-ink/80"}`}>{TITLES[i]}</span>
                    {/* The open step's bar, running for as long as its animation plays. */}
                    {on && running && (
                      <motion.span
                        key={`bar-${open}`}
                        aria-hidden
                        className="absolute -bottom-px left-0 h-[2px] bg-ink"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: STEP_MS[i] / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <p className="overflow-hidden pl-[34px] font-display text-p2 font-medium text-ink/64 sm:text-p1">
                      <span className="block pb-5">
                        {s.description}
                        {s.note && <span className="mt-2 block text-ink/48">{s.note}</span>}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* The pop-up's animation for the open step. */}
        <motion.div
          className="order-1 h-[400px] w-full overflow-hidden rounded-[16px] bg-white sm:h-[500px] lg:order-2 lg:h-[620px]"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <HowItWorksStage wide stepIndex={open} label={HOW_IT_WORKS_STEPS[open].illustrationLabel} />
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
