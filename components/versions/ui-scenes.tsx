"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { SceneDef } from "./story-scenes";

/*
 * The problem / solution visuals (v1's side-by-side cards and v1.1 B's tabs): minimal product-style cards, no drawn
 * people, in the language of the references (a stack of rows with one in focus; a small flow with lines; a compact
 * report). Each pair uses the same piece on both sides so only the outcome changes:
 *   1. a loan application whose checks run one by one, ending on "Bank loan · Declined"
 *        ↔ Durga's loan filling up as investors from different cities join it
 *   2. what a year's interest on ₹1 lakh costs from each lender, the moneylender in focus
 *        ↔ the same, with Rang De in focus and what stays in the business
 *   3. a year of repayments, paid but never reported, and what the next lender sees
 *        ↔ the same year, each month reported, and what the next lender sees now
 * Each has a header line, its content, and a one-line takeaway, so a card is never one lonely shape. They sit straight
 * on the card behind them (no frame of their own), drawn near real size (MAX_SCALE): tinted icon chips, medium weights,
 * only what is in focus semibold. The one real photo is Durga's, from her rangde.in listing. Every scene takes `t`
 * (0–1) and plays from it; the steps are spread across it so they read one after another.
 *
 * PLACEHOLDER: the 20–30% informal rate still has no confirmed source (see MFI_RATE_SOURCE in approaches.tsx). The
 * investors joining Durga's loan are illustrative (her listing had 31; the names and cities here are not real data).
 */

type P = { t: MotionValue<number> };
const W = 360;
// Close to real size: big enough to fill the card, never blown up into a poster.
const MAX_SCALE = 1.3;
const useRange = (t: MotionValue<number>, a: number, b: number) => useTransform(t, [a, b], [0, 1], { clamp: true });

const DURGA = "https://rangde.imgix.net/bImg/durgamanawar01-img.jpg?auto=compress,format&h=150&w=150&fit=facearea&facepad=4.0";

const RED = "#D92D3A";
const GREEN = "#3A6E0C";
const GREY = "#A3A7B0";
const BLUE = "#2E8BD8";
const SOFT = "shadow-[0_1px_2px_rgba(41,45,54,0.05),0_8px_24px_rgba(41,45,54,0.06)]";
const LIFT = "shadow-[0_2px_4px_rgba(41,45,54,0.05),0_14px_36px_rgba(41,45,54,0.12)]";
// Icon chips: a light tint with the icon in the colour, rather than a solid block.
const TINT: Record<string, string> = { [RED]: "#FCE8EA", [GREEN]: "#E6F1DA", [GREY]: "#F1F2F5", [BLUE]: "#E3F0FB" };

