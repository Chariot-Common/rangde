"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { PointText, type Point } from "./approaches";
import { Eyebrow } from "./ui";

/*
 * Version 1.1's problem and solution sections: one card, the three points on one side (white) and a simple
 * chart for the active one on the other (light grey). The problem has its text on the left; the solution
 * flips it, chart on the left, and each of its charts answers the problem chart in the same place. The
 * section holds still while it is scrolled through; each third of the scroll makes the next point active,
 * the bar beside it filling as you go. On phones the chart sits above the points.
 *
 * The charts are deliberately plain: two colours at most, no figures beyond the one in the copy, and every
 * part named in a word or two (the legend under each chart, the axis names along its edges).
 */

const EASE = [0.22, 1, 0.36, 1] as const;
// Scroll distance per point, in viewport heights.
const PER_POINT_VH = 0.8;

const YELLOW = "var(--color-dashboard-community-yellow)";
const BLUE_FADED = "var(--color-primary-24)";
const GREEN = "var(--color-pill-credit)";
const RED = "var(--color-red-100)";
const GREY = "var(--color-text-grey-16)";
const AXIS = "var(--color-text-grey-24)";
const BLUE = "var(--color-primary-100)";
const BLUE_LIGHT = "var(--color-primary-48)";

type ChartSet = "problem" | "solution";

/** The problem card (text left, chart right, grey section). */
export function ProblemCard({ heading, points }: { heading: string; points: Point[] }) {
  return <ScrollPointsCard heading={heading} points={points} charts="problem" />;
}

/** The solution card: chart left, text right, on the green section, with the eyebrow over its heading. */
export function SolutionCard({ eyebrow, heading, points }: { eyebrow: string; heading: string; points: Point[] }) {
  return <ScrollPointsCard eyebrow={eyebrow} heading={heading} points={points} charts="solution" />;
}

