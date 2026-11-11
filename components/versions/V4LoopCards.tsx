"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RangDeStats } from "@/lib/stats";

/*
 * Version 2 C's "Why it matters": the loop, laid out like the 3 × 3 card grid the team shared (review, 11 Nov 2026):
 * a white panel on a soft grey frame; the four stages as white cards in the corners (an icon chip, a two-line bold claim,
 * a short grey line); soft gradient tiles between them that carry the flow round, each with a small arrow; and in the
 * middle, a ringed circle with a green ₹ for your social investment. Clockwise: Business → Repayment → Credit history →
 * Opportunities → back into Business.
 *
 * Laptops and tablets: the section pins and plays as you scroll: the ₹ lights up, then each card in turn, the tile after
 * it filling green in the direction of travel, until the last tile closes back into Business ("And round again").
 * Phones: the cards stacked in the same style, joined down their left, with the way back drawn up their right.
 * Copy in Version 1's voice, with the live figures. With reduced motion everything is shown lit.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";
const GREEN_DARK = "#3A6E0C";
const GREY = "#d6d7da";
const ICONS = "/images/why-rangde-v2";

type Card = { label: string; title: string; line: string; icon: string };
const cardsFor = (stats: RangDeStats): Card[] => [
  { label: "Business", title: `${stats.entrepreneurs.toLocaleString("en-IN")} businesses funded`, line: "Stock for a shop, tools for a workshop, livestock for a farm.", icon: `${ICONS}/icon-bank.webp` },
  { label: "Repayment", title: "Interest stays fair", line: `Up to 8.5% a year, no hidden charges. ${stats.principalRepaidPct.toFixed(1)}% of principal repaid.`, icon: `${ICONS}/icon-hand-check.webp` },
  { label: "Credit history", title: "Repaying builds credit", line: "Every repayment is reported to the credit bureaus, so a credit history starts.", icon: `${ICONS}/icon-bar-chart.webp` },
  { label: "Opportunities", title: "The next loan doesn’t start from zero", line: "A credit record opens the door to more capital, back into the business.", icon: `${ICONS}/icon-target-center.webp` },
];

// Through the pinned scroll: 0 the ₹ · 1–4 the cards (each with the tile after it filling) · 5 the loop closed.
const STAGES = 6;

const PHONE = "(max-width: 767px)";

const heading = (
  <div className="flex flex-col items-center gap-4 px-4 text-center">
    <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-text-grey-80">Why it matters</p>
    <h2 className="max-w-[900px] font-display text-h3 font-bold [text-wrap:balance]">
      <span className="text-text-grey-100">You’re not just giving someone a loan. </span>
      <span className="text-green-dark">You’re helping them build their financial future.</span>
    </h2>
  </div>
);

export function V4LoopCards({ stats }: { stats: RangDeStats }) {
  const reduce = useReducedMotion();
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(PHONE);
    const on = () => setPhone(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  const cards = cardsFor(stats);
  return phone ? <PhoneLoop cards={cards} reduce={!!reduce} /> : <GridLoop cards={cards} reduce={!!reduce} />;
}

/* ───────────── Laptops and tablets: the 3 × 3 grid ───────────── */

// From the reference: a lime accent for the arc and the lit icon chips (a brighter tint of Rang De's green).
const LIME = "#c6e87a";
const LIME_DEEP = "#9fd04a";
// Where each card's corner is from the middle, in degrees clockwise from 12 o'clock, counted on round so the arc only ever
// turns clockwise: Business top left (315 = -45), Repayment top right, Credit history bottom right, Opportunities bottom left.
const CORNER = [-45, 45, 135, 225];

