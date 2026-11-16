"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { EASE, Label, Rise } from "./WhyRealStory";

/*
 * /v/why, "Why it happens" (16 Nov 2026, after illo's "DoorDash: Design Connects": one thick ribbon of colour bands carries the
 * story, and thin lines with dots connect the ideas to it). Here the ribbon IS the credit loop, in Rang De's colours, and every
 * stage of it is scrubbed by the scroll, not played on a timer:
 *   how credit works   the ribbon draws itself round, band by band: bank loan → repaid → recorded → credit score.
 *   for her, today     the colour drains to grey and the bank-loan band pulls away, so the loop is open at its first step;
 *                      a thin red line runs from the gap out to the moneylender (17.77%), and the recorded/score bands go hollow.
 *   the turn           "Rang De completes the loop", full screen.
 *   with Rang De       a Rang De band slides into the gap and closes it (≤ 8.5%), then the colour flows back round the loop.
 * The figure in the middle of the ring changes with each stage. Reduced motion: three plain lists.
 * Earlier version of this section (coin on a ring): commit 38a3a13.
 */

const S = "/images/story";
const GREEN = "#8CA21E";
const GREEN_DARK = "#3a6e0c";
const YELLOW = "#FFCA3E";
const BLUE = "#0DAADE";
const RED = "#E32642";
const INK = "#292D36";
const PAPER = "#F7F3ED";
const GREY = "#d8d5ce";

/* eslint-disable @next/next/no-img-element -- the story sprites are small, transparent and laid out by hand */
const Sprite = ({ src, className }: { src: string; className?: string }) => (
  <img src={src} alt="" className={`pointer-events-none select-none object-contain ${className ?? ""}`} />
);

const Gauge = ({ filled = false }: { filled?: boolean }) => (
  <span className="relative block h-[40px] w-[64px]">
    <Sprite src={`${S}/gauge__track.webp`} className="absolute inset-x-0 top-0 w-full" />
    {filled && <Sprite src={`${S}/gauge__fill-green.webp`} className="absolute inset-x-0 top-0 w-full" />}
    <Sprite
      src={`${S}/gauge__needle.webp`}
      className={`absolute bottom-[8%] left-1/2 h-[78%] origin-bottom -translate-x-1/2 ${filled ? "rotate-[40deg]" : "-rotate-[80deg]"}`}
    />
  </span>
);

const Bank = ({ badge }: { badge?: "no" | "ok" }) => (
  <span className="relative block">
    <Sprite src={`${S}/bank__building.webp`} className="h-[46px]" />
    {badge && <Sprite src={`${S}/bank__badge-${badge}.webp`} className="absolute -right-3 -top-2 h-[20px]" />}
  </span>
);

const H2 = "font-display text-[32px] font-bold leading-[38px] text-ink [text-wrap:balance] md:text-[48px] md:leading-[56px]";

/* ── The stages, as scroll positions (0–1 across the pinned stage). ──────────────────────────────────────────── */

// Where each text beat starts. The ribbon's own motion is keyed to the same marks.
const MARK = { ideal: 0, broken: 0.2, lender: 0.33, unrecorded: 0.46, turn: 0.57, fund: 0.66, repay: 0.78, done: 0.91 } as const;
type Act = "ideal" | "broken" | "rangde";

type Beat = { at: number; act: Act; title: string; sub: string; rates?: "lender" | "both" };
const BEATS: Beat[] = [
  {
    at: MARK.ideal,
    act: "ideal",
    title: "Credit is built by borrowing.",
    sub: "You take a bank loan and repay it on time. Every repayment goes on your record, your credit score grows, and the bank trusts you with more. Most of us are already in this loop.",
  },
  {
    at: MARK.broken,
    act: "broken",
    title: "Most rural entrepreneurs are never let in.",
    sub: "Banks lend against land or a credit history. She has years of work behind her, but no land in her name and no past loan to show. No first loan means no history, and no history means no first loan.",
  },
  {
    at: MARK.lender,
    act: "broken",
    title: "The only lender left charges about twice as much.",
    sub: "Moneylenders in rural India charge 17.77% a year on average. A large part of what her business earns goes back to him as interest, instead of into the business.",
    rates: "lender",
  },
  {
    at: MARK.unrecorded,
    act: "broken",
    title: "And years of repaying count for nothing.",
    sub: "A moneylender reports to no one. She can repay every rupee on time and still have no credit history, so the next bank gives her the same answer.",
  },
  { at: MARK.turn, act: "rangde", title: "Rang De completes the loop.", sub: "With the first loan she couldn’t get." },
  {
    at: MARK.fund,
    act: "rangde",
    title: "People like you lend her that first loan.",
    sub: "A local partner meets her in person and vets her business. Investors on Rang De fund the loan together, at no more than 8.5% a year.",
    rates: "both",
  },
  {
    at: MARK.repay,
    act: "rangde",
    title: "She repays, and this time it counts.",
    sub: "Month by month, from what the business earns. Every repayment is reported to the credit bureaus, and comes back to you with interest.",
  },
  {
    at: MARK.done,
    act: "rangde",
    title: "Now she has a credit history.",
    sub: "Her score grows with every repayment. The next time she walks into a bank, it has a reason to say yes. The loop is hers.",
  },
];
const TURN = 4;
const STAGE_SVH = 900; // the pinned stage's height
const beatAt = (p: number) => BEATS.reduce((cur, b, i) => (p >= b.at ? i : cur), 0);