/** Fits the scene to the frame (no bigger than MAX_SCALE), centred, and lets it rise in from below. */
function Canvas({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = box.current;
    const content = inner.current;
    if (!el || !content) return;
    const fit = () => setS(Math.min(MAX_SCALE, (el.clientWidth - 8) / W, (el.clientHeight - 8) / Math.max(1, content.offsetHeight)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden" aria-hidden>
      <div ref={inner} className="absolute left-1/2 top-1/2 px-4 py-3 font-display" style={{ width: W, transform: `translate(-50%, -50%) scale(${s})` }}>
        <motion.div initial={reduce ? false : { y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────── Shared pieces ───────────── */

const PATHS = {
  file: "M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9 13h6M9 17h4",
  history: "M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5",
  land: "M3 20h18M5 20v-6l7-5 7 5v6M10 20v-4h4v4",
  bank: "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3",
  hand: "M12 8V4l-4 4M8 20H6a2 2 0 0 1-2-2v-3l3-3h5l3 3h3a2 2 0 0 1 0 4h-5",
  group: "M9 7a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2",
  rupee: "M18 5H7h3a4 4 0 0 1 0 8H7l6 6M7 9h11",
  receipt: "M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2l-2 2l-2-2l-2 2l-2-2zM9 7h6M9 11h6M9 15h4",
  eye: "M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6",
  check: "m5 12l5 5L20 7",
  x: "M18 6L6 18M6 6l12 12",
} as const;
type IconName = keyof typeof PATHS;

function Icon({ d, className = "size-[18px]" }: { d: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[d]} />
    </svg>
  );
}

function Chip({ icon, color }: { icon: IconName; color: string }) {
  return (
    <span className="flex size-[28px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: TINT[color] ?? "#F1F2F5", color }}>
      <Icon d={icon} className="size-[15px]" />
    </span>
  );
}

/** A small header over a scene: what it is, and a quiet detail on the right. */
function Head({ title, detail, t }: { title: string; detail: string; t: MotionValue<number> }) {
  const o = useRange(t, 0, 0.1);
  return (
    <motion.div style={{ opacity: o }} className="mb-2.5 flex items-baseline justify-between px-1">
      <p className="text-[13px] font-semibold uppercase tracking-[0.6px] text-text-grey-64">{title}</p>
      <p className="text-[12px] font-medium text-text-grey-48">{detail}</p>
    </motion.div>
  );
}

/** The line that ends a scene: what it all adds up to. */
function Takeaway({ t, at, color, icon, children }: { t: MotionValue<number>; at: number; color: string; icon: IconName; children: ReactNode }) {
  const o = useRange(t, at, at + 0.1);
  const y = useTransform(o, [0, 1], [8, 0]);
  return (
    <motion.p style={{ opacity: o, y, color }} className="mt-3 flex items-center gap-2 px-1 text-[14px] font-semibold leading-[20px]">
      <Icon d={icon} className="size-[15px] shrink-0" />
      {children}
    </motion.p>
  );
}

/** A result that waits behind a small spinner until `at`, then pops in. */
function Result({ t, at, children, color }: { t: MotionValue<number>; at: number; children: ReactNode; color?: string }) {
  const done = useRange(t, at, at + 0.04);
  const started = useRange(t, at - 0.1, at - 0.08);
  const spin = useTransform([started, done] as MotionValue<number>[], ([s, d]: number[]) => s * (1 - d));
  return (
    <span className="relative flex min-w-[64px] justify-end">
      <motion.span style={{ opacity: spin }} className="absolute right-0 top-1/2 size-[14px] -translate-y-1/2 animate-spin rounded-full border-2 border-text-grey-16 border-t-text-grey-64" />
      <motion.span style={{ opacity: done, color: color ?? "var(--color-text-grey-64)" }} className="text-[13px] font-semibold leading-[20px]">
        {children}
      </motion.span>
    </span>
  );
}

/* ───────────── 1. Getting a loan ───────────── */

const CHECKS: { icon: IconName; label: string; value: string; bad?: boolean }[] = [
  { icon: "file", label: "Business plan", value: "Sound" },
  { icon: "receipt", label: "Income proof", value: "Informal", bad: true },
  { icon: "history", label: "Credit history", value: "None", bad: true },
  { icon: "land", label: "Land as collateral", value: "None", bad: true },
];

function BankDeclined({ t }: P) {
  const verdict = useRange(t, 0.66, 0.78);
  const dim = useTransform(verdict, [0, 1], [1, 0.55]);
  const vScale = useTransform(verdict, [0, 1], [0.94, 1]);
  return (
    <Canvas>
      <Head t={t} title="Business loan" detail="₹1,00,000 · Rajasthan" />
      <motion.div style={{ opacity: dim }} className={`flex flex-col divide-y divide-text-grey-8 rounded-[14px] bg-white px-3.5 ${SOFT}`}>
        {CHECKS.map((c, i) => (
          <div key={c.label} className="flex items-center gap-3 py-2.5">
            <Chip icon={c.icon} color={GREY} />
            <span className="flex-1 text-[14px] font-medium text-text-grey-100">{c.label}</span>
            <Result t={t} at={0.18 + i * 0.12} color={c.bad ? RED : undefined}>
              {c.value}
            </Result>
          </div>
        ))}
      </motion.div>
      {/* The verdict, lifting out of the list once every check has run. */}
      <motion.div style={{ opacity: verdict, scale: vScale }} className={`-mt-1 flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 ${LIFT}`}>
        <Chip icon="bank" color={RED} />
        <span className="flex-1 text-[15px] font-semibold text-text-grey-100">Bank loan</span>
        <span className="flex items-center gap-1 rounded-full bg-[#FCE8EA] px-2.5 py-1 text-[12px] font-semibold text-[#B4232F]">
          <Icon d="x" className="size-[12px]" /> Declined
        </span>
      </motion.div>
    </Canvas>
  );
}

const JOINERS = [
  { name: "Ananya", place: "Bengaluru", amount: 2000, color: "#E9A23B" },
  { name: "Rohan", place: "Pune", amount: 5000, color: "#5B8DEF" },
  { name: "Meera", place: "Dubai", amount: 10000, color: "#A86ED6" },
  { name: "You", place: "", amount: 2000, color: "var(--color-primary)" },
];
const GOAL = 100000;
const JOIN_AT = (i: number) => 0.14 + i * 0.13;

function Joiner({ j, i, t }: { j: (typeof JOINERS)[number]; i: number; t: MotionValue<number> }) {
  const on = useRange(t, JOIN_AT(i), JOIN_AT(i) + 0.08);
  const opacity = useTransform(on, [0, 1], [0.4, 1]);
  const x = useTransform(on, [0, 1], [10, 0]);
  const you = j.name === "You";
  const borderColor = useTransform(on, (o) => (o > 0.5 ? (you ? "var(--color-primary)" : "rgba(41,45,54,0.10)") : "rgba(41,45,54,0.20)"));
  const borderStyle = useTransform(on, (o) => (o > 0.5 ? "solid" : "dashed"));
  return (
    <motion.div style={{ opacity, x, borderColor, borderStyle }} className="ml-[34px] flex items-center gap-2.5 rounded-full border-[1.5px] bg-white py-1.5 pl-1.5 pr-4">
      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: j.color }}>
        {j.name[0]}
      </span>
      <span className="flex-1 text-[14px] font-medium text-text-grey-100">
        {j.name}
        {j.place && <span className="text-text-grey-48"> · {j.place}</span>}
      </span>
      <span className="text-[13px] font-semibold text-text-grey-64">₹{j.amount.toLocaleString("en-IN")}</span>
    </motion.div>
  );
}

function InvestorsJoin({ t }: P) {
  const line = useRange(t, 0.08, 0.62);
  const raised = useTransform(t, [0.1, 0.72], [0, GOAL], { clamp: true });
  const width = useTransform(raised, (r) => `${(r / GOAL) * 100}%`);
  const amount = useTransform(raised, (r) => `₹${Math.round(r / 100) * 100 >= GOAL ? "1,00,000" : (Math.round(r / 100) * 100).toLocaleString("en-IN")}`);
  const funded = useRange(t, 0.72, 0.8);
  return (
    <Canvas>
      <Head t={t} title="On Rang De" detail="Event decoration · Dhar, MP" />
      <div className="relative flex flex-col gap-2">
        <div className={`relative z-10 rounded-[14px] bg-white p-3 ${SOFT}`}>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DURGA} alt="" className="size-[40px] shrink-0 rounded-[9px] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-[20px] text-text-grey-100">Durga Chouhan</p>
              <p className="text-[12px] font-medium leading-[16px] text-text-grey-48">
                <motion.span className="font-semibold text-text-grey-100">{amount}</motion.span> of ₹1,00,000
              </p>
            </div>
            <motion.span style={{ opacity: funded }} className="flex items-center gap-1 rounded-full bg-[#E6F1DA] px-2.5 py-1 text-[12px] font-semibold text-[#3A6E0C]">
              <Icon d="check" className="size-[12px]" /> Funded
            </motion.span>
          </div>
          <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-text-grey-8">
            <motion.div style={{ width }} className="h-full rounded-full bg-[#A9C934]" />
          </div>
        </div>
        {/* The line from her loan down to each investor. */}
        <svg className="pointer-events-none absolute left-[16px] top-[82px] h-[180px] w-[30px] overflow-visible" fill="none" aria-hidden>
          <motion.path d="M2 0 V152" stroke="rgba(41,45,54,0.16)" strokeWidth="1.5" style={{ pathLength: line }} />
          {[22, 64, 106, 148].map((y) => (
            <motion.path key={y} d={`M2 ${y - 12} Q2 ${y} 14 ${y} H20`} stroke="rgba(41,45,54,0.16)" strokeWidth="1.5" style={{ pathLength: line }} />
          ))}
        </svg>
        {JOINERS.map((j, i) => (
          <Joiner key={j.name} j={j} i={i} t={t} />
        ))}
      </div>
      <Takeaway t={t} at={0.8} color={GREEN} icon="group">
        31 investors. No land asked for.
      </Takeaway>
    </Canvas>
  );
}

/* ───────────── 2. What it costs ───────────── */

type Lender = { icon: IconName; label: string; rate: string; cost: string; color: string; share: number };
const MONEYLENDER: Lender = { icon: "hand", label: "Moneylender", rate: "20–30% a year", cost: "₹20,000–30,000", color: RED, share: 1 };
const RANGDE: Lender = { icon: "rupee", label: "Rang De", rate: "up to 8.5% a year", cost: "up to ₹8,500", color: GREEN, share: 8.5 / 30 };
const OTHERS: Lender[] = [
  { icon: "bank", label: "Bank", rate: "out of reach", cost: "—", color: GREY, share: 0 },
  { icon: "group", label: "Self-help group", rate: "group liability", cost: "—", color: GREY, share: 0 },
];

/** One lender: its rate, and (in focus) what a year's interest on ₹1 lakh comes to, as a bar. */
function LenderRow({ l, focus, t, i }: { l: Lender; focus: boolean; t: MotionValue<number>; i: number }) {
  const appear = useRange(t, 0.06 + i * 0.07, 0.2 + i * 0.07);
  const on = useRange(t, 0.4, 0.56);
  const bar = useRange(t, 0.5, 0.74);
  const opacity = useTransform([appear, on] as MotionValue<number>[], ([a, o]: number[]) => a * (focus ? 1 : 1 - 0.45 * o));
  const y = useTransform(appear, [0, 1], [10, 0]);
  const scale = useTransform(on, [0, 1], [1, focus ? 1.04 : 0.97]);
  const width = useTransform(bar, (b) => `${b * l.share * 100}%`);
  return (
    <motion.div style={{ opacity, y, scale, zIndex: focus ? 2 : 1 }} className={`relative rounded-[12px] bg-white px-3.5 py-2.5 ${focus ? LIFT : SOFT}`}>
      <div className="flex items-center gap-3">
        <Chip icon={l.icon} color={focus ? l.color : GREY} />
        <span className={`flex-1 text-[14px] text-text-grey-100 ${focus ? "font-semibold" : "font-medium"}`}>{l.label}</span>
        <span className="text-[13px] font-semibold" style={{ color: focus ? l.color : "var(--color-text-grey-64)" }}>
          {l.rate}
        </span>
      </div>
      {focus && (
        <div className="mt-2.5 flex items-center gap-3">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-text-grey-8">
            <motion.div style={{ width, background: l.color }} className="h-full rounded-full" />
          </div>
          <span className="w-[112px] text-right text-[12px] font-semibold text-text-grey-64">{l.cost}</span>
        </div>
      )}
    </motion.div>
  );
}

function Cost({ t, rangDe }: P & { rangDe: boolean }) {
  const rows = rangDe ? [OTHERS[0], MONEYLENDER, RANGDE, OTHERS[1]] : [OTHERS[0], MONEYLENDER, OTHERS[1]];
  const focus = rangDe ? 2 : 1;
  return (
    <Canvas>
      <Head t={t} title="Interest on ₹1 lakh" detail="per year" />
      <div className="flex flex-col gap-1.5">
        {rows.map((l, i) => (
          <LenderRow key={l.label} l={l} focus={i === focus} t={t} i={i} />
        ))}
      </div>
      {rangDe ? (
        <Takeaway t={t} at={0.76} color={GREEN} icon="check">
          Up to ₹21,500 a year stays in the business.
        </Takeaway>
      ) : (
        <Takeaway t={t} at={0.76} color={RED} icon="x">
          Up to a third of the loan, every year.
        </Takeaway>
      )}
    </Canvas>
  );
}

const CostBefore = ({ t }: P) => <Cost t={t} rangDe={false} />;
const CostAfter = ({ t }: P) => <Cost t={t} rangDe />;

/* ───────────── 3. Credit history ───────────── */

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_AT = (i: number) => 0.1 + i * 0.04;

/** One month: it fills in when that repayment is made, grey (paid, not reported) or green (reported). */
function MonthCell({ m, i, t, reported }: { m: string; i: number; t: MotionValue<number>; reported: boolean }) {
  const on = useRange(t, MONTH_AT(i), MONTH_AT(i) + 0.04);
  const scale = useTransform(on, [0, 1], [0.5, 1]);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-[22px] rounded-[6px] bg-text-grey-8">
        <motion.span style={{ opacity: on, scale }} className={`absolute inset-0 flex items-center justify-center rounded-[6px] text-white ${reported ? "bg-[#3A6E0C]" : "bg-[#C9CCD3]"}`}>
          <Icon d="check" className="size-[12px]" />
        </motion.span>
      </div>
      <span className="text-[10px] font-medium text-text-grey-48">{m}</span>
    </div>
  );
}

function Credit({ t, reported }: P & { reported: boolean }) {
  const fill = useRange(t, 0.1, 0.58);
  const R = 15;
  const C = 2 * Math.PI * R;
  const dash = useTransform(fill, (f) => C * (1 - (reported ? f : 0)));
  const count = useTransform(fill, (f) => String(reported ? Math.round(f * 12) : 0));
  const bureau = useRange(t, 0.6, 0.7);
  const next = useRange(t, 0.72, 0.82);
  const nextY = useTransform(next, [0, 1], [8, 0]);
  return (
    <Canvas>
      <Head t={t} title="Repayments this year" detail="₹1 lakh loan" />
      <div className={`flex flex-col gap-3.5 rounded-[14px] bg-white p-4 ${SOFT}`}>
        <div className="flex justify-between">
          {MONTHS.map((m, i) => (
            <MonthCell key={i} m={m} i={i} t={t} reported={reported} />
          ))}
        </div>
        <div className="h-px bg-text-grey-8" />
        {/* What the credit bureau holds. */}
        <motion.div style={{ opacity: bureau }} className="flex items-center gap-3">
          <div className="relative size-[34px] shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(41,45,54,0.08)" strokeWidth="3.5" />
              <motion.circle cx="18" cy="18" r={R} fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: dash }} />
            </svg>
            <motion.span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-text-grey-100">{count}</motion.span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium leading-[20px] text-text-grey-100">Credit bureau</p>
            <p className="text-[12px] leading-[16px] text-text-grey-48">{reported ? "Every repayment reported" : "Informal repayments aren’t reported"}</p>
          </div>
        </motion.div>
      </div>
      {/* What it means the next time she needs a loan. */}
      <motion.div style={{ opacity: next, y: nextY }} className={`mt-1.5 flex items-center gap-3 rounded-[12px] bg-white px-3.5 py-2.5 ${reported ? LIFT : SOFT}`}>
        <Chip icon="eye" color={reported ? GREEN : RED} />
        <span className="flex-1 text-[14px] font-medium text-text-grey-100">Next lender sees</span>
        <span className="text-[13px] font-semibold" style={{ color: reported ? GREEN : RED }}>
          {reported ? "12 on-time repayments" : "Nothing"}
        </span>
      </motion.div>
    </Canvas>
  );
}

const CreditBefore = ({ t }: P) => <Credit t={t} reported={false} />;
const CreditAfter = ({ t }: P) => <Credit t={t} reported />;

/* ───────────── The pairs ───────────── */

export const UI_PROBLEM_SCENES: SceneDef[] = [
  { name: "Bank loan declined", Scene: BankDeclined, still: 1 },
  { name: "The moneylender at 20–30%", Scene: CostBefore, still: 1 },
  { name: "Nothing on record", Scene: CreditBefore, still: 1 },
];

export const UI_SOLUTION_SCENES: SceneDef[] = [
  { name: "Investors join Durga's loan", Scene: InvestorsJoin, still: 1 },
  { name: "Rang De at up to 8.5%", Scene: CostAfter, still: 1 },
  { name: "Twelve months on record", Scene: CreditAfter, still: 1 },
];