function GridLoop({ cards, reduce }: { cards: Card[]; reduce: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(reduce ? STAGES - 1 : 0);
  const [within, setWithin] = useState(reduce ? 1 : 0);
  const [hover, setHover] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const s = Math.min(STAGES - 1e-6, Math.max(0, (v - 0.04) / 0.9) * STAGES);
    setStage(Math.floor(s));
    setWithin(s - Math.floor(s));
  });

  // The card in focus: the hovered one (as in the reference), else the one the scroll has reached.
  const scrolled = reduce ? null : stage >= 1 && stage <= 4 ? stage - 1 : null;
  const focus = hover ?? scrolled;
  // The tile after card k washes green while card k is current, and stays washed.
  const fill = (k: number) => (reduce ? 1 : stage > k + 1 ? 1 : stage === k + 1 ? Math.min(1, within / 0.75) : 0);
  const closed = reduce || stage >= STAGES - 1;
  // The arc's angle: always forward, one quarter per card, and on round to Business again once the loop has closed.
  const arcAngle = focus !== null ? CORNER[focus] : closed ? 315 : -45;

  const card = (i: number) => (
    <GridCard card={cards[i]} focus={focus === i} onEnter={() => setHover(i)} onLeave={() => setHover(null)} />
  );

  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 rounded-[16px] bg-white">
      <div ref={wrapRef} className="relative" style={{ height: reduce ? "auto" : "calc(3.6 * (100svh - var(--navbar-bottom, 0px)))" }}>
        <div
          className={`${reduce ? "py-20" : "sticky overflow-hidden"} flex flex-col items-center justify-center gap-6 px-8 lg:gap-8`}
          style={reduce ? undefined : { top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
        >
          {heading}

          {/* The frame: a soft grey border round a white panel, as in the reference. */}
          <div className="w-full max-w-[760px] rounded-[30px] bg-[#eef0f3] p-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
            <div className="grid grid-cols-[minmax(0,1fr)_116px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_116px_minmax(0,1fr)] gap-2 rounded-[24px] bg-white p-5 lg:p-6">
              {card(0)}
              <FlowTile dir="right" fill={fill(0)} />
              {card(1)}

              <FlowTile dir="up" fill={fill(3)} />
              {/* Once the loop has closed, the arc comes to rest back on Business: round again. */}
              <Hub angle={arcAngle} active={focus !== null || closed} reduce={reduce} />
              <FlowTile dir="down" fill={fill(1)} />

              {card(3)}
              <FlowTile dir="left" fill={fill(2)} />
              {card(2)}
            </div>
          </div>

          <motion.p
            initial={false}
            animate={{ opacity: closed ? 1 : 0, y: closed ? 0 : 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-center font-display text-p1 font-bold text-text-grey-100 md:text-[20px] md:leading-[30px]"
          >
            And round again. <span className="text-green-dark">Today’s loan helps make tomorrow’s credit possible.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}

type Dir = "right" | "down" | "left" | "up";

/** A tile between two cards: a soft grey gradient (as in the reference: no arrows, the arc in the middle shows the way
 * round), washing faintly green in the direction of travel once the loop has passed through it. */
function FlowTile({ dir, fill }: { dir: Dir; fill: number }) {
  const horizontal = dir === "right" || dir === "left";
  const origin = dir === "right" ? "left" : dir === "left" ? "right" : dir === "down" ? "top" : "bottom";
  const fade = dir === "right" ? "to right" : dir === "left" ? "to left" : dir === "down" ? "to bottom" : "to top";
  return (
    <div aria-hidden className="relative overflow-hidden rounded-[18px]" style={{ background: `linear-gradient(${fade}, #f7f8fa, #fdfdfe)` }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${fade}, rgba(198,232,122,0.10), rgba(198,232,122,0.38))`,
          transform: horizontal ? `scaleX(${fill})` : `scaleY(${fill})`,
          transformOrigin: origin,
        }}
      />
    </div>
  );
}

/** The middle: your social investment. A ring round a ₹ disc; the disc is lime while nothing is in focus, and when a card
 * is, the disc goes quiet and a thick lime arc on the ring swings round (always clockwise) to point at it. */
function Hub({ angle, active, reduce }: { angle: number; active: boolean; reduce: boolean }) {
  const R = 46; // the ring's radius, in a 120 × 120 box
  const C = 2 * Math.PI * R;
  const ARC = 0.2; // the arc's length, as a share of the ring
  return (
    <div className="relative flex items-center justify-center rounded-[18px] border border-[#eef0f3] bg-white">
      <svg aria-hidden viewBox="0 0 120 120" className="absolute size-[104px]">
        <defs>
          <linearGradient id="hub-arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={LIME} stopOpacity="0.15" />
            <stop offset="1" stopColor={LIME_DEEP} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#eceef1" strokeWidth="1" />
        <circle cx="60" cy="60" r={R - 14} fill="none" stroke="#f1f2f4" strokeWidth="1" />
        {/* The arc: centred on 12 o'clock, then turned to the card. */}
        <motion.g style={{ originX: "60px", originY: "60px" }} initial={false} animate={{ rotate: angle, opacity: active ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}>
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="url(#hub-arc)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${C * ARC} ${C}`}
            transform={`rotate(${-90 - ARC * 180} 60 60)`}
          />
        </motion.g>
      </svg>
      <span
        className="relative flex size-[46px] items-center justify-center rounded-full font-display text-[19px] font-bold transition-[background-color,color,box-shadow] duration-500"
        style={
          active
            ? { backgroundColor: "#f4f5f7", color: "#5c6170", boxShadow: "0 0 0 1px #e6e8ec" }
            : { backgroundColor: LIME, color: GREEN_DARK, boxShadow: `0 0 0 6px rgba(198,232,122,0.35)` }
        }
      >
        ₹
      </span>
    </div>
  );
}

/** A stage in a corner, as in the reference: an icon chip, a two-line claim, a short grey line. The card in focus (hovered,
 * or reached by the scroll) gets a lime icon chip, darker text and a soft lift. */
function GridCard({ card, focus, onEnter, onLeave }: { card: Card; focus: boolean; onEnter: () => void; onLeave: () => void }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`flex min-h-[172px] flex-col gap-3 rounded-[18px] border bg-white p-5 transition-[border-color,box-shadow] duration-500 lg:p-6 ${
        focus ? "border-[#e2e8d6] shadow-[0_12px_32px_rgba(41,45,54,0.08)]" : "border-[#eef0f3]"
      }`}
    >
      <span className="flex size-[38px] items-center justify-center rounded-[11px] transition-colors duration-500" style={{ backgroundColor: focus ? LIME : "#f4f5f7" }}>
        <span
          aria-hidden
          className="block size-[19px] transition-colors duration-500"
          style={{ backgroundColor: focus ? GREEN_DARK : "#6b7080", WebkitMask: `url(${card.icon}) center / contain no-repeat`, mask: `url(${card.icon}) center / contain no-repeat` }}
        />
      </span>
      <div className="mt-auto flex flex-col gap-1.5">
        <p className={`font-display text-[17px] font-semibold leading-[22px] tracking-[-0.2px] transition-colors duration-500 [text-wrap:balance] ${focus ? "text-text-grey-100" : "text-text-grey-80"}`}>{card.title}</p>
        <p className="font-display text-[13px] font-medium leading-[19px] text-text-grey-48">{card.line}</p>
      </div>
    </div>
  );
}

