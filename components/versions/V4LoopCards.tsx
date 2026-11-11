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

type Dir = "right" | "down" | "left" | "up";

function GridLoop({ cards, reduce }: { cards: Card[]; reduce: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(reduce ? STAGES - 1 : 0);
  const [within, setWithin] = useState(reduce ? 1 : 0);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const s = Math.min(STAGES - 1e-6, Math.max(0, (v - 0.04) / 0.9) * STAGES);
    setStage(Math.floor(s));
    setWithin(s - Math.floor(s));
  });

  const lit = (i: number) => reduce || stage >= i + 1;
  const current = (i: number) => !reduce && stage === i + 1;
  // Tile k (after card k) fills while card k is current, and stays full.
  const fill = (k: number) => (reduce ? 1 : stage > k + 1 ? 1 : stage === k + 1 ? Math.min(1, within / 0.75) : 0);
  const closed = reduce || stage >= STAGES - 1;

  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 rounded-[16px] bg-white">
      <div ref={wrapRef} className="relative" style={{ height: reduce ? "auto" : "calc(3.6 * (100svh - var(--navbar-bottom, 0px)))" }}>
        <div
          className={`${reduce ? "py-20" : "sticky overflow-hidden"} flex flex-col items-center justify-center gap-6 px-8 lg:gap-8`}
          style={reduce ? undefined : { top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
        >
          {heading}

          {/* The frame: a soft grey border round a white panel. */}
          <div className="w-full max-w-[880px] rounded-[28px] bg-[#eef0f3] p-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] grid-rows-[auto_92px_auto] gap-2.5 rounded-[22px] bg-white p-5 lg:grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] lg:grid-rows-[auto_100px_auto] lg:p-6">
              <GridCard card={cards[0]} lit={lit(0)} current={current(0)} />
              <FlowTile dir="right" fill={fill(0)} />
              <GridCard card={cards[1]} lit={lit(1)} current={current(1)} />

              <FlowTile dir="up" fill={fill(3)} />
              <Hub on={reduce || stage >= 0} pulse={!reduce && stage === 0} />
              <FlowTile dir="down" fill={fill(1)} />

              <GridCard card={cards[3]} lit={lit(3)} current={current(3)} />
              <FlowTile dir="left" fill={fill(2)} />
              <GridCard card={cards[2]} lit={lit(2)} current={current(2)} />
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

/** A tile between two cards: a soft grey gradient that fills green in the direction of travel, with a small arrow. */
function FlowTile({ dir, fill }: { dir: Dir; fill: number }) {
  const horizontal = dir === "right" || dir === "left";
  const origin = dir === "right" ? "left" : dir === "left" ? "right" : dir === "down" ? "top" : "bottom";
  const fade = dir === "right" ? "to right" : dir === "left" ? "to left" : dir === "down" ? "to bottom" : "to top";
  const rotate = dir === "right" ? 0 : dir === "down" ? 90 : dir === "left" ? 180 : 270;
  const on = fill > 0.98;
  return (
    <div aria-hidden className="relative overflow-hidden rounded-[16px]" style={{ background: `linear-gradient(${fade}, #f6f7f9, #fbfbfc)` }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${fade}, rgba(98,175,29,0.06), rgba(98,175,29,0.22))`,
          transform: horizontal ? `scaleX(${fill})` : `scaleY(${fill})`,
          transformOrigin: origin,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: `rotate(${rotate}deg)` }}>
          <path d="M 6 14 H 21 M 15 8 L 21 14 L 15 20" fill="none" stroke={on ? GREEN_DARK : "#b9bcc2"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .3s" }} />
        </svg>
      </div>
    </div>
  );
}

/** The middle: your social investment, a green ₹ in a ringed circle. */
function Hub({ on, pulse }: { on: boolean; pulse: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 rounded-[16px] border border-[#eceef1] bg-white">
      <div className="relative flex size-[72px] items-center justify-center rounded-full border border-[#e6e8ec] lg:size-[80px]">
        {pulse && <motion.span aria-hidden className="absolute inset-0 rounded-full border-2" style={{ borderColor: GREEN }} animate={{ scale: [1, 1.18], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />}
        <span
          className="flex size-[44px] items-center justify-center rounded-full font-display text-[20px] font-bold text-white transition-[background-color,box-shadow] duration-500 lg:size-[48px]"
          style={{ backgroundColor: on ? GREEN : "#c9ccd1", boxShadow: on ? "0 8px 20px rgba(98,175,29,0.35)" : "none" }}
        >
          ₹
        </span>
      </div>
      <span className="absolute bottom-2 font-display text-[10px] font-bold uppercase leading-[12px] tracking-[0.8px] text-text-grey-48">Your investment</span>
    </div>
  );
}

/** A stage in a corner: an icon chip, a two-line bold claim, a short grey line. Lit once reached; the current one gets a
 * green outline. */
function GridCard({ card, lit, current }: { card: Card; lit: boolean; current: boolean }) {
  return (
    <div
      className={`flex flex-col gap-2.5 rounded-[16px] border p-5 transition-[border-color,box-shadow,opacity] duration-500 ${
        current ? "border-[#62af1d] shadow-[0_16px_40px_rgba(41,45,54,0.10)]" : lit ? "border-[#e3eadb]" : "border-[#eceef1] opacity-60"
      }`}
    >
      <span className="flex size-[38px] items-center justify-center rounded-[10px] transition-colors duration-500" style={{ backgroundColor: lit ? "#eef6e6" : "#f4f5f7" }}>
        <span
          aria-hidden
          className="block size-[20px] transition-colors duration-500"
          style={{ backgroundColor: lit ? GREEN_DARK : "#9a9ea6", WebkitMask: `url(${card.icon}) center / contain no-repeat`, mask: `url(${card.icon}) center / contain no-repeat` }}
        />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-[11px] font-bold uppercase leading-[14px] tracking-[1px] text-text-grey-48">{card.label}</p>
        <p className="font-display text-[18px] font-bold leading-[24px] tracking-[-0.3px] text-text-grey-100 [text-wrap:balance]">{card.title}</p>
        <p className="font-display text-[14px] font-medium leading-[20px] text-text-grey-48">{card.line}</p>
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
