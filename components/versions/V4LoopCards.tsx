"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RangDeStats } from "@/lib/stats";

/*
 * Version 2 C's "Why it matters": the loop, drawn with Version 2 B's direct cards (review, 11 Nov 2026: B read well but
 * lost the loop, which is the idea). The four stages are cards in a square, joined clockwise by lines with arrows:
 * Business → Repayment → Credit history → Opportunities → back into Business. "Your social investment" sits in the
 * middle and feeds the first card.
 *
 * Laptops and tablets: the section pins and the loop plays as you scroll: the investment lights up and its line fills
 * into Business, then each card in turn, the line out of it filling green, until the last line closes back into
 * Business ("And round again"). Phones: the cards stack, joined by a line down their left; a return line runs up their
 * right from the last card to the first. Each card lights up as it comes into view. Copy in Version 1's voice, with the
 * live figures. With reduced motion everything is shown lit.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";
const GREEN_DARK = "#3A6E0C";
const GREY = "#d6d7da";

type Card = { label: string; title: string; line: string };
const cardsFor = (stats: RangDeStats): Card[] => [
  { label: "Business", title: `${stats.entrepreneurs.toLocaleString("en-IN")} businesses funded`, line: "Stock for a shop, tools for a workshop, livestock for a farm." },
  { label: "Repayment", title: "Interest stays fair", line: `Up to 8.5% a year, no hidden charges. ${stats.principalRepaidPct.toFixed(1)}% of principal repaid so far.` },
  { label: "Credit history", title: "Repaying builds credit", line: "Every repayment is reported to the credit bureaus, so a credit history starts." },
  { label: "Opportunities", title: "The next loan doesn’t start from zero", line: "A credit record opens the door to more capital, back into the business." },
];

// Through the pinned scroll, 0 → 1: the investment and its line, then the four cards and the lines out of them.
// stage: 0 investment · 1–4 the cards · 5 the loop closed
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
  return phone ? <PhoneLoop cards={cards} reduce={!!reduce} /> : <SquareLoop cards={cards} reduce={!!reduce} />;
}

/* ───────────── Laptops and tablets: four cards in a square ───────────── */