/** Phones: the same card, as a list item (step number with the name). */
function LoopCard({ card, step, lit }: { card: Card; step: number; lit: boolean; current?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 rounded-[16px] border bg-white p-5 transition-[border-color,opacity] duration-500 ${lit ? "border-[#cfe3bd]" : "border-[#eceef1]"}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-[40px] items-center justify-center rounded-[12px]" style={{ backgroundColor: lit ? "#eef6e6" : "#f4f5f7" }}>
          <span aria-hidden className="block size-[20px]" style={{ backgroundColor: lit ? GREEN_DARK : "#9a9ea6", WebkitMask: `url(${card.icon}) center / contain no-repeat`, mask: `url(${card.icon}) center / contain no-repeat` }} />
        </span>
        <p className={`font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] ${lit ? "text-green-dark" : "text-text-grey-48"}`}>
          {step} · {card.label}
        </p>
      </div>
      <p className="font-display text-[20px] font-bold leading-[26px] text-text-grey-100 [text-wrap:balance]">{card.title}</p>
      <p className="font-display text-[15px] font-medium leading-[22px] text-text-grey-64">{card.line}</p>
    </div>
  );
}

/* ───────────── Phones: the cards stacked, with the way back up the side ───────────── */

function PhoneLoop({ cards, reduce }: { cards: Card[]; reduce: boolean }) {
  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 flex flex-col items-center gap-8 rounded-[16px] bg-white px-6 py-12">
      {heading}
      <div className="flex w-full flex-col items-center">
        <div className="flex items-center gap-2 rounded-full border-[1.5px] border-green-dark px-4 py-2">
          <span className="flex size-[24px] items-center justify-center rounded-full font-display text-[13px] font-bold text-white" style={{ backgroundColor: GREEN_DARK }}>
            ₹
          </span>
          <span className="font-display text-[15px] font-bold text-text-grey-100">Your social investment</span>
        </div>
        <span aria-hidden className="h-6 w-[2px]" style={{ backgroundColor: GREEN }} />

        <div className="relative w-full pr-7">
          {/* The way back: from the last card up the right side, into the first. */}
          <ReturnLine reduce={reduce} />
          <ol className="flex flex-col gap-4">
            {cards.map((c, i) => (
              <PhoneCard key={c.label} card={c} step={i + 1} reduce={reduce} last={i === cards.length - 1} />
            ))}
          </ol>
        </div>
        <p className="mt-8 text-center font-display text-[17px] font-bold leading-[24px] text-text-grey-100">
          And round again. <span className="text-green-dark">Today’s loan helps make tomorrow’s credit possible.</span>
        </p>
      </div>
    </section>
  );
}

