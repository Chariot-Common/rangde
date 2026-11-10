"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Version 2.1's "Why it matters" (Figma "why it matters high fidelity", node 3002:14071): the loan as a loop the borrower
 * is otherwise locked out of. Your social investment feeds their business → repayment → credit history → opportunities,
 * which feeds back into the business.
 *
 * One pinned section, played by the scroll, in this order:
 *   1. the badge fades in, 2. then the heading;
 *   3. "Your social investment" fades in as a plain box (like an upcoming step), then fills: dark green outline, full text;
 *   4. the green line grows out of it, down to the ring;
 *   5. the heading lifts off the top of the screen (fading as it goes) and the ring settles in the middle; Business
 *      becomes the current step;
 *   6. the ring fills round as the progress bar, one step at a time. The open step's line, in the middle of the ring (under
 *      it on phones), starts at text grey 24 and fills in letter by letter as the ring travels on to the next step.
 * With reduced motion it is shown finished, with all four lines.
 */

const STEPS = [
  { label: "Business", text: "They buy equipment, stock a shop, expand a small business, buy livestock, or take on a new opportunity." },
  { label: "Repayment", text: "They repay, month by month, as their loan agreement sets out." },
  { label: "Credit history", text: "Every repayment is reported to the credit bureaus. Borrowers who may never have had a credit file start building one." },
  { label: "Opportunities", text: "And with it, access to the formal financial system: more capital, back into the business." },
];
const N = STEPS.length;
// From the Figma file; green dark is a token (green-dark), these two are not yet.
const GREEN_LIGHT = "#cbe0b8";
const GREEN_HIGHLIGHT = "#62af1d";
const EASE = [0.22, 1, 0.36, 1] as const;

// The scroll, 0 → 1 through the pinned section.
const T = {
  badge: [0, 0.05],
  heading: [0.03, 0.09],
  box: [0.09, 0.13],
  boxFill: [0.13, 0.17],
  line: [0.17, 0.22],
  lift: [0.2, 0.3],
  businessOn: 0.26,
  steps: [0.3, 0.97],
} as const;