function ScrollPointsCard({ eyebrow, heading, points, charts }: { eyebrow?: string; heading: string; points: Point[]; charts: ChartSet }) {
  const flipped = charts === "solution";
  const n = points.length;
  const outerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0); // 0–1 across the whole pinned scroll
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      progress.set(p);
      setActive(Math.min(n - 1, Math.floor(p * n)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [n, progress]);

  // Clicking a point scrolls to the middle of its stretch.
  const goTo = (i: number) => {
    const el = outerRef.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: "smooth" });
  };

  return (
    // The tall outer box gives the scroll room; the section inside sticks under the nav.
    <div ref={outerRef} style={{ height: `calc(100svh + ${PER_POINT_VH * n * 100}svh)` }}>
      {/* The green is the solution section's existing colour (PointsSection tone "green"). */}
      <section className={`sticky top-[calc(var(--navbar-bottom,0px)+8px)] mx-2 flex h-[calc(100svh-var(--navbar-bottom,0px)-16px)] flex-col items-center justify-center gap-6 rounded-[16px] px-4 py-6 sm:gap-10 sm:px-8 md:gap-12 ${flipped ? "bg-[#cbe0b8]" : "bg-bg-grey"}`}>
        <div className="flex flex-col items-center gap-2 text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <AnimatedText as="h2" text={heading} className="max-w-[780px] font-display text-p1 font-bold text-ink sm:text-h3" />
        </div>
        <div className="flex w-full max-w-[1040px] flex-col-reverse overflow-hidden rounded-[16px] bg-white md:grid md:grid-cols-[1fr_1fr]">
          <ol className={`flex flex-col gap-1 p-4 sm:p-6 md:justify-center md:gap-2 md:p-10 ${flipped ? "md:order-2" : ""}`}>
            {points.map((p, i) => (
              <PointRow key={p.title} point={p} index={i} n={n} active={i === active} progress={progress} onSelect={() => goTo(i)} />
            ))}
          </ol>
          <div className={`relative flex h-[232px] items-center justify-center bg-text-grey-4 sm:h-[300px] md:h-auto md:min-h-[440px] ${flipped ? "md:order-1" : ""}`}>
            {points.map((p, i) => (
              <Visual key={p.title} set={charts} index={i} on={i === active} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** One point: a bar on its left that fills through the point's stretch of the scroll, the title, and the body,
 * which opens only while the point is active. */
function PointRow({ point, index, n, active, progress, onSelect }: { point: Point; index: number; n: number; active: boolean; progress: MotionValue<number>; onSelect: () => void }) {
  const fill = useTransform(progress, [index / n, (index + 1) / n], [0, 1], { clamp: true });
  return (
    <li className="flex gap-4">
      <span aria-hidden className="relative w-[3px] shrink-0 overflow-hidden rounded-full bg-text-grey-8">
        <motion.span className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-ink" style={{ scaleY: fill }} />
      </span>
      <div className="flex min-w-0 flex-col py-2">
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "step" : undefined}
          className={`text-left font-display text-p2 font-bold transition-colors duration-300 sm:text-p1 ${active ? "text-ink" : "text-ink/40 hover:text-ink/64"}`}
        >
          {point.title}
        </button>
        {/* Opens and closes by its own height (grid rows 0fr ↔ 1fr). */}
        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <p className="overflow-hidden font-display text-p3 font-medium leading-[22px] text-ink/64 sm:text-p2 sm:leading-[24px]">
            <span className="block pt-2">
              <PointText parts={point.text} plain />
            </span>
          </p>
        </div>
      </div>
    </li>
  );
}

/* ───────────────────────── The charts ───────────────────────── */

const CHARTS: Record<ChartSet, ((p: { on: boolean; reduce: boolean }) => ReactNode)[]> = {
  problem: [ShareChart, CostChart, DebtChart],
  solution: [FundedChart, FairCostChart, CreditChart],
};

function Visual({ set, index, on }: { set: ChartSet; index: number; on: boolean }) {
  const reduce = useReducedMotion();
  const Chart = CHARTS[set][index];
  const chart = Chart ? <Chart on={on} reduce={!!reduce} /> : null;
  return (
    <motion.div
      aria-hidden={!on}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-8"
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.97 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      style={{ pointerEvents: on ? "auto" : "none" }}
    >
      {chart}
    </motion.div>
  );
}

function Legend({ items }: { items: { color: string; label: string; line?: boolean }[] }) {
  return (
    <ul className="flex flex-col gap-1.5 sm:gap-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 font-display text-[12px] font-medium leading-[16px] text-ink/80 sm:text-p4">
          <span aria-hidden className={`shrink-0 ${it.line ? "h-[3px] w-[14px] rounded-full" : "size-[10px] rounded-full"}`} style={{ backgroundColor: it.color }} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Axis names along a chart's left and bottom edges. */
function Axes({ x, y, children }: { x: string; y: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-1">
      <span className="flex items-center font-display text-[11px] font-medium uppercase tracking-[0.06em] text-ink/48 [writing-mode:vertical-rl] rotate-180">{y}</span>
      {children}
      <span />
      <span className="text-right font-display text-[11px] font-medium uppercase tracking-[0.06em] text-ink/48">{x} →</span>
    </div>
  );
}

const CHART_SIZE = "h-[140px] w-[200px] sm:h-[200px] sm:w-[280px]";

/** 1. Banks won't lend: a pie, the small yellow slice the share who can borrow formally, the rest faded blue. */
function ShareChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const share = 0.15;
  // The slice runs clockwise from 12 o'clock, pulled a little out of the pie so it reads first.
  const a = share * 2 * Math.PI;
  const r = 80;
  const mid = a / 2;
  const pull = 6;
  const sx = Math.sin(mid) * pull;
  const sy = -Math.cos(mid) * pull;
  const end = { x: 100 + r * Math.sin(a), y: 100 - r * Math.cos(a) };
  const slice = `M100 100 L100 ${100 - r} A${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
  const rest = `M100 100 L${end.x} ${end.y} A${r} ${r} 0 1 1 100 ${100 - r} Z`;
  return (
    <>
      <svg viewBox="0 0 200 200" className="size-[150px] sm:size-[220px]">
        <path d={rest} fill={BLUE_FADED} />
        <motion.path
          d={slice}
          fill={YELLOW}
          initial={false}
          animate={on ? { x: sx, y: sy, scale: 1, opacity: 1 } : { x: 0, y: 0, scale: 0.6, opacity: 0 }}
          style={{ transformOrigin: "100px 100px" }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.2, ease: EASE }}
        />
      </svg>
      <Legend
        items={[
          { color: YELLOW, label: "Under 15% can get a formal loan" },
          { color: BLUE_FADED, label: "Everyone else can't" },
        ]}
      />
    </>
  );
}

/** 2. Informal loans cost more: what the business earns (green, jagged like 📈) rises, but what the loan costs
 * (red: repayment plus interest) rises faster and overtakes it. */
function CostChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const earn = "M8 118 L30 104 L46 110 L66 92 L84 98 L104 80 L120 88 L140 70 L158 76 L180 58 L192 62";
  const cost = "M8 128 C 70 118, 120 90, 192 20";
  const draw = (delay: number) => ({
    initial: false as const,
    animate: on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { duration: reduce ? 0 : 1.1, delay: reduce ? 0 : delay, ease: EASE },
  });
  return (
    <>
      <Axes x="Time" y="Money">
        <svg viewBox="0 0 200 140" className={CHART_SIZE} fill="none">
          <path d="M2 2 V138 H198" stroke={AXIS} strokeWidth={1.5} />
          <motion.path d={earn} stroke={GREEN} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" {...draw(0.15)} />
          <motion.path d={cost} stroke={RED} strokeWidth={3} strokeLinecap="round" {...draw(0.45)} />
        </svg>
      </Axes>
      <Legend
        items={[
          { color: GREEN, label: "What the business earns", line: true },
          { color: RED, label: "What the loan costs (repayment + interest)", line: true },
        ]}
      />
    </>
  );
}

/** 3. No credit score built: unpaid debt compounding. Each bar is the debt at a point in time: the same amount
 * borrowed (grey) with the interest on top (red) growing faster and faster. */
function DebtChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const base = 26;
  const interest = [4, 10, 19, 32, 52, 82];
  const w = 20;
  const gap = (196 - interest.length * w) / (interest.length + 1);
  return (
    <>
      <Axes x="Time" y="Debt owed">
        <svg viewBox="0 0 200 140" className={CHART_SIZE} fill="none">
          <path d="M2 2 V138 H198" stroke={AXIS} strokeWidth={1.5} />
          {interest.map((h, i) => {
            const x = 2 + gap + i * (w + gap);
            return (
              <motion.g
                key={i}
                initial={false}
                animate={on ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                style={{ transformOrigin: `${x}px 137px` }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15 + i * 0.1, ease: EASE }}
              >
                <rect x={x} y={137 - base} width={w} height={base} rx={2} fill={GREY} />
                <rect x={x} y={137 - base - h - 2} width={w} height={h} rx={2} fill={RED} />
              </motion.g>
            );
          })}
        </svg>
      </Axes>
      <Legend
        items={[
          { color: GREY, label: "What was borrowed" },
          { color: RED, label: "Interest piling up on interest" },
        ]}
      />
    </>
  );
}

/* The solution's charts, each answering the problem chart in the same place. */

/** A simple upper-body silhouette (head, neck, shoulders, chest), centred on 0,0 and about 24 × 28 units. */
function Person({ fill, opacity = 1 }: { fill: string; opacity?: number }) {
  return (
    // Faded as one group (not a translucent fill), so the head and body don't show a darker seam where they meet.
    <g fill={fill} opacity={opacity}>
      <circle cx={0} cy={-7.5} r={6} />
      <path d="M-2.6 -2.2 H2.6 V1.4 C6.5 2 12 4.6 12 13.5 H-12 C-12 4.6 -6.5 2 -2.6 1.4 Z" />
    </g>
  );
}

/** 1. Investors lend to them (answers the pie): investors (green) spread round a borrower (light blue), each
 * sending money in: an arrow travels from every investor to the borrower, over and over. */
function FundedChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const n = 8;
  const R = 78; // investors' distance from the centre
  const investors = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI;
    const x = 100 + R * Math.sin(a);
    const y = 100 - R * Math.cos(a);
    // Pointing from the investor to the centre.
    const deg = (Math.atan2(100 - y, 100 - x) * 180) / Math.PI;
    return { x, y, deg };
  });
  return (
    <>
      <svg viewBox="0 0 200 200" className="size-[170px] overflow-visible sm:size-[240px]" fill="none">
        {/* Arrows: each runs along the line from its investor towards the borrower, fading in and out as it
            goes, staggered round the circle. With reduced motion they sit still, halfway along. */}
        {investors.map((p, i) => (
          <g key={`a${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.deg})`}>
            <motion.path
              d="M0 0 H9 M5 -3.5 L9 0 L5 3.5"
              stroke={GREEN}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={
                !on ? { opacity: 0, x: 16 } : reduce ? { opacity: 1, x: 26 } : { opacity: [0, 1, 1, 0], x: [16, 24, 36, 44] }
              }
              transition={
                !on || reduce
                  ? { duration: 0.2 }
                  : { duration: 1.4, times: [0, 0.25, 0.75, 1], ease: "linear", repeat: Infinity, delay: 0.7 + i * 0.12 }
              }
            />
          </g>
        ))}
        {/* The investors pop in one after another… */}
        {investors.map((p, i) => (
          <g key={`p${i}`} transform={`translate(${p.x} ${p.y})`}>
            <motion.g
              initial={false}
              animate={on ? { scale: 0.8, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.1 + i * 0.06, ease: EASE }}
            >
              <Person fill={GREEN} />
            </motion.g>
          </g>
        ))}
        {/* …round the borrower in the middle. */}
        <g transform="translate(100 98)">
          <motion.g
            initial={false}
            animate={on ? { scale: 1.6, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
          >
            <Person fill={BLUE} opacity={0.48} />
          </motion.g>
        </g>
      </svg>
      <Legend
        items={[
          { color: GREEN, label: "Investors, each lending a share" },
          { color: BLUE_LIGHT, label: "A borrower the banks turned away" },
        ]}
      />
    </>
  );
}

/** 2. Interest stays fair (answers the red-over-green chart): the same earnings line, and what the loan costs
 * now stays well under it. */
function FairCostChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const earn = "M8 118 L30 104 L46 110 L66 92 L84 98 L104 80 L120 88 L140 70 L158 76 L180 58 L192 62";
  const cost = "M8 130 C 70 127, 130 120, 192 110";
  const draw = (delay: number) => ({
    initial: false as const,
    animate: on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { duration: reduce ? 0 : 1.1, delay: reduce ? 0 : delay, ease: EASE },
  });
  return (
    <>
      <Axes x="Time" y="Money">
        <svg viewBox="0 0 200 140" className={CHART_SIZE} fill="none">
          <path d="M2 2 V138 H198" stroke={AXIS} strokeWidth={1.5} />
          <motion.path d={earn} stroke={GREEN} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" {...draw(0.15)} />
          <motion.path d={cost} stroke={BLUE} strokeWidth={3} strokeLinecap="round" {...draw(0.45)} />
        </svg>
      </Axes>
      <Legend
        items={[
          { color: GREEN, label: "What the business earns", line: true },
          { color: BLUE, label: "What the loan costs (up to 8.5% a year)", line: true },
        ]}
      />
    </>
  );
}

/** 3. Repaying builds credit (answers the compounding debt): a grey stub where they start with no credit file,
 * then a green bar a step taller with every repayment. */
function CreditChart({ on, reduce }: { on: boolean; reduce: boolean }) {
  const heights = [6, 22, 38, 54, 70, 86, 102];
  const w = 18;
  const gap = (196 - heights.length * w) / (heights.length + 1);
  return (
    <>
      <Axes x="Repayments" y="Credit history">
        <svg viewBox="0 0 200 140" className={CHART_SIZE} fill="none">
          <path d="M2 2 V138 H198" stroke={AXIS} strokeWidth={1.5} />
          {heights.map((h, i) => {
            const x = 2 + gap + i * (w + gap);
            return (
              <motion.rect
                key={i}
                x={x}
                y={137 - h}
                width={w}
                height={h}
                rx={2}
                fill={i === 0 ? GREY : GREEN}
                initial={false}
                animate={on ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                style={{ transformOrigin: `${x}px 137px` }}
                transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.15 + i * 0.1, ease: EASE }}
              />
            );
          })}
        </svg>
      </Axes>
      <Legend
        items={[
          { color: GREY, label: "No credit file to start" },
          { color: GREEN, label: "Credit history, built with each repayment" },
        ]}
      />
    </>
  );
}