function PhoneCard({ card, step, reduce, last }: { card: Card; step: number; reduce: boolean; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { amount: 0.6, once: true });
  const lit = reduce || seen;
  return (
    <li ref={ref} className="relative">
      {!last && <span aria-hidden className="absolute -bottom-4 left-7 h-4 w-[2px] transition-colors duration-500" style={{ backgroundColor: lit ? GREEN : GREY }} />}
      <motion.div initial={false} animate={{ opacity: lit ? 1 : 0.5 }} transition={{ duration: 0.4, ease: EASE }}>
        <LoopCard card={card} step={step} lit={lit} current={false} />
      </motion.div>
    </li>
  );
}

/** The way back on phones: a line out of the bottom card, up the cards' right side and back into the top one, drawing
 * itself in once the last card is in view, with an arrow into the first. */
function ReturnLine({ reduce }: { reduce: boolean }): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.9, once: true });
  const on = reduce || seen;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute bottom-12 right-0 top-12 w-7">
      {/* Out of the last card, up the side, and back into the first: three plain lines, drawn in that order. */}
      <motion.span className="absolute bottom-0 left-0 h-[2.5px] w-[18px] origin-left rounded-full" style={{ backgroundColor: GREEN }} initial={false} animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: 0.25, ease: EASE }} />
      <motion.span className="absolute bottom-0 left-[16px] top-0 w-[2.5px] origin-bottom rounded-full" style={{ backgroundColor: GREEN }} initial={false} animate={{ scaleY: on ? 1 : 0 }} transition={{ duration: 0.8, delay: on ? 0.25 : 0, ease: EASE }} />
      <motion.span className="absolute left-0 top-0 h-[2.5px] w-[18px] origin-right rounded-full" style={{ backgroundColor: GREEN }} initial={false} animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: 0.25, delay: on ? 1.05 : 0, ease: EASE }} />
      <motion.svg className="absolute -left-[3px] -top-[6px]" width="12" height="14" viewBox="0 0 12 14" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ delay: on ? 1.25 : 0, duration: 0.2 }}>
        <path d="M 10 1.5 L 2 7 L 10 12.5" fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
}