// Scroll-linked values are worked out here, in functions, rather than with useTransform's range mapping: Motion hands
// range-mapped opacity/transform over to the browser's native scroll timeline, which mapped these ranges wrongly (the
// heading and box faded back out as the section scrolled on).
const ramp = (v: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const mixRgba = (from: number[], to: number[], t: number) => {
  const [r, g, b, a] = from.map((f, i) => f + (to[i] - f) * t);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
};

const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

type ChipState = "upcoming" | "done" | "current";

export function V4Cycle() {
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  useMotionValueEvent(p, "change", setPr);

  // How far the column has to rise for the ring's centre to sit in the middle of the stage.
  const [lift, setLift] = useState(0);
  const y = useTransform(p, (v) => -lift * ease(ramp(v, T.lift)));
  useEffect(() => {
    if (reduce) return;
    const measure = () => {
      const stage = stageRef.current?.getBoundingClientRect();
      const ring = ringRef.current?.getBoundingClientRect();
      const box = boxRef.current?.getBoundingClientRect();
      if (!stage || !ring || !box) return;
      const now = y.get();
      // Centre the ring, but never so far that "Your social investment" goes under the top of the stage (and the nav).
      const toCentre = ring.top + ring.height / 2 - now - (stage.top + stage.height / 2);
      const boxRoom = box.top - now - stage.top - 32;
      setLift(Math.max(0, Math.min(toCentre, boxRoom)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduce, phone, y]);

  // 1–4: the intro, all tied to the scroll.
  // Both fade back out as they lift away, so the heading always clears the screen, however tall it wraps.
  const lifted = (v: number) => 1 - ramp(v, [T.lift[0] + 0.03, T.lift[1]]);
  const badgeOpacity = useTransform(p, (v) => ramp(v, T.badge) * lifted(v));
  const badgeY = useTransform(p, (v) => 16 * (1 - ramp(v, T.badge)));
  const headOpacity = useTransform(p, (v) => ramp(v, T.heading) * lifted(v));
  const headY = useTransform(p, (v) => 16 * (1 - ramp(v, T.heading)));
  const boxOpacity = useTransform(p, (v) => ramp(v, T.box));
  const boxBorder = useTransform(p, (v) => mixRgba([41, 45, 54, 0.16], [58, 110, 12, 1], ramp(v, T.boxFill)));
  const boxText = useTransform(p, (v) => mixRgba([41, 45, 54, 0.64], [41, 45, 54, 1], ramp(v, T.boxFill)));
  const lineScale = useTransform(p, (v) => ramp(v, T.line));

  // 5–6: the steps. s runs 0 → 4 across them; the ring fills by s / 4.
  const s = reduce ? N : Math.min(N, Math.max(0, ((pr - T.steps[0]) / (T.steps[1] - T.steps[0])) * N));
  const started = reduce || pr >= T.businessOn;
  const finished = s >= N;
  const at = Math.min(N - 1, Math.floor(s));
  const within = finished ? 1 : s - at;
  const stateOf = (i: number): ChipState => (!started ? "upcoming" : finished || i < at ? "done" : i === at ? "current" : "upcoming");

  const ring = phone ? "min(58vw, calc(100svh - var(--navbar-bottom, 0px) - 300px))" : "min(560px, calc(100svh - var(--navbar-bottom, 0px) - 330px))";
  const line = phone ? 56 : 96;

  const body = (
    <div className="flex flex-col items-center">
      {/* 1–2: badge, eyebrow and heading. */}
      <div className="flex flex-col items-center gap-ds-6 text-center">
        <motion.div className="relative size-[80px] md:size-[120px]" style={reduce ? undefined : { opacity: badgeOpacity, y: badgeY }}>
          <Image src="/images/approaches/why-it-matters-badge.svg" alt="" fill unoptimized />
        </motion.div>
        <motion.div className="flex max-w-[1000px] flex-col items-center gap-2" style={reduce ? undefined : { opacity: headOpacity, y: headY }}>
          <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-text-grey-80">Why it matters</p>
          <h2 className="font-display text-h3 font-bold [text-wrap:balance]">
            <span className="block text-text-grey-100">You’re not just giving someone a loan.</span>
            <span className="block text-green-dark">You’re helping them build their financial future.</span>
          </h2>
        </motion.div>
      </div>

      {/* 3: where it starts. */}
      <motion.div
        ref={boxRef}
        className="mt-ds-6 rounded-[8px] border-[1.2px] border-solid bg-white px-4 py-2 font-display text-p2 font-medium"
        style={reduce ? { borderColor: "var(--color-green-dark)" } : { opacity: boxOpacity, borderColor: boxBorder, color: boxText }}
      >
        Your social investment
      </motion.div>

      {/* 4: the line out of it, down to the ring. */}
      <div aria-hidden className="relative w-[2px]" style={{ height: line }}>
        <motion.span className="absolute inset-0 origin-top" style={{ backgroundColor: GREEN_HIGHLIGHT, scaleY: reduce ? 1 : lineScale }} />
      </div>

      {/* 5–6: the ring, with the steps round it from the top, clockwise. */}
      <div ref={ringRef} className="relative shrink-0" style={{ width: ring, height: ring }}>
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 overflow-visible">
          <circle cx="50" cy="50" r="50" fill="none" stroke="var(--color-text-grey-16)" strokeWidth="0.25" />
          <circle
            cx="50"
            cy="50"
            r="50"
            fill="none"
            stroke={GREEN_HIGHLIGHT}
            strokeWidth="0.5"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - s / N}
          />
        </svg>
        {STEPS.map((step, i) => {
          const a = (-90 + (360 / N) * i) * (Math.PI / 180);
          return <Chip key={step.label} label={step.label} state={stateOf(i)} left={50 + 50 * Math.cos(a)} top={50 + 50 * Math.sin(a)} />;
        })}

        {/* The open step's line, in the middle of the ring (laptops and tablets). */}
        {!phone && !reduce && (
          <div className="absolute inset-[26%] flex items-center justify-center text-center">
            <StepLine started={started} at={at} within={within} />
          </div>
        )}
      </div>

      {/* Phones: the line under the ring. */}
      {phone && !reduce && (
        <div className="mt-ds-6 min-h-[96px] max-w-[320px] text-center">
          <StepLine started={started} at={at} within={within} />
        </div>
      )}

      {reduce && (
        <ol className="mt-ds-6 flex max-w-[560px] flex-col gap-3 text-center">
          {STEPS.map((step) => (
            <li key={step.label} className="font-display text-p3 font-bold text-text-grey-80">
              <span className="text-green-dark">{step.label}.</span> {step.text}
            </li>
          ))}
        </ol>
      )}

      <ol className="sr-only">
        {STEPS.map((step) => (
          <li key={step.label}>
            {step.label}: {step.text}
          </li>
        ))}
      </ol>
    </div>
  );

  if (reduce) {
    return <section className="mx-2 flex flex-col items-center rounded-[16px] bg-white px-4 py-r9 sm:px-8">{body}</section>;
  }

  return (
    <div ref={wrapRef} className="relative" style={{ height: "calc(5.5 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <section
        ref={stageRef}
        aria-label="How a loan builds a financial future"
        className="sticky mx-2 flex flex-col items-center overflow-hidden rounded-[16px] bg-white px-4 pt-ds-9 sm:px-8"
        style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px) - 8px)" }}
      >
        <motion.div className="w-full" style={{ y }}>
          {body}
        </motion.div>
      </section>
    </div>
  );
}

/** A step on the ring (Figma 3002:14131…): upcoming is white with a grey outline; done is green light with a green outline;
 * current is filled green dark, with white text and a soft shadow. */
function Chip({ label, state, left, top }: { label: string; state: ChipState; left: number; top: number }) {
  const cls =
    state === "current"
      ? "border-green-dark bg-green-dark text-white shadow-[0_8px_12px_rgba(51,13,110,0.24)]"
      : state === "done"
        ? "text-green-dark"
        : "border-text-grey-16 bg-white text-text-grey-64";
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[8px] border-[1.2px] border-solid px-3 py-1.5 font-display text-p3 font-medium transition-[background-color,color,border-color,box-shadow] duration-300 md:px-4 md:py-2 md:text-p2 ${cls}`}
      style={{ left: `${left}%`, top: `${top}%`, ...(state === "done" ? { backgroundColor: GREEN_LIGHT, borderColor: GREEN_HIGHLIGHT } : null) }}
      aria-current={state === "current" ? "step" : undefined}
    >
      {label}
    </span>
  );
}

/** The open step's line: text grey 24 to begin with, filling in to text grey 80 letter by letter as `within` goes 0 → 1. */
function StepLine({ started, at, within }: { started: boolean; at: number; within: number }) {
  const text = STEPS[at].text;
  const filled = started ? Math.round(within * text.length) : 0;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.p
        key={started ? at : "idle"}
        className="font-display text-p3 font-bold [text-wrap:pretty]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: started ? 1 : 0, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {text.split("").map((ch, i) => (
          <span key={i} className={i < filled ? "text-text-grey-80" : "text-text-grey-24"}>
            {ch}
          </span>
        ))}
      </motion.p>
    </AnimatePresence>
  );
}