function SquareLoop({ cards, reduce }: { cards: Card[]; reduce: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hubRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{ c: { x: number; y: number; w: number; h: number }[]; hub: { x: number; y: number; r: number } } | null>(null);
  const [stage, setStage] = useState(reduce ? STAGES - 1 : 0);
  const [within, setWithin] = useState(reduce ? 1 : 0); // 0 → 1 through the current stage

  // The cards' centres and sizes, relative to the grid, for the lines between them.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const g = grid.getBoundingClientRect();
      const c = cardRefs.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left - g.left + r.width / 2, y: r.top - g.top + r.height / 2, w: r.width, h: r.height };
      });
      const hr = hubRef.current!.getBoundingClientRect();
      setGeo({ c, hub: { x: hr.left - g.left + hr.width / 2, y: hr.top - g.top + hr.height / 2, r: hr.width / 2 } });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const s = Math.min(STAGES - 1e-6, Math.max(0, (v - 0.04) / 0.9) * STAGES);
    setStage(Math.floor(s));
    setWithin(s - Math.floor(s));
  });

  // Which card is lit: card i lights at stage i + 1 and stays lit.
  const lit = (i: number) => reduce || stage >= i + 1;
  const current = (i: number) => !reduce && stage === i + 1;
  // How far each line is filled: the hub's line (into card 0) through stage 0; card i's line out through stage i + 1.
  const fillOf = (k: number) => (reduce ? 1 : stage > k ? 1 : stage === k ? Math.min(1, within / 0.7) : 0);
  const closed = reduce || stage >= STAGES - 1;

  // Clockwise around the square: 0 top left → 1 top right → 2 bottom right → 3 bottom left → back to 0.
  const order = [0, 1, 3, 2]; // grid positions (row by row) of cards 0–3
  const pos = (i: number) => geo?.c[order.indexOf(i)];

  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 rounded-[16px] bg-white">
      <div ref={wrapRef} className="relative" style={{ height: reduce ? "auto" : "calc(3.6 * (100svh - var(--navbar-bottom, 0px)))" }}>
        <div
          className={`${reduce ? "py-20" : "sticky overflow-hidden"} flex flex-col items-center justify-center gap-10 px-8 lg:gap-12`}
          style={reduce ? undefined : { top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
        >
          {heading}

          <div ref={gridRef} className="relative grid w-full max-w-[920px] grid-cols-2 gap-x-[140px] gap-y-[96px] lg:gap-x-[180px]">
            {/* The lines, under the cards: the hub's into Business, then each card's into the next, round. */}
            {geo && (
              <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
                <Connector from={{ x: geo.hub.x, y: geo.hub.y }} fromPad={geo.hub.r + 4} to={pos(0)!} fill={fillOf(0)} gap={6} />
                {[0, 1, 2, 3].map((i) => (
                  <Connector key={i} from={pos(i)!} to={pos((i + 1) % 4)!} fill={fillOf(i + 1)} closing={i === 3} />
                ))}
              </svg>
            )}

            {/* Grid order is row by row; cards go round clockwise, so Opportunities (3) is bottom left. */}
            {order.map((ci, slot) => (
              <div key={cards[ci].label} ref={(el) => { cardRefs.current[slot] = el; }} className="relative z-10">
                <LoopCard card={cards[ci]} step={ci + 1} lit={lit(ci)} current={current(ci)} />
              </div>
            ))}

            {/* Your social investment, in the middle, feeding the loop. */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div
                ref={hubRef}
                className={`flex size-[116px] flex-col items-center justify-center gap-0.5 rounded-full border-[1.5px] text-center transition-[background-color,border-color,box-shadow] duration-500 ${
                  reduce || stage >= 0 ? "border-green-dark bg-white shadow-[0_16px_40px_rgba(41,45,54,0.10)]" : "border-text-grey-16 bg-white"
                }`}
              >
                <span className="flex size-[30px] items-center justify-center rounded-full font-display text-[16px] font-bold text-white" style={{ backgroundColor: GREEN_DARK }}>
                  ₹
                </span>
                <span className="font-display text-[12px] font-bold leading-[15px] text-text-grey-100">
                  Your social
                  <br />
                  investment
                </span>
                <span className="font-display text-[11px] font-medium leading-[14px] text-text-grey-48">from ₹500</span>
              </div>
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

/** A line from one point to another, stopping short of the card or hub at each end, grey with green filling along it, and
 * an arrowhead at its end. */
function Connector({ from, to, fill, fromPad, closing = false, gap = 14 }: { from: { x: number; y: number; w?: number; h?: number }; to: { x: number; y: number; w: number; h: number }; fill: number; fromPad?: number; closing?: boolean; gap?: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // How far along the line the edge of a w × h box around a centre is.
  const out = (w: number, h: number) => Math.min(Math.abs(ux) > 1e-6 ? w / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? h / 2 / Math.abs(uy) : Infinity);
  const GAP = gap;
  const a = fromPad ?? out(from.w ?? 0, from.h ?? 0) + GAP;
  const b = len - out(to.w, to.h) - GAP;
  const x1 = from.x + ux * a;
  const y1 = from.y + uy * a;
  const x2 = from.x + ux * b;
  const y2 = from.y + uy * b;
  const deg = (Math.atan2(uy, ux) * 180) / Math.PI;
  const r = (n: number) => Math.round(n * 10) / 10;
  const on = fill > 0.98;
  return (
    <g>
      <line x1={r(x1)} y1={r(y1)} x2={r(x2)} y2={r(y2)} stroke={GREY} strokeWidth={2} strokeDasharray={closing ? "6 6" : undefined} />
      <line x1={r(x1)} y1={r(y1)} x2={r(x1 + (x2 - x1) * fill)} y2={r(y1 + (y2 - y1) * fill)} stroke={GREEN} strokeWidth={4} strokeLinecap="round" />
      <path
        transform={`translate(${r(x2)} ${r(y2)}) rotate(${r(deg)})`}
        d="M -10 -7 L 0 0 L -10 7"
        fill="none"
        stroke={on ? GREEN : GREY}
        strokeWidth={on ? 4 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke .3s" }}
      />
    </g>
  );
}

/** A stage of the loop: its number and name, a short bold claim, one line. Lit once reached; the current one lifts. */
function LoopCard({ card, step, lit, current }: { card: Card; step: number; lit: boolean; current: boolean }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-[16px] p-6 transition-[background-color,box-shadow,opacity,transform] duration-500 ${
        current ? "bg-white shadow-[0_0_0_1.5px_#62af1d,0_16px_40px_rgba(41,45,54,0.12)]" : lit ? "bg-[#f3f8ee]" : "bg-[#f4f5f7] opacity-60"
      }`}
      style={{ transform: current ? "translateY(-4px)" : "none" }}
    >
      <p className={`font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] ${lit ? "text-green-dark" : "text-text-grey-48"}`}>
        {step} · {card.label}
      </p>
      <p className="font-display text-[22px] font-bold leading-[28px] tracking-[-0.44px] text-text-grey-100 [text-wrap:balance]">{card.title}</p>
      <p className="font-display text-[16px] font-medium leading-[23px] text-text-grey-64">{card.line}</p>
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
