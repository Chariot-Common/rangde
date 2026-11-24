"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui";
import { ScrollInk } from "./ScrollInk";
import { HEAD, PAPER, SUB } from "./WhyThread2";

/*
 * Version 4 (/v/v4, from /v/why3; 24 Nov 2026 review). Two sections of its own:
 *
 * V4ProblemOptions: the problem and the options in one place, so there's less to scroll. The problem's line sits in the
 * middle of the pinned dark screen (with /v/why3's clip of people at work behind it) and brightens word by word; then
 * the five options rise over it one after another, as /v/why3's option cards did. Each card leads with its point in one
 * line ("Banks rarely say yes to a first loan."), no label above it and no divider, and the number that backs it is in
 * the card's own text (the four separate stat cards and the "every option is shut" lines are gone). Government schemes
 * are in, second, as the question people ask first.
 *
 * V4Close: the closing line with a plain Invest button under it, ahead of the live opportunities.
 */

const DARK = "#1B1D22";
const LIME = "#D9E89A";

const PROBLEM = "Millions in rural India find it difficult to fund their business’s growth.";
const WORDS = PROBLEM.split(" ");

type Option = { icon: IconName | "scheme"; t: string; s: string };
const OPTIONS: Option[] = [
  {
    icon: "bank",
    t: "Banks rarely say yes to a first loan.",
    s: "They ask for collateral and a credit history, which a first-time borrower doesn’t have yet. 86% of India’s eligible adults can’t get a loan from a bank.",
  },
  {
    icon: "scheme",
    t: "Government schemes help, but can’t reach everyone.",
    s: "Most lend through banks, so a first-time borrower still has to clear the same checks.",
  },
  {
    icon: "money-bag",
    t: "Moneylenders say yes, but charge very high interest.",
    s: "Their interest can reach 120–180% a year, and it eats up the growth the loan was meant to fund.",
  },
  {
    icon: "avatars-group",
    t: "Self-help groups lend only when the group agrees.",
    s: "The members decide who borrows, and only when the group has money to give.",
  },
  {
    icon: "house-avatar",
    t: "Family and friends rarely have enough to spare.",
    s: "49% of rural borrowers turn to moneylenders, family or friends, and it’s seldom enough to grow a business.",
  },
];

/** Where each card crosses (share of the free width) and its tilt as it enters. */
const LANES = [
  { x: 0.1, r: 6 },
  { x: 0.86, r: -5 },
  { x: 0.3, r: 4 },
  { x: 0.7, r: -4 },
  { x: 0.16, r: 5 },
];