/* ── The ribbon. A 120 × 100 box: centre (60, 52), radius 30; four bands, one per quarter, clockwise from the top. ─ */

const CX = 60;
const CY = 52;
const R = 30;
const W = 9; // ribbon width
const polar = (deg: number, r = R) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)] as const;
const arc = (a: number, b: number) => {
  const [x1, y1] = polar(a);
  const [x2, y2] = polar(b);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
};
// Each band runs from one stop to the next. Band 0 (bank loan → repaid) is the one she can't get.
const BANDS = [
  { d: arc(0, 90.6), color: GREEN },
  { d: arc(90, 180.6), color: YELLOW },
  { d: arc(180, 270.6), color: BLUE },
  { d: arc(270, 360.4), color: GREEN_DARK },
];
// The stops, their labels in each act, and where each label sits outside the ring.
const STOPS = [
  { deg: 0, labels: { ideal: "Bank loan", broken: "No bank loan", rangde: "Rang De loan" }, side: "top" },
  { deg: 90, labels: { ideal: "Repaid on time", broken: "Repaid on time", rangde: "Repaid monthly" }, side: "right" },
  { deg: 180, labels: { ideal: "Recorded", broken: "Not recorded", rangde: "Reported" }, side: "bottom" },
  { deg: 270, labels: { ideal: "Credit score grows", broken: "No credit score", rangde: "Credit score grows" }, side: "left" },
] as const;
// The moneylender sits just outside the gap; a thin dashed line runs from the gap out to him.
const LENDER_AT = polar(45, R + 27);
const [bx1, by1] = polar(45, R + 6.5);
const [bx2, by2] = polar(45, R + 18);
const BRANCH = `M ${bx1} ${by1} L ${bx2} ${by2}`;

/** Piecewise-linear ramp, computed in code. */
const ramp = (v: number, at: number[], to: number[]) => {
  if (v <= at[0]) return to[0];
  for (let k = 1; k < at.length; k++) if (v <= at[k]) return to[k - 1] + ((v - at[k - 1]) / (at[k] - at[k - 1])) * (to[k] - to[k - 1]);
  return to[to.length - 1];
};

const pct = (x: number, y: number) => ({ left: `${(x / 120) * 100}%`, top: `${y}%` });

function Band({ i, p }: { i: number; p: MotionValue<number> }) {
  const b = BANDS[i];
  const s = i * 0.035; // the ribbon draws round band by band
  // Band 0 pulls away when the loop breaks; the Rang De band (drawn separately) takes its place.
  const draw = useTransform(p, i === 0 ? [0.01, 0.045, MARK.broken + 0.01, MARK.broken + 0.08] : [0.01 + s, 0.045 + s], i === 0 ? [0, 1, 1, 0] : [0, 1]);
  // The colour drains when it breaks, and flows back band by band once Rang De closes the gap.
  const back = MARK.repay - 0.06 + i * 0.035;
  const color = useTransform(p, [MARK.broken, MARK.broken + 0.07, back, back + 0.04], [b.color, GREY, GREY, b.color]);
  // Recorded and credit score go hollow while nothing is being recorded.
  const hollow = useTransform(p, (v) => ramp(v, [MARK.unrecorded, MARK.unrecorded + 0.05, back, back + 0.04], [0, 1, 1, 0]));
  return (
    <>
      <motion.path d={b.d} fill="none" strokeWidth={W} strokeLinecap="butt" style={{ pathLength: draw, stroke: color }} />
      {(i === 2 || i === 3) && (
        <motion.path d={b.d} fill="none" stroke="#fff" strokeWidth={W - 2.4} strokeLinecap="butt" style={{ opacity: hollow }} />
      )}
    </>
  );
}

