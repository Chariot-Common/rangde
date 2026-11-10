"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";

/*
 * Version 4: "You're not just giving someone a loan. You're helping them build their financial future." One pinned
 * section in place of "Why it matters" and the credit chain (the call combined the two). The loan as a loop the
 * borrower is otherwise locked out of: your social investment → their business → repayment → credit history → more
 * opportunity, which feeds back into the business. Scrolling moves round the ring one step at a time: the ring fills
 * to that step, the step lights up, and its line shows in the middle (under the ring on phones). It ends on
 * "Today's loan helps make tomorrow's credit possible." With reduced motion all five are shown as a list.
 */

const STEPS = [
  { label: "Social investment", text: "You kickstart a loop they’re locked out of today. Even a few thousand rupees can change a business." },
  { label: "Business", text: "They buy equipment, stock a shop, expand a small business, buy livestock, or take on a new opportunity." },
  { label: "Repayment", text: "They repay, month by month, as their loan agreement sets out." },
  { label: "Credit history", text: "Every repayment is reported to the credit bureaus, so borrowers who never had a credit file start building one." },
  { label: "More opportunity", text: "And with it, access to the formal financial system: more capital, back into the business." },
];
const N = STEPS.length;
const PURPLE = "#5a2aa8";
const EASE = [0.22, 1, 0.36, 1] as const;

const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

function Heading() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative hidden size-[64px] md:block md:size-[80px]">
        <Image src="/images/approaches/badge-star.svg" alt="" fill unoptimized className="p-[3%]" />
        <Image src="/images/approaches/lock-open.gif" alt="" width={48} height={48} unoptimized className="absolute left-1/2 top-1/2 size-[36px] -translate-x-1/2 -translate-y-1/2 md:size-[44px]" />
      </div>
      <h2 className="max-w-[900px] font-display text-[26px] font-bold leading-[32px] [text-wrap:balance] md:text-h3">
        <span className="text-ink">You’re not just giving someone a loan. </span>
        <span style={{ color: PURPLE }}>You’re helping them build their financial future.</span>
      </h2>
    </div>
  );
}

export function V4Cycle() {
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPr(v));
  const at = Math.min(N - 1, Math.floor(pr * N * 1.1));
  const done = pr > 0.92;

  if (reduce) {
    return (
      <section className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-white px-4 py-16 sm:px-8">
        <Heading />
        <ol className="flex w-full max-w-[720px] flex-col gap-4">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex gap-4">
              <span className="font-display text-p2 font-bold" style={{ color: PURPLE }}>{String(i + 1).padStart(2, "0")}</span>
              <p className="font-display text-p1 font-medium text-ink/72">
                <span className="font-bold text-ink">{s.label}.</span> {s.text}
              </p>
            </li>
          ))}
        </ol>
        <p className="font-display text-p1 font-bold text-ink">Today’s loan helps make tomorrow’s credit possible.</p>
      </section>
    );
  }

  // The ring's size: as big as the screen allows under the heading.
  // On phones it stays narrow enough for the step labels on its left and right edges to fit on screen.
  const ring = phone ? "min(64vw, calc(100svh - 430px))" : "min(500px, calc(100svh - 380px))";

  return (
    <div ref={ref} className="relative" style={{ height: "calc(4.4 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <section
        aria-label="How a loan builds a financial future"
        className="sticky mx-2 flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[16px] bg-white px-4 py-8 sm:px-8 md:gap-8"
        style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px) - 8px)" }}
      >
        <Heading />

        <div className="relative shrink-0" style={{ width: ring, height: ring }}>
          {/* The ring, and the part of it already travelled. */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(41,45,54,0.10)" strokeWidth="0.8" />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={PURPLE}
              strokeWidth="1.2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              initial={false}
              animate={{ strokeDashoffset: 1 - (done ? 1 : (at + 0.5) / N) }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          </svg>

          {/* The five steps round it, from the top, clockwise. */}
          {STEPS.map((s, i) => {
            const a = (-90 + (360 / N) * i) * (Math.PI / 180);
            const on = i === at && !done;
            const passed = i < at || done;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  const el = ref.current;
                  if (!el) return;
                  const top = el.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({ top: top + ((i + 0.5) / (N * 1.1)) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 font-display text-[12px] font-bold transition-[background-color,color,border-color,transform] duration-300 sm:px-4 sm:py-2 sm:text-p3 ${
                  on ? "scale-110 border-transparent text-white" : passed ? "border-[#ddd1f0] bg-[#ddd1f0] text-[#330c6e]" : "border-ink/12 bg-white text-ink/56"
                }`}
                style={{ left: `${50 + 44 * Math.cos(a)}%`, top: `${50 + 44 * Math.sin(a)}%`, backgroundColor: on ? PURPLE : undefined }}
              >
                {s.label}
              </button>
            );
          })}

          {/* The open step's line, in the middle of the ring (laptops). */}
          {!phone && (
            <div className="absolute inset-[22%] flex items-center justify-center text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={done ? "done" : at} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }}>
                  {done ? (
                    <p className="font-display text-[20px] font-bold leading-[28px] text-ink [text-wrap:balance]">Today’s loan helps make tomorrow’s credit possible.</p>
                  ) : (
                    <p className="font-display text-p1 font-medium text-ink/72 [text-wrap:balance] lg:text-[18px] lg:leading-[27px]">{STEPS[at].text}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Phones: the line under the ring. */}
        {phone && (
          <div className="min-h-[96px] max-w-[340px] text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={done ? "done" : at}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`font-display ${done ? "text-[18px] font-bold leading-[26px] text-ink" : "text-p2 font-medium text-ink/72"}`}
              >
                {done ? "Today’s loan helps make tomorrow’s credit possible." : STEPS[at].text}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        <ol className="sr-only">
          {STEPS.map((s) => (
            <li key={s.label}>
              {s.label}: {s.text}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