// Scroll, in screen heights: the line on its own first, then the cards, overlapping so the next is coming in at the
// bottom as the one before leaves at the top.
const LEAD = 0.6;
const RUN = 1.2;
const STEP = RUN * 0.62;
const SPAN = LEAD + STEP * (OPTIONS.length - 1) + RUN;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function V4ProblemOptions({ video }: { video?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 36, restDelta: 0.0005 });
  // The line fills over the lead, and dims a little once the cards are crossing it.
  const fill = useTransform(scrollYProgress, [0, (LEAD * 0.85) / SPAN], [0, 1], { clamp: true });
  const lineOpacity = useTransform(scrollYProgress, [LEAD / SPAN, (LEAD + 0.4) / SPAN], [1, 0.4], { clamp: true });
  const askOpacity = useTransform(scrollYProgress, [(LEAD * 0.7) / SPAN, LEAD / SPAN], [0, 1], { clamp: true });

  if (reduce) {
    return (
      <section id="c-problem" className="mx-2 overflow-clip rounded-[24px] px-4 py-20 sm:px-6 lg:px-8" style={{ backgroundColor: DARK }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-12">
          <h2 className={`${HEAD} max-w-[1000px] text-center text-[34px] text-white md:text-[56px]`}>{PROBLEM}</h2>
          <ul className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-3">
            {OPTIONS.map((o) => (
              <li key={o.t}>
                <OptionCard o={o} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section id="c-problem" aria-label={PROBLEM} className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: DARK }}>
      <div ref={ref} className="relative" style={{ height: `${(1 + SPAN) * 100}svh` }}>
        <div className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))] overflow-hidden px-4 [--cw:min(78vw,400px)] sm:px-6 md:[--cw:clamp(300px,28vw,440px)] lg:px-8">
          {video && (
            <>
              <video aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" src={video} autoPlay muted loop playsInline preload="auto" />
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-text-grey-100/96" />
            </>
          )}
          <motion.div className="relative flex h-full flex-col items-center justify-center gap-6 text-center" style={{ opacity: lineOpacity }}>
            <h2 aria-hidden className={`${HEAD} max-w-[1120px] text-[34px] leading-[1.15] text-white md:text-[56px] lg:text-[64px]`}>
              {WORDS.map((w, i) => (
                <Word key={i} w={w} p={fill} at={i / WORDS.length} />
              ))}
            </h2>
            <motion.p className="font-display text-[20px] font-bold md:text-[28px]" style={{ opacity: askOpacity, color: LIME }}>
              What are their options?
            </motion.p>
          </motion.div>
          <ul className="pointer-events-none absolute inset-y-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
            {OPTIONS.map((o, i) => (
              <RisingCard key={o.t} o={o} i={i} p={p} start={(LEAD + i * STEP) / SPAN} end={(LEAD + i * STEP + RUN) / SPAN} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** A word of the line, white 24% to white as the fill reaches it. */
function Word({ w, p, at }: { w: string; p: MotionValue<number>; at: number }) {
  const opacity = useTransform(p, [at, at + 0.12], [0.24, 1], { clamp: true });
  return (
    <>
      <motion.span style={{ opacity }}>{w}</motion.span>{" "}
    </>
  );
}

/** One card's run up the screen: from just below it to just above, tilted and a little smaller as it comes in. */
function RisingCard({ o, i, p, start, end }: { o: Option; i: number; p: MotionValue<number>; start: number; end: number }) {
  const lane = LANES[i % LANES.length];
  const t = useTransform(p, (v) => clamp01((v - start) / (end - start)));
  const outer = useTransform(t, (v) => `${(1 - v) * 100}%`);
  const inner = useTransform(t, (v) => `${-v * 100}%`);
  const rotate = useTransform(t, (v) => lane.r * (1 - v));
  const scale = useTransform(t, (v) => 0.88 + 0.12 * Math.min(1, v / 0.5));
  const visibility = useTransform(t, (v) => (v <= 0 || v >= 1 ? "hidden" : "visible"));
  return (
    <motion.li className="absolute inset-0" style={{ y: outer, visibility }}>
      <motion.div className="absolute top-0 w-[var(--cw)]" style={{ left: `calc((100% - var(--cw)) * ${lane.x})`, y: inner, rotate, scale }}>
        <OptionCard o={o} />
      </motion.div>
    </motion.li>
  );
}

/** A government scheme, drawn to sit with the design system's solid nav-navy icons: a document with a round seal. */
function SchemeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} aria-hidden className="block shrink-0">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#00517A" />
      <path d="M15 2v4a1 1 0 0 0 1 1h4" fill="#CBE8F6" />
      <rect x="7" y="8" width="6" height="1.6" rx="0.8" fill="#fff" />
      <rect x="7" y="11.2" width="10" height="1.6" rx="0.8" fill="#fff" />
      <circle cx="14.5" cy="17" r="2.6" fill="#fff" />
      <circle cx="14.5" cy="17" r="1.2" fill="#00517A" />
    </svg>
  );
}

/** An option: its icon, the point in one bold line, then the detail with the number that backs it. */
function OptionCard({ o }: { o: Option }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[24px] bg-white p-6 text-left shadow-6 lg:p-8">
      {o.icon === "scheme" ? <SchemeIcon /> : <Icon name={o.icon} size={40} />}
      <h3 className={`${HEAD} text-[28px] leading-[1.12] text-ink lg:text-[34px]`}>{o.t}</h3>
      <p className={`${SUB} text-ink/64`}>{o.s}</p>
    </div>
  );
}