function Ribbon({ p, act, beat }: { p: MotionValue<number>; act: Act; beat: number }) {
  // The Rang De band slides into the gap.
  const rangdeDraw = useTransform(p, [MARK.fund - 0.02, MARK.fund + 0.06], [0, 1]);
  // The moneylender's branch draws out, then pulls back at the turn.
  const branch = useTransform(p, [MARK.lender, MARK.lender + 0.06, MARK.turn - 0.02, MARK.turn + 0.03], [0, 1, 1, 0]);
  const branchOn = useTransform(branch, (v) => (v > 0.01 ? 1 : 0));
  const track = useTransform(p, (v) => ramp(v, [0.15, 0.19], [1, 0]));
  const lenderShow = useTransform(p, (v) => ramp(v, [MARK.lender + 0.04, MARK.lender + 0.07, MARK.turn - 0.02, MARK.turn + 0.02], [0, 1, 1, 0]));
  const gapShow = useTransform(p, (v) => ramp(v, [MARK.broken + 0.06, MARK.broken + 0.09, MARK.fund - 0.02, MARK.fund + 0.03], [0, 1, 1, 0]));
  const dim = useTransform(p, (v) => ramp(v, [MARK.turn - 0.01, MARK.turn + 0.02, MARK.fund - 0.03, MARK.fund], [1, 0.1, 0.1, 1]));

  const centre: Record<number, ReactNode> = {
    0: <Centre big="↻" small="and round again" color={INK} />,
    1: <Centre big="✕" small="shut at the first step" color={RED} />,
    2: <Centre big="17.77%" small="a year, on average" color={RED} />,
    3: <Centre big="0" small="repayments on record" color={INK} />,
    5: <Centre big="≤ 8.5%" small="a year, through Rang De" color={GREEN_DARK} />,
    6: <Centre big="✓" small="every repayment, on her record" color={GREEN_DARK} />,
    7: <Centre big="↻" small="and round again, this time for her" color={GREEN_DARK} />,
  };

  return (
    <motion.div className="relative mx-auto aspect-[120/100] w-full max-w-[360px] md:max-w-[660px]" style={{ opacity: dim }}>
      <svg viewBox="0 0 120 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* The track the ribbon runs on: only while it first draws, so the gap reads as a gap once the loop breaks. */}
        <motion.circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(41,45,54,0.08)" strokeWidth={W} style={{ opacity: track }} />
        {BANDS.map((_, i) => (
          <Band key={i} i={i} p={p} />
        ))}
        {/* The Rang De band, closing the gap. */}
        <motion.path d={BANDS[0].d} fill="none" stroke={RED} strokeWidth={W} strokeLinecap="butt" style={{ pathLength: rangdeDraw }} />
        <motion.path d={BANDS[0].d} fill="none" stroke={YELLOW} strokeWidth={W * 0.28} strokeLinecap="butt" style={{ pathLength: rangdeDraw }} />
        {/* The moneylender's branch: a red line off the loop that goes nowhere. */}
        <motion.path d={BRANCH} fill="none" stroke={RED} strokeWidth={0.55} strokeDasharray="1.2 1" style={{ opacity: branchOn }} />
        <motion.circle cx={bx2} cy={by2} r={0.9} fill={RED} style={{ opacity: branchOn }} />
      </svg>

      {/* The gap, marked. */}
      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...pct(...polar(45)), opacity: gapShow }}>
        <span className="grid size-[22px] place-items-center rounded-full bg-white font-display text-[13px] font-extrabold text-[#E32642] shadow-[0_4px_12px_rgba(41,45,54,0.15)] md:size-[34px] md:text-[18px]">
          ✕
        </span>
      </motion.div>

      {/* The stops: a dot on the ribbon, a thin line out, and the label. */}
      {STOPS.map((s, i) => {
        const [x, y] = polar(s.deg);
        const [lx, ly] = polar(s.deg, R + 15);
        const off = act === "broken" && (i === 0 || i >= 2);
        return (
          <div key={s.deg}>
            <svg viewBox="0 0 120 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <line x1={x} y1={y} x2={lx} y2={ly} stroke={INK} strokeWidth="0.35" />
              <circle cx={x} cy={y} r="1.6" fill="#fff" stroke={INK} strokeWidth="0.5" />
              <circle cx={lx} cy={ly} r="0.9" fill={INK} />
            </svg>
            <div
              className={`absolute ${
                s.side === "top"
                  ? "-translate-x-1/2 -translate-y-full pb-1.5"
                  : s.side === "bottom"
                    ? "-translate-x-1/2 pt-1.5"
                    : // Phones: side labels sit above their dot, centred, so they stay on screen.
                      s.side === "right"
                      ? "-translate-x-1/2 -translate-y-full pb-1 text-center md:translate-x-0 md:-translate-y-1/2 md:pb-0 md:pl-2 md:text-left"
                      : "-translate-x-1/2 -translate-y-full pb-1 text-center md:-translate-x-full md:-translate-y-1/2 md:pb-0 md:pr-2 md:text-right"
              }`}
              style={pct(lx, ly)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${act}-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block whitespace-nowrap rounded-full bg-white px-2 py-0.5 font-display text-[10px] font-bold leading-[13px] shadow-[0_2px_8px_rgba(41,45,54,0.08)] md:px-3 md:py-1 md:text-[15px] md:leading-[20px]"
                  style={{ color: off ? RED : INK }}
                >
                  {s.labels[act]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* The moneylender, at the end of the branch. */}
      <motion.div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1" style={{ ...pct(...LENDER_AT), opacity: lenderShow }}>
        <span className="grid size-[40px] place-items-center rounded-full bg-white shadow-[0_0_0_2px_#E32642,0_8px_20px_rgba(41,45,54,0.12)] md:size-[72px]">
          <Sprite src={`${S}/lender__give.webp`} className="h-[28px] md:h-[52px]" />
        </span>
        <span className="whitespace-nowrap rounded-full px-2 py-0.5 font-display text-[10px] font-bold leading-[14px] text-white md:text-[13px] md:leading-[18px]" style={{ backgroundColor: RED }}>
          Moneylender
        </span>
      </motion.div>

      {/* The figure in the middle. */}
      <div className="absolute left-1/2 top-[52%] w-[44%] -translate-x-1/2 -translate-y-1/2 text-center">
        <AnimatePresence mode="wait" initial={false}>
          {beat !== TURN && (
            <motion.div key={beat} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3, ease: EASE }}>
              {centre[beat]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Centre({ big, small, color }: { big: string; small: string; color: string }) {
  return (
    <>
      <p className="font-display text-[26px] font-extrabold leading-[1] tracking-[-0.03em] tabular-nums md:text-[52px]" style={{ color }}>
        {big}
      </p>
      <p className="mt-1 font-display text-[9px] font-bold leading-[12px] text-ink/56 [text-wrap:balance] md:mt-2 md:text-[14px] md:leading-[18px]">{small}</p>
    </>
  );
}

/* ── The rates, beside the beats that mention them. ──────────────────────────────────────────────────────────── */

function Rates({ show }: { show: "lender" | "both" }) {
  const rows = [
    { who: "Moneylender", rate: 17.77, text: "17.77% a year, on average", color: RED },
    ...(show === "both" ? [{ who: "Rang De", rate: 8.5, text: "8.5% a year, at most", color: GREEN }] : []),
  ];
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-2 rounded-[14px] bg-white p-4 text-left shadow-[0_8px_24px_rgba(41,45,54,0.08)]">
      {rows.map((r) => (
        <div key={r.who} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 font-display text-[13px] leading-[18px]">
            <span className="font-bold text-ink">{r.who}</span>
            <span className="font-medium text-ink/64">{r.text}</span>
          </div>
          <div className="h-[10px] overflow-hidden rounded-full bg-bg-grey">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: r.color }}
              initial={{ width: "0%" }}
              animate={{ width: `${(r.rate / 17.77) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            />
          </div>
        </div>
      ))}
      <p className="font-display text-[11px] font-medium leading-[14px] text-ink/48 max-md:hidden">Interest a year. NABARD, July 2026; rangde.in.</p>
    </div>
  );
}

/* ── Reduced motion: the three states as plain lists. ────────────────────────────────────────────────────────── */

type Step = { label: string; art: ReactNode };
const STEPS: Record<Act, Step[]> = {
  ideal: [
    { label: "A bank loan", art: <Bank /> },
    { label: "Repaid on time", art: <Sprite src={`${S}/money__notes.webp`} className="h-[40px]" /> },
    { label: "Recorded", art: <Sprite src={`${S}/gauge__ledger-tick.webp`} className="h-[44px]" /> },
    { label: "Credit score grows", art: <Gauge filled /> },
  ],
  broken: [
    { label: "No bank loan", art: <Bank badge="no" /> },
    { label: "Repaid on time", art: <Sprite src={`${S}/money__notes.webp`} className="h-[40px]" /> },
    { label: "Not recorded", art: <Sprite src={`${S}/gauge__ledger.webp`} className="h-[44px]" /> },
    { label: "No credit score", art: <Gauge /> },
  ],
  rangde: [
    { label: "A Rang De loan", art: <Sprite src={`${S}/investor-office__1.webp`} className="h-[52px]" /> },
    { label: "Repaid monthly", art: <Sprite src={`${S}/money__notes.webp`} className="h-[40px]" /> },
    { label: "Reported", art: <Sprite src={`${S}/gauge__ledger-tick.webp`} className="h-[44px]" /> },
    { label: "Credit score grows", art: <Gauge filled /> },
  ],
};
const TAG: Record<Act, string> = { ideal: "How credit works", broken: "For her, today", rangde: "With Rang De" };

function StaticList({ act, title, lines }: { act: Act; title: string; lines: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="self-start rounded-full px-3 py-1 font-display text-[13px] font-bold text-white" style={{ backgroundColor: act === "rangde" ? GREEN_DARK : INK }}>
        {TAG[act]}
      </p>
      <p className="font-display text-[22px] font-bold leading-[28px] text-ink">{title}</p>
      <ol className="flex flex-col gap-2">
        {STEPS[act].map((s, i) => (
          <li key={s.label} className="flex items-center gap-3 rounded-[14px] bg-white p-3">
            <div className="grid size-[60px] shrink-0 place-items-center rounded-[12px]" style={{ backgroundColor: PAPER }}>
              {s.art}
            </div>
            <p className="font-display text-[15px] leading-[22px] text-ink/72">
              <strong className="font-bold text-ink">{s.label}.</strong> {lines[i]}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── The section. ────────────────────────────────────────────────────────────────────────────────────────────── */

export function WhyLoopStory() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setBeat(beatAt(p)));
  const b = BEATS[beat];
  const bg = useTransform(scrollYProgress, [MARK.broken, MARK.broken + 0.06, MARK.turn, MARK.fund], [PAPER, "#ECEAE4", "#ECEAE4", "#EEF3DA"]);

  if (reduce) {
    return (
      <section id="ch-loop" className="mx-2 rounded-[16px] px-4 py-20 sm:px-8" style={{ backgroundColor: PAPER }}>
        <Rise className="mx-auto flex max-w-[820px] flex-col items-center gap-4 pb-12 text-center">
          <Label className="text-green-dark">Why it happens</Label>
          <h2 className={H2}>Credit is built by borrowing. Most rural entrepreneurs are never let in.</h2>
        </Rise>
        <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-3">
          <StaticList act="ideal" title={BEATS[0].title} lines={["You borrow.", "You repay.", "Each repayment goes on your record.", "And the bank lends again."]} />
          <StaticList
            act="broken"
            title={BEATS[1].title}
            lines={["A bank wants land or a credit history first.", "She repays a moneylender instead, at about twice the interest.", "No credit bureau hears of it.", "So the bank’s answer stays the same."]}
          />
          <StaticList act="rangde" title={BEATS[TURN].title} lines={["Funded by people across India, at no more than 8.5% a year.", "From what the business earns.", "Every repayment goes to the credit bureaus.", "Now banks can lend to her too."]} />
        </div>
      </section>
    );
  }

  return (
    <section id="ch-loop" className="mx-2 overflow-clip rounded-[16px]">
      <motion.div ref={stage} className="relative" style={{ height: `${STAGE_SVH}svh`, backgroundColor: bg }}>
        {/* Where the second half ("Why Rang De" in the chapter pill) begins: placed so it crosses the pill's line (40% down the
            screen) exactly as the scroll reaches the turn. Jumping to it lands just after the turn. */}
        <div
          id="ch-rangde"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px scroll-mt-[var(--navbar-bottom,0px)]"
          style={{ top: `${MARK.turn * (STAGE_SVH - 100) + 40}svh` }}
        />
        <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col overflow-hidden px-4 sm:px-8">
          {/* Which state the loop is in. The chapter pill above names the section. */}
          <div className="flex items-center justify-center gap-4 pt-[68px] md:justify-end md:pt-8">
            <motion.p
              key={b.act}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full px-4 py-1.5 font-display text-[13px] font-bold leading-[18px] text-white md:text-[14px]"
              style={{ backgroundColor: b.act === "rangde" ? GREEN_DARK : INK }}
            >
              {TAG[b.act]}
            </motion.p>
          </div>

          <div className="relative mx-auto grid w-full max-w-[1280px] flex-1 content-center items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
            <div className="px-6 md:px-10">
              <Ribbon p={scrollYProgress} act={b.act} beat={beat} />
            </div>
            <div className="flex min-h-[240px] flex-col items-center text-center md:min-h-[380px] md:items-start md:justify-center md:text-left">
              <AnimatePresence mode="wait">
                {beat !== TURN && (
                  <motion.div
                    key={beat}
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center gap-4 md:items-start"
                  >
                    <p
                      className="font-display text-[28px] font-extrabold leading-[1.04] tracking-[-0.03em] [text-wrap:balance] md:text-[52px] lg:text-[60px]"
                      style={{ color: beat === BEATS.length - 1 ? GREEN_DARK : INK }}
                    >
                      {b.title}
                    </p>
                    <p className="max-w-[500px] font-display text-[15px] font-medium leading-[22px] text-ink/72 [text-wrap:pretty] md:text-[19px] md:leading-[29px]">{b.sub}</p>
                    {b.rates && <Rates show={b.rates} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The turn: one line, full screen, word by word. */}
            <AnimatePresence>
              {beat === TURN && (
                <motion.div key="turn" className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                  <p className="max-w-[1000px] font-display text-[48px] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink [text-wrap:balance] md:text-[104px] lg:text-[124px]">
                    {b.title.split(" ").map((w, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE }}
                        style={{ color: w === "completes" ? GREEN_DARK : undefined }}
                      >
                        {w}&nbsp;
                      </motion.span>
                    ))}
                  </p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 font-display text-[18px] font-bold leading-[26px] text-ink/64 md:text-[22px]">
                    {b.sub}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Where you are. */}
          <div className="flex items-center justify-center gap-1.5 pb-24 md:pb-8" aria-hidden>
            {BEATS.map((x, i) => (
              <span
                key={i}
                className={`h-[6px] rounded-full transition-all duration-300 ${i === 1 || i === TURN ? "ml-2" : ""} ${i === beat ? "w-[28px]" : "w-[6px]"}`}
                style={{ backgroundColor: i <= beat ? (x.act === "rangde" ? GREEN : INK) : "rgba(41,45,54,0.16)" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── The same story as stairs, not a ring (/v/why-steps, 17 Nov 2026, after realfood.gov's solid stat blocks). ──────────
 * Four solid blocks rise like a staircase: bank loan → repaid → recorded → credit score, and an arrow curves from the top
 * step back to the first, so the loop is there without drawing a circle. For her, the first step drops out and the rest
 * drain to grey outlines she can't reach; a red moneylender block pushes in beside the stairs and leads nowhere. Then a
 * Rang De block drops into the gap, colour runs up the stairs, and the arrow back to the start draws in green.
 * Same beats, copy and scroll marks as the ring version above. */

const STEP_COLORS = [GREEN, YELLOW, BLUE, GREEN_DARK];
const STEP_H = [0.3, 0.48, 0.66, 0.84]; // each step's height, as a share of the stairs area

/** Mix two #rrggbb colours, t from 0 (a) to 1 (b). */
const mix = (a: string, b: string, t: number) => {
  const n = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const [x, y] = [n(a), n(b)];
  return `rgb(${x.map((v, k) => Math.round(v + (y[k] - v) * t)).join(",")})`;
};

function Step({ i, p, act }: { i: number; p: MotionValue<number>; act: Act }) {
  // Rises in turn at the start. The first step drops out when the loop breaks (the Rang De block takes its place).
  const height = useTransform(p, (v) => {
    const rise = ramp(v, [0.01 + i * 0.03, 0.05 + i * 0.03], [0, 1]);
    const drop = i === 0 ? ramp(v, [MARK.broken + 0.01, MARK.broken + 0.07], [1, 0]) : 1;
    return `${rise * drop * STEP_H[i] * 100}%`;
  });
  // The colour drains to an outline when the loop breaks, and runs back up the stairs once Rang De closes the gap.
  const back = MARK.repay - 0.05 + i * 0.03;
  const t = useTransform(p, (v) => ramp(v, [MARK.broken, MARK.broken + 0.07, back, back + 0.04], [0, 1, 1, 0]));
  const bg = useTransform(t, (k) => mix(STEP_COLORS[i], "#ECEAE4", k));
  const border = useTransform(t, (k) => `2px dashed rgba(41,45,54,${0.28 * k})`);
  const fg = useTransform(t, (k) => (k > 0.5 ? "rgba(41,45,54,0.5)" : i === 1 ? INK : "#fff"));
  const label = STOPS[i].labels[act];
  // A step with no height still draws its border; hide it outright once it has dropped out.
  const shown = useTransform(p, (v) => (i === 0 && v > MARK.broken + 0.065 ? 0 : 1));
  return (
    <motion.div className="relative overflow-hidden rounded-t-[14px] md:rounded-t-[18px]" style={{ height, backgroundColor: bg, border, color: fg, opacity: shown }}>
      <div className="flex flex-col px-3 pt-3 md:px-6 md:pt-5">
        <span className="font-display text-[34px] font-extrabold leading-[0.9] tracking-[-0.05em] md:text-[96px]">0{i + 1}</span>
        <span className="mt-1 font-display text-[11px] font-bold leading-[14px] md:mt-2 md:text-[20px] md:leading-[26px]">{label}</span>
      </div>
    </motion.div>
  );
}

export function WhyStairs() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  useMotionValueEvent(p, "change", (v) => setBeat(beatAt(v)));
  const b = BEATS[beat];
  const bg = useTransform(p, (v) => (v < MARK.broken ? PAPER : v < MARK.fund - 0.02 ? "#ECEAE4" : "#EEF3DA"));

  // The gap: a dashed outline where the first step was.
  const gapShow = useTransform(p, (v) => ramp(v, [MARK.broken + 0.05, MARK.broken + 0.08, MARK.fund - 0.02, MARK.fund + 0.02], [0, 1, 1, 0]));
  // The moneylender's block pushes in beside the stairs, then leaves at the turn.
  const lenderGrow = useTransform(p, (v) => ramp(v, [MARK.lender, MARK.lender + 0.05, MARK.turn - 0.02, MARK.turn + 0.02], [0, 1, 1, 0]));
  const lenderFlex = useTransform(lenderGrow, (k) => k * 0.9);
  const lenderH = useTransform(lenderGrow, (k) => `${k * 42}%`);
  // The Rang De block drops into the gap from above.
  const rdY = useTransform(p, (v) => `${ramp(v, [MARK.fund - 0.02, MARK.fund + 0.05], [-140, 0])}%`);
  const rdShow = useTransform(p, (v) => (v > MARK.fund - 0.02 ? 1 : 0));
  // The arrow back to the start: drawn at the start (grey), gone while the loop is broken, drawn again in green at the end.
  const arrowFirst = useTransform(p, (v) => ramp(v, [0.12, 0.17, MARK.broken, MARK.broken + 0.04], [0, 1, 1, 0]));
  const arrowLast = useTransform(p, (v) => ramp(v, [MARK.done - 0.02, MARK.done + 0.04], [0, 1]));
  // Drawn from the top step towards the first: revealed from the right.
  const clipFirst = useTransform(arrowFirst, (k) => `inset(-20% 0 0 ${(1 - k) * 100}%)`);
  const clipLast = useTransform(arrowLast, (k) => `inset(-20% 0 0 ${(1 - k) * 100}%)`);
  const headFirst = useTransform(arrowFirst, (k) => (k > 0.95 ? 1 : 0));
  const headLast = useTransform(arrowLast, (k) => (k > 0.95 ? 1 : 0));
  const dim = useTransform(p, (v) => ramp(v, [MARK.turn - 0.01, MARK.turn + 0.02, MARK.fund - 0.03, MARK.fund], [1, 0.08, 0.08, 1]));

  if (reduce) return <WhyLoopStory />;

  const ARROW = "M 87.5 14 C 87.5 -6, 12.5 -6, 12.5 62";
  return (
    <section id="ch-loop" className="mx-2 overflow-clip rounded-[16px]">
      <motion.div ref={stage} className="relative" style={{ height: `${STAGE_SVH}svh`, backgroundColor: bg }}>
        <div
          id="ch-rangde"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px scroll-mt-[var(--navbar-bottom,0px)]"
          style={{ top: `${MARK.turn * (STAGE_SVH - 100) + 40}svh` }}
        />
        <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col overflow-hidden">
          {/* The words: top left, above the low first steps. */}
          <div className="relative z-10 flex min-h-[46%] flex-col px-4 pt-[68px] sm:px-8 md:min-h-0 md:max-w-[52%] md:px-12 md:pt-24">
            <motion.p
              key={b.act}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 self-start rounded-full px-4 py-1.5 font-display text-[13px] font-bold leading-[18px] text-white md:text-[14px]"
              style={{ backgroundColor: b.act === "rangde" ? GREEN_DARK : INK }}
            >
              {TAG[b.act]}
            </motion.p>
            <AnimatePresence mode="wait">
              {beat !== TURN && (
                <motion.div
                  key={beat}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-3 md:gap-4"
                >
                  <p
                    className="font-display text-[28px] font-extrabold leading-[1.02] tracking-[-0.035em] [text-wrap:balance] md:text-[52px] lg:text-[64px]"
                    style={{ color: beat === BEATS.length - 1 ? GREEN_DARK : INK }}
                  >
                    {b.title}
                  </p>
                  <p className="max-w-[540px] font-display text-[14px] font-medium leading-[21px] text-ink/72 md:text-[18px] md:leading-[28px]">{b.sub}</p>
                  {b.rates && <div className="max-md:hidden"><Rates show={b.rates} /></div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The stairs, on the stage's bottom edge. */}
          <motion.div className="relative mb-[84px] mt-auto h-[36%] px-2 md:mb-0 md:h-[62%] md:px-8" style={{ opacity: dim }}>
            <div className="relative flex h-full items-end gap-1.5 md:gap-3 [&>*:first-child]:-mr-1.5 md:[&>*:first-child]:-mr-3">
              {/* The moneylender's block: beside the stairs, going nowhere. */}
              <motion.div className="flex h-full min-w-0 flex-col justify-end overflow-hidden" style={{ flexGrow: lenderFlex, flexBasis: 0, opacity: lenderGrow }}>
                <motion.div
                  className="flex flex-col justify-between overflow-hidden rounded-t-[14px] px-3 pb-3 pt-3 text-white md:rounded-t-[18px] md:px-5 md:pb-5 md:pt-5"
                  style={{ height: lenderH, backgroundColor: RED }}
                >
                  <span className="whitespace-nowrap font-display text-[17px] font-extrabold leading-[0.9] tracking-[-0.04em] md:text-[72px]">17.77%</span>
                  <span className="font-display text-[10px] font-bold leading-[13px] md:text-[17px] md:leading-[22px]">
                    Moneylender
                    <span className="block font-medium opacity-80 max-md:hidden">a year, on average. Reports to no one.</span>
                  </span>
                </motion.div>
              </motion.div>

              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative flex h-full min-w-0 flex-1 flex-col justify-end" style={{ flexBasis: 0 }}>
                  {i === 0 && (
                    <>
                      {/* The gap she can't step into. */}
                      <motion.div
                        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[14px] border-2 border-dashed border-[#E32642]/60 px-3 pt-3 md:rounded-t-[18px] md:px-6 md:pt-5"
                        style={{ height: `${STEP_H[0] * 100}%`, opacity: gapShow }}
                      >
                        <span className="font-display text-[34px] font-extrabold leading-[0.9] tracking-[-0.05em] text-[#E32642]/70 md:text-[96px]">✕</span>
                        <span className="mt-1 font-display text-[11px] font-bold leading-[14px] text-[#E32642] md:mt-2 md:text-[20px] md:leading-[26px]">No bank loan</span>
                      </motion.div>
                      {/* Rang De's block, dropping into the gap. */}
                      <motion.div
                        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[14px] px-3 pt-3 text-white md:rounded-t-[18px] md:px-6 md:pt-5"
                        style={{ height: `${STEP_H[0] * 100}%`, y: rdY, opacity: rdShow, backgroundColor: RED, backgroundImage: `linear-gradient(90deg, transparent 0 82%, ${YELLOW} 82% 92%, transparent 92%)` }}
                      >
                        <span className="whitespace-nowrap font-display text-[17px] font-extrabold leading-[0.9] tracking-[-0.04em] md:text-[72px]">≤ 8.5%</span>
                        <span className="mt-1 font-display text-[11px] font-bold leading-[14px] md:mt-2 md:text-[20px] md:leading-[26px]">Rang De loan</span>
                      </motion.div>
                    </>
                  )}
                  <Step i={i} p={p} act={b.act} />
                </div>
              ))}
            </div>

            {/* The arrow from the top step back to the first: the loop, without a ring. */}
            <div className="pointer-events-none absolute left-2 top-0 h-full w-[calc(100%-16px)] md:left-8 md:w-[calc(100%-64px)]" aria-hidden>
              <motion.svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" style={{ clipPath: clipFirst, opacity: arrowFirst }}>
                <path d={ARROW} fill="none" stroke="rgba(41,45,54,0.4)" strokeWidth="2" strokeDasharray="7 7" vectorEffect="non-scaling-stroke" />
              </motion.svg>
              <motion.svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" style={{ clipPath: clipLast }}>
                <path d={ARROW} fill="none" stroke={GREEN_DARK} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </motion.svg>
              {/* The arrowheads, pointing down onto the first step. */}
              <motion.span className="absolute left-[12.5%] top-[62%] -translate-x-1/2 -translate-y-1/2 text-[18px] leading-none text-ink/40 md:text-[28px]" style={{ opacity: headFirst }}>
                ▼
              </motion.span>
              <motion.span className="absolute left-[12.5%] top-[62%] -translate-x-1/2 -translate-y-1/2 text-[18px] leading-none md:text-[28px]" style={{ opacity: headLast, color: GREEN_DARK }}>
                ▼
              </motion.span>
            </div>
          </motion.div>

          {/* The turn: one line, full screen, word by word. */}
          <AnimatePresence>
            {beat === TURN && (
              <motion.div key="turn" className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                <p className="max-w-[1000px] font-display text-[48px] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink [text-wrap:balance] md:text-[104px] lg:text-[124px]">
                  {b.title.split(" ").map((w, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE }}
                      style={{ color: w === "completes" ? GREEN_DARK : undefined }}
                    >
                      {w}&nbsp;
                    </motion.span>
                  ))}
                </p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 font-display text-[18px] font-bold leading-[26px] text-ink/64 md:text-[22px]">
                  {b.sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
