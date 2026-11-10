"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref } from "react";

/*
 * Version 2's "Why it matters" (Figma "why it matters high fidelity", node 3002:14071): the loan as a loop the borrower is
 * otherwise locked out of. Your social investment feeds their business → repayment → credit history → opportunities,
 * which feeds back into the business.
 *
 * The badge and heading are there from the start and scroll by as normal; the heading fills in, left to right (its first
 * line from text grey 24 to text grey 100, then the second from green dark at 24% to green dark). Then the stage pins:
 * "Your social investment" at the top (kept on screen, from the review call of 10 Nov 2026), its line filling green
 * down into Business, and the loop under it, an oval up to 1040px wide through the four steps. Business becomes the
 * current step and the oval fills round as the progress bar, one step at a time. The open step's line sits in the
 * middle (under the oval on phones) with its animated icon over it: P1, up to 600px wide, filling in letter by letter as
 * the loop travels on to the next step. With reduced motion it is shown finished, with all four lines.
 */

const ICONS = "/images/why-rangde-v2";
const STEPS = [
  { label: "Business", icon: `${ICONS}/icon-banknotes.webp`, text: "They buy equipment, stock a shop, expand a small business, buy livestock, or take on a new opportunity." },
  { label: "Repayment", icon: `${ICONS}/icon-hand-check.webp`, text: "They repay, month by month, as their loan agreement sets out." },
  { label: "Credit history", icon: `${ICONS}/icon-bar-chart.webp`, text: "Every repayment is reported to the credit bureaus. Borrowers who may never have had a credit file start building one." },
  { label: "Opportunities", icon: `${ICONS}/icon-target-center.webp`, text: "And with it, access to the formal financial system: more capital, back into the business." },
];
const N = STEPS.length;
const LINE_1 = "You’re not just giving someone a loan.";
const LINE_2 = "You’re helping them build their financial future.";
// From the Figma file; green dark is a token (green-dark), these are not yet.
const GREEN_LIGHT = "#cbe0b8";
const GREEN_HIGHLIGHT = "#62af1d";
const GREEN_DARK_24 = "rgba(58, 110, 12, 0.24)";
const EASE = [0.22, 1, 0.36, 1] as const;

// Through the pinned ring, 0 → 1: the line's last stretch fills into Business, Business lights up, then the four steps.
const Q = { segment: [0, 0.05], businessOn: 0.05, steps: [0.08, 0.97] } as const;