/** The close: the line, then the Invest button under it (not inside the sentence), leading into the live opportunities. */
const INVEST_URL = "https://rangde.in/invest/individuals";
const ARROW = (
  <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** `bento` (25 Nov 2026): the close and the founders in one grid, instead of Version 1's full founders section before it.
 * Laptops: the closing line and the Invest button in the big tile on the left; on the right, the founders (their two
 * photos and "Ram and Smita left Oxford to build Rang De."), then a field-visit photo and the Saturday call with them.
 * Phones stack the tiles. */
export function V4Close({ after, bento = false }: { after?: ReactNode; bento?: boolean }) {
  const heading = (
    <h2 className="font-display text-[40px] font-bold leading-[1.1] tracking-[-0.02em] md:text-[56px] lg:text-[64px]" aria-label="The businesses are ready. Now you can invest in them.">
      <ScrollInk as="span" tone="grey80" text="The businesses are ready." className="block" />
      <ScrollInk as="span" tone="grey" text="Now you can invest in them." className="block" />
    </h2>
  );
  const invest = (
    <a
      href={INVEST_URL}
      className="inline-flex h-[56px] w-fit items-center gap-2 rounded-[4px] bg-nav-navy px-8 font-display text-[18px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-dark"
    >
      Invest
      {ARROW}
    </a>
  );

  if (bento) {
    return (
      <section id="c-close" className="mx-2 rounded-[24px] px-2 py-2 md:px-3 md:py-3" style={{ backgroundColor: PAPER }}>
        <div className="grid gap-2 md:grid-cols-4 md:grid-rows-[auto_auto] md:gap-3">
          {/* The close. */}
          <div className="flex flex-col justify-between gap-10 rounded-[20px] bg-white p-8 md:col-span-2 md:row-span-2 md:p-12 lg:p-14">
            {heading}
            {invest}
          </div>
          {/* The founders. */}
          <div className="flex flex-col gap-5 rounded-[20px] bg-white p-6 sm:flex-row sm:items-center md:col-span-2 lg:p-8">
            <div className="flex shrink-0 gap-2">
              {[
                { src: "/images/founders/ram-v3.webp", alt: "Ram, co-founder of Rang De" },
                { src: "/images/founders/smita-v3.webp", alt: "Smita, co-founder of Rang De" },
              ].map((f) => (
                <div key={f.src} className="relative h-[132px] w-[104px] overflow-hidden rounded-[14px] bg-ink/8 lg:h-[156px] lg:w-[124px]">
                  <Image src={f.src} alt={f.alt} fill sizes="124px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-display text-h5 font-bold uppercase tracking-[0.08em] text-green-dark">Why Rang De exists</p>
              <p className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-ink lg:text-[26px]">Ram and Smita left Oxford to build Rang De.</p>
              <p className="font-display text-[15px] font-medium leading-[22px] text-ink/64">Since 2008, so where you live or what you earn doesn’t decide your chance to grow.</p>
            </div>
          </div>
          {/* A field visit. */}
          <div className="relative min-h-[200px] overflow-hidden rounded-[20px]">
            <Image src="/images/founders-collage/group-entrepreneurs.webp" alt="Rang De's team with entrepreneurs on a field visit" fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
          </div>
          {/* The Saturday call. */}
          <div className="flex flex-col justify-between gap-5 rounded-[20px] p-6 text-white lg:p-8" style={{ backgroundColor: "#00517A" }}>
            <div className="flex flex-col gap-1">
              <p className="font-display text-[18px] font-bold leading-[1.3]">Talk to Ram and Smita</p>
              <p className="font-display text-[14px] font-medium leading-[20px] text-white/72">Live, every Saturday, 11 am IST</p>
            </div>
            {/* No sign-up link yet, as with the site's other founders' call buttons. */}
            <button type="button" className="inline-flex h-[44px] w-fit items-center rounded-[4px] bg-white px-5 font-display text-[15px] font-bold text-nav-navy transition-[filter] hover:brightness-95">
              Register
            </button>
          </div>
        </div>
        {after}
      </section>
    );
  }

  return (
    <section id="c-close" className="mx-2 flex flex-col items-center gap-8 rounded-[24px] px-4 py-20 text-center md:gap-10 md:py-28" style={{ backgroundColor: PAPER }}>
      {heading}
      {invest}
      {after}
    </section>
  );
}