const ramp = (v: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// The ring's layout. Step heights: py-2 + 24px line (tablets up), py-1.5 + 22px (phones).
const RING_TOP = 53; // Business's centre below the top of the pinned stage
const BOTTOM_GAP = 24;
const CHIP_H = 42;
const CHIP_H_PHONE = 36;
const PHONE_TEXT = 190; // room under the ring for the step's line on phones
const LOOP_MAX_W = 1040; // the oval's widest (review call, 10 Nov 2026: an oval, not a rounded rectangle)
const TEXT_W = 600; // the open step's line, in the middle: P1, half the old width
const TEXT_GAP = 24; // the least room it leaves to Repayment and Opportunities
const TRACK_PX = 2;
const PROGRESS_PX = 4;

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
  const headRef = useRef<HTMLHeadingElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // The loop, sized to the pinned stage (see the comment at the top): as wide as the page's content, Opportunities and
  // Repayment against its left and right edges, and as tall as Business's centre to Credit history's.
  const [box, setBox] = useState({ w: 1200, h: 560 });
  // Opportunities and Repayment share one width (the wider of the two), so the loop is symmetrical and Business, the line
  // into it and Credit history all sit on the page's centre line.
  const [sideW, setSideW] = useState(0);
  const oppRef = useRef<HTMLSpanElement>(null);
  const repRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (reduce) return;
    const size = () => {
      const stage = stageRef.current?.getBoundingClientRect();
      if (!stage) return;
      const chip = phone ? CHIP_H_PHONE : CHIP_H;
      // "Your social investment" and the line down from it sit above the loop, inside the pinned stage.
      const top = ringRef.current?.offsetTop ?? RING_TOP;
      const h = stage.height - top - BOTTOM_GAP - chip / 2 - (phone ? PHONE_TEXT : 0);
      setBox({ w: Math.round(Math.min(stage.width, LOOP_MAX_W)), h: Math.max(160, Math.floor(h)) });
      setSideW(Math.ceil(Math.max(oppRef.current?.offsetWidth ?? 0, repRef.current?.offsetWidth ?? 0)));
    };
    size();
    // The stage's height follows the nav's (--navbar-bottom), which settles after first paint, so watch the stage itself.
    const ro = new ResizeObserver(size);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [reduce, phone]);

  // Three scroll-linked fills, worked out from where things sit on screen: the heading, the line, and the pinned ring.
  const [fill, setFill] = useState({ head: 0, q: 0 });
  const { scrollY } = useScroll();
  const update = useCallback(() => {
    const vh = window.innerHeight;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
    const h = headRef.current?.getBoundingClientRect();
    const w = wrapRef.current?.getBoundingClientRect();
    const s = stageRef.current?.getBoundingClientRect();
    if (!h || !w || !s) return;
    // The heading: from its top at 85% of the screen to its bottom at 35%.
    const head = Math.min(1, Math.max(0, (0.85 * vh - h.top) / (0.5 * vh + h.height)));
    // The ring: 0 as it pins, 1 as it lets go.
    const q = Math.min(1, Math.max(0, (nav - w.top) / Math.max(1, w.height - s.height)));
    setFill((f) => (f.head === head && f.q === q ? f : { head, q }));
  }, []);
  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, box.h]);

  const head = reduce ? 1 : fill.head;
  const q = reduce ? 1 : fill.q;
  const s = reduce ? N : ramp(q, Q.steps) * N;
  const started = reduce || q >= Q.businessOn;
  const finished = s >= N;
  const at = Math.min(N - 1, Math.floor(s));
  const within = finished ? 1 : s - at;
  const stateOf = (i: number): ChipState => (!started ? "upcoming" : finished || i < at ? "done" : i === at ? "current" : "upcoming");
  const filled1 = Math.round(ramp(head, [0, 0.5]) * LINE_1.length);
  const filled2 = Math.round(ramp(head, [0.5, 1]) * LINE_2.length);

  // The path: an oval through the four steps' centres (Business at the top, Repayment right, Credit history at the
  // bottom, Opportunities left), drawn clockwise from Business. Symmetrical both ways, so each step is a quarter of it.
  const xl = sideW / 2;
  const xr = box.w - sideW / 2;
  const cx = box.w / 2;
  const rx = Math.max(0, (xr - xl) / 2);
  const ry = box.h / 2;
  const d = `M ${cx} 0 A ${rx} ${ry} 0 0 1 ${cx} ${box.h} A ${rx} ${ry} 0 0 1 ${cx} 0 Z`;
  const side = sideW ? { minWidth: sideW } : undefined;
  const chipAt: CSSProperties[] = [
    { left: "50%", top: 0, transform: "translate(-50%, -50%)" },
    { right: 0, top: "50%", transform: "translateY(-50%)", ...side },
    { left: "50%", top: "100%", transform: "translate(-50%, -50%)" },
    { left: 0, top: "50%", transform: "translateY(-50%)", ...side },
  ];

  const ring = (
    <div ref={ringRef} className="relative mx-auto shrink-0" style={{ width: box.w, maxWidth: "100%", height: box.h }}>
      <svg aria-hidden width={box.w} height={box.h} className="absolute left-0 top-0 overflow-visible">
        <path d={d} fill="none" stroke="var(--color-text-grey-24)" strokeWidth={TRACK_PX} />
        <path
          d={d}
          fill="none"
          stroke={GREEN_HIGHLIGHT}
          strokeWidth={PROGRESS_PX}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - s / N}
        />
      </svg>
      {STEPS.map((step, i) => (
        <Chip key={step.label} ref={i === 1 ? repRef : i === 3 ? oppRef : undefined} label={step.label} state={stateOf(i)} style={chipAt[i]} />
      ))}
      {/* The open step's line, in the middle of the loop (laptops and tablets): its icon over it, P1, centred, 600px wide, but
          never running under Repayment or Opportunities. */}
      {!phone && !reduce && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ width: TEXT_W, maxWidth: Math.max(240, box.w - 2 * sideW - 2 * TEXT_GAP) }}
        >
          <StepLine started={started} at={at} within={within} large />
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 flex flex-col items-center rounded-[16px] bg-white px-4 pt-ds-9 sm:px-8">
      {/* Badge, eyebrow and heading: all there from the start; the heading fills in as it scrolls by. */}
      <div className="flex flex-col items-center gap-ds-6 text-center">
        <div className="relative size-[80px] md:size-[120px]">
          <Image src="/images/approaches/why-it-matters-badge.svg" alt="" fill unoptimized />
        </div>
        <div className="flex max-w-[1000px] flex-col items-center gap-2">
          <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-text-grey-80">Why it matters</p>
          <h2 ref={headRef} aria-label={`${LINE_1} ${LINE_2}`} className="font-display text-h3 font-bold [text-wrap:balance]">
            <span aria-hidden className="block">
              {LINE_1.split("").map((ch, i) => (
                <span key={i} className={i < filled1 ? "text-text-grey-100" : "text-text-grey-24"}>
                  {ch}
                </span>
              ))}
            </span>
            <span aria-hidden className="block">
              {LINE_2.split("").map((ch, i) => (
                <span key={i} className={i < filled2 ? "text-green-dark" : undefined} style={i < filled2 ? undefined : { color: GREEN_DARK_24 }}>
                  {ch}
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>

      <div className="h-ds-6 shrink-0" />
      {reduce ? (
        <>
          <Start />
          <Connector height={RING_TOP} fill={1} />
          {ring}
          <ol className="mt-ds-6 flex max-w-[560px] flex-col gap-3 pb-r9 text-center">
            {STEPS.map((step) => (
              <li key={step.label} className="font-display text-p3 font-bold text-text-grey-80">
                <span className="text-green-dark">{step.label}.</span> {step.text}
              </li>
            ))}
          </ol>
        </>
      ) : (
        // The ring pins once it is fully in view, and the steps play through the scroll from there.
        <div ref={wrapRef} className="relative w-full" style={{ height: "calc(4.5 * (100svh - var(--navbar-bottom, 0px)))" }}>
          <div
            ref={stageRef}
            className="sticky flex w-full flex-col items-center"
            style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
          >
            {/* Where it starts, kept on screen with the loop (review call): the line out of it fills green into Business. */}
            <div className="h-4 shrink-0" />
            <Start />
            <Connector height={RING_TOP} fill={ramp(q, Q.segment)} />
            {ring}
            {/* Phones: the line under the ring. */}
            {phone && (
              <div className="mt-ds-6 min-h-[96px] max-w-[320px] text-center">
                <StepLine started={started} at={at} within={within} />
              </div>
            )}
          </div>
        </div>
      )}

      <ol className="sr-only">
        {STEPS.map((step) => (
          <li key={step.label}>
            {step.label}: {step.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "Your social investment": where the loop starts. */
function Start() {
  return (
    <div className="shrink-0 rounded-[8px] border-[1.2px] border-solid border-green-dark bg-white px-4 py-2 font-display text-p2 font-medium text-text-grey-100">
      Your social investment
    </div>
  );
}

/** A stretch of the line from "Your social investment" to Business: the ring's grey track, with a green fill (the ring's
 * progress width) growing down it as `fill` goes 0 → 1. */
function Connector({ ref, height, fill }: { ref?: Ref<HTMLDivElement>; height: number; fill: number }) {
  return (
    <div ref={ref} aria-hidden className="relative flex w-[4px] shrink-0 justify-center" style={{ height }}>
      <span className="h-full bg-text-grey-24" style={{ width: TRACK_PX }} />
      <span className="absolute inset-x-0 top-0 origin-top rounded-full" style={{ height: "100%", backgroundColor: GREEN_HIGHLIGHT, transform: `scaleY(${fill})` }} />
    </div>
  );
}

/** A step on the ring (Figma 3002:14131…): upcoming is white with a grey outline; done is green light with a green outline;
 * current is filled green dark, with white text and a soft shadow. */
function Chip({ ref, label, state, style }: { ref?: Ref<HTMLSpanElement>; label: string; state: ChipState; style: CSSProperties }) {
  const cls =
    state === "current"
      ? "border-green-dark bg-green-dark text-white shadow-[0_8px_12px_rgba(51,13,110,0.24)]"
      : state === "done"
        ? "text-green-dark"
        : "border-text-grey-16 bg-white text-text-grey-64";
  return (
    <span
      ref={ref}
      className={`absolute whitespace-nowrap rounded-[8px] border-[1.2px] border-solid px-3 py-1.5 text-center font-display text-p3 font-medium transition-[background-color,color,border-color,box-shadow] duration-300 md:px-4 md:py-2 md:text-p2 ${cls}`}
      style={{ ...style, ...(state === "done" ? { backgroundColor: GREEN_LIGHT, borderColor: GREEN_HIGHLIGHT } : null) }}
      aria-current={state === "current" ? "step" : undefined}
    >
      {label}
    </span>
  );
}

/** The open step's line: text grey 24 to begin with, filling in to text grey 80 letter by letter as `within` goes 0 → 1.
 * `large`: P1 with the step's icon over it (in the middle of the loop on laptops and tablets); otherwise P2 (under it on
 * phones), with a smaller icon. */
function StepLine({ started, at, within, large = false }: { started: boolean; at: number; within: number; large?: boolean }) {
  const text = STEPS[at].text;
  const filled = started ? Math.round(within * text.length) : 0;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={started ? at : "idle"}
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: started ? 1 : 0, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {/* The step's animated icon (as a mask, in green dark) on a light green tile. */}
        <span aria-hidden className={`flex items-center justify-center rounded-[16px] ${large ? "size-[64px]" : "size-[44px] rounded-[12px]"}`} style={{ backgroundColor: GREEN_LIGHT }}>
          <span
            className={`block bg-green-dark ${large ? "size-[34px]" : "size-[24px]"}`}
            style={{ WebkitMask: `url(${STEPS[at].icon}) center / contain no-repeat`, mask: `url(${STEPS[at].icon}) center / contain no-repeat` }}
          />
        </span>
        <p className={`font-display font-bold [text-wrap:balance] ${large ? "text-p1 lg:text-[20px] lg:leading-[30px]" : "text-p2"}`}>
          {text.split("").map((ch, i) => (
            <span key={i} className={i < filled ? "text-text-grey-80" : "text-text-grey-24"}>
              {ch}
            </span>
          ))}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
