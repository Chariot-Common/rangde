"use client";

import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { NewAsset } from "@/lib/why-v4-assets";
import { CREAM, EASE, Label, NIGHT, Rise, Tbc } from "./WhyRealStory";

/*
 * Version 4, "Why we exist": the problem, in detail (12 Nov 2026). Four beats, each with a graphic:
 *   1. How many: 100 people, 86 of them grey (World Bank Findex 2021).
 *   2. Why the bank says no: the declined slip and the two reasons, drawn with Rang De's own story sprites.
 *   3. Where they go instead: five options, each with its sourced fact (facts as in Version 1's problem section).
 *   4. The trap: no credit history → bank says no → moneylender → repayments not recorded → still no credit history.
 * Then, in the fix, what a ₹25,000 loan for a year costs her: moneylender vs Rang De (CostCompare).
 *
 * Three illustrations are still to be made (prompts in docs/why-v4-asset-prompts.md). Until a file exists in
 * public/images/why-v4/, its card shows a dashed slot with the file name; the page passes in which ones exist.
 */

const S = "/images/story";
const RED = "#E32642"; // Rang De logo red
const RED_ON_DARK = "#ff6b7d";
const GREEN = "#8CA21E"; // Rang De logo green
const LIME = "#c6e87a";
const PAPER = "#F7F3ED";


/* eslint-disable @next/next/no-img-element -- the story sprites are small, transparent and laid out by hand */
const Sprite = ({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) => (
  <img src={src} alt={alt} className={`pointer-events-none select-none object-contain ${className ?? ""}`} />
);

function CountUp({ to, decimals = 0, suffix = "", prefix = "" }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, reduce, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ── 1. How many: a hundred people. ───────────────────────────────────────────────────────────────────────── */

// The 14 who can get a bank loan, scattered rather than in a block, so the grid reads as people, not a bar.
const BANKED = new Set([3, 17, 22, 38, 41, 55, 59, 64, 70, 77, 83, 88, 92, 96]);

function Person({ on, grey, delay }: { on: boolean; grey: boolean; delay: number }) {
  return (
    <motion.svg viewBox="0 0 20 28" className="h-auto w-full" aria-hidden>
      <motion.g
        initial={false}
        animate={{ fill: grey ? "rgba(251,248,239,0.16)" : on ? LIME : "rgba(251,248,239,0.85)" }}
        transition={{ duration: 0.5, delay }}
      >
        <circle cx="10" cy="6" r="5" />
        <path d="M2 27 v-8 a8 8 0 0 1 16 0 v8 z" />
      </motion.g>
    </motion.svg>
  );
}

export function ProblemHowMany() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  // 0: a hundred people; 1: 86 of them go grey.
  const [phase, setPhase] = useState(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => setPhase(1), 900);
    return () => clearTimeout(t);
  }, [inView, reduce]);
  let greyOrder = 0;

  return (
    <section
      id="ch-problem"
      style={{ backgroundColor: NIGHT, color: CREAM }}
      className="mx-2 scroll-mt-[var(--navbar-bottom,0px)] rounded-[16px] px-4 pb-20 pt-28 sm:px-8 md:pb-32 md:pt-36"
    >
      <Rise className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
        <Label>The state of credit in India</Label>
        <h2 className="font-display text-[40px] font-extrabold leading-[1] tracking-[-0.035em] [text-wrap:balance] md:text-[72px]">
          Most of India is locked out.
          <br />
          <span className="text-[#fbf8ef]/40">The data is clear.</span>
        </h2>
      </Rise>

      <div ref={ref} className="mx-auto mt-16 grid max-w-[1200px] items-center gap-10 md:mt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
        <div className="mx-auto grid w-full max-w-[280px] grid-cols-10 sm:max-w-[400px] gap-x-[6px] gap-y-[8px] sm:gap-x-[10px] sm:gap-y-[12px]">
          {Array.from({ length: 100 }, (_, i) => {
            const banked = BANKED.has(i);
            const order = banked ? 0 : greyOrder++;
            return <Person key={i} on={banked && phase === 1} grey={!banked && phase === 1} delay={banked ? 0.2 : order * 0.012} />;
          })}
        </div>
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="font-display text-[96px] font-extrabold leading-[0.85] tracking-[-0.05em] text-[#c6e87a] md:text-[160px]">
            <CountUp to={86} suffix="%" />
          </p>
          <p className="font-display text-[22px] font-bold leading-[28px] [text-wrap:balance] md:text-[30px] md:leading-[38px]">
            Out of every 100 eligible adults in India, <span style={{ color: RED_ON_DARK }}>86 can’t get a loan</span> from a bank or formal lender.
          </p>
          <p className="font-display text-[12px] font-medium leading-[16px] text-[#fbf8ef]/48">World Bank, Global Findex Database 2021</p>
        </div>
      </div>
    </section>
  );
}

/* ── 2. Why the bank says no: the slip, and the two reasons. ───────────────────────────────────────────────── */

function DeclinedSlip() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <motion.div
        initial={reduce ? false : { opacity: 0, rotate: 0, y: 30 }}
        animate={reduce || inView ? { opacity: 1, rotate: -2, y: 0 } : undefined}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative rounded-[6px] bg-white p-6 pb-20 font-mono text-[13px] leading-[20px] text-[#3b362c] shadow-[0_24px_50px_rgba(41,45,54,0.16)] sm:p-9 sm:pb-9 sm:text-[14px] sm:leading-[22px]"
      >
        <p className="font-bold uppercase tracking-[0.12em]">Loan application · Outcome</p>
        <div className="my-4 border-t border-dashed border-[#3b362c]/40" />
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1">
          <dt className="text-[#3b362c]/60">Applicant</dt>
          <dd>Tailor, home business, rural Rajasthan</dd>
          <dt className="text-[#3b362c]/60">Amount</dt>
          <dd>₹25,000 · a second sewing machine</dd>
          <dt className="text-[#3b362c]/60">Collateral</dt>
          <dd className="font-bold" style={{ color: RED }}>
            None
          </dd>
          <dt className="text-[#3b362c]/60">Credit history</dt>
          <dd className="font-bold" style={{ color: RED }}>
            None
          </dd>
        </dl>
        <div className="my-4 border-t border-dashed border-[#3b362c]/40" />
        <p>Ability to repay: not assessed.</p>
        <motion.span
          initial={reduce ? false : { opacity: 0, scale: 1.6 }}
          animate={reduce || inView ? { opacity: 0.9, scale: 1 } : undefined}
          transition={{ duration: 0.35, delay: 0.7, ease: "easeOut" }}
          style={{ color: RED, borderColor: RED }}
          className="absolute bottom-6 right-5 rotate-[-12deg] rounded-[6px] border-[3px] px-3 py-1 font-sans text-[22px] font-extrabold uppercase tracking-[0.08em] sm:bottom-8 sm:right-8 sm:text-[28px]"
        >
          Declined
        </motion.span>
      </motion.div>
      <p className="font-display text-[12px] font-medium leading-[16px] text-ink/48">Illustration · the answer most first-time borrowers get</p>
    </div>
  );
}

function CreditGauge({ className }: { className?: string }) {
  // The story's gauge, needle hard over at empty: no score to read.
  return (
    <div className={`relative ${className ?? ""}`}>
      <Sprite src={`${S}/gauge__track.webp`} className="absolute inset-x-0 top-0 w-full" />
      <Sprite src={`${S}/gauge__needle.webp`} className="absolute bottom-[8%] left-1/2 h-[78%] origin-bottom -translate-x-1/2 -rotate-[80deg]" />
    </div>
  );
}

const REASONS = [
  {
    art: <Sprite src={`${S}/bank__deed.webp`} className="h-[64px] w-[96px]" />,
    title: "No land to pledge",
    body: "Banks ask for land or property as collateral. Rural entrepreneurs often have none in their name.",
  },
  {
    art: <CreditGauge className="h-[64px] w-[96px]" />,
    title: "No credit history",
    body: "First-time borrowers have no credit file, so a bank has nothing to judge them on.",
  },
];

export function ProblemBankSaysNo() {
  return (
    <section
      id="ch-bank"
      style={{ backgroundColor: PAPER }}
      className="mx-2 scroll-mt-[var(--navbar-bottom,0px)] rounded-[16px] px-4 py-24 sm:px-8 md:py-32"
    >
      <Rise className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
        <Label className="text-green-dark">Why the bank says no</Label>
        <h2 className="font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink [text-wrap:balance] md:text-[64px]">
          Not because she can’t repay.
          <br />
          <span className="text-ink/40">Because no one asks.</span>
        </h2>
      </Rise>

      <div className="mx-auto mt-14 grid max-w-[1100px] items-center gap-12 md:mt-20 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-16">
        <div className="relative mx-auto w-full max-w-[540px] md:pl-[96px]">
          {/* Rekha, reading the answer. */}
          <Sprite src={`${S}/vendor__doc-sad.webp`} className="absolute left-0 bottom-[28px] z-10 hidden h-[180px] md:block" />
          <DeclinedSlip />
        </div>
        <ul className="flex flex-col gap-3">
          {REASONS.map((r, i) => (
            <Rise key={r.title} delay={0.1 * i}>
              <li className="flex items-center gap-5 rounded-[16px] bg-white p-5 sm:p-6">
                <div className="grid size-[104px] shrink-0 place-items-center rounded-[12px]" style={{ backgroundColor: PAPER }}>
                  {r.art}
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="font-display text-[20px] font-extrabold leading-[26px] text-ink md:text-[24px] md:leading-[30px]">{r.title}</p>
                  <p className="font-display text-[15px] font-medium leading-[22px] text-ink/64 md:text-[16px] md:leading-[24px]">{r.body}</p>
                </div>
              </li>
            </Rise>
          ))}
          <Rise delay={0.2}>
            <p className="mt-3 font-display text-[17px] font-bold leading-[26px] text-ink [text-wrap:balance]">
              Her orders, her skill and her record of paying people back never come into it.
            </p>
          </Rise>
        </ul>
      </div>
    </section>
  );
}

/* ── 3. Where they go instead. ─────────────────────────────────────────────────────────────────────────────── */

type Option = {
  name: string;
  art: ReactNode | NewAsset;
  stat: ReactNode;
  line: ReactNode;
  verdict: "Costly" | "Falls short" | "Out of reach";
  source: ReactNode;
  wide?: boolean;
};

const OPTIONS: Option[] = [
  {
    name: "The moneylender",
    art: <Sprite src={`${S}/lender__give.webp`} className="h-[150px] md:h-[190px]" alt="" />,
    stat: "1 in 2",
    line: "rural households rely on informal lenders like moneylenders. Quick to say yes, and expensive.",
    verdict: "Costly",
    source: "NABARD Rural Economic Conditions & Sentiments Survey, Jul 2026",
  },
  {
    name: "Family and friends",
    art: "where__family.webp",
    stat: <CountUp to={31} suffix="%" />,
    line: "of Indian adults borrowed from family or friends in 2021. But a whole village often has the same lean months.",
    verdict: "Falls short",
    source: "World Bank, Global Findex 2021",
  },
  {
    name: "Self-help groups",
    art: "where__shg.webp",
    stat: "One for all",
    line: "Loans are in the group’s name. Every member answers for every repayment, and new loans depend on the group’s savings.",
    verdict: "Falls short",
    source: "RBI, SHG–bank linkage circular",
  },
  {
    name: "Government schemes",
    art: "where__scheme.webp",
    stat: (
      <>
        ~15%
        <span className="ml-2 align-middle font-display text-[12px] font-bold leading-[16px] tracking-normal">
          <Tbc note="Ram's figure from the 11 Nov call; Rang De to source it">to confirm</Tbc>
        </span>
      </>
    ),
    line: "They help, but they reach only a small share of people like her.",
    verdict: "Falls short",
    source: <Tbc>Source to come from Rang De</Tbc>,
  },
];

function Art({ art, have }: { art: Option["art"]; have: Set<string> }) {
  if (typeof art !== "string") return <>{art}</>;
  if (have.has(art)) return <Sprite src={`/images/why-v4/${art}`} className="h-[130px]" />;
  return (
    <div className="grid h-[120px] w-[160px] place-items-center rounded-[12px] border-2 border-dashed border-ink/20 px-3 text-center font-mono text-[11px] leading-[15px] text-ink/48">
      {art}
      <br />
      illustration to come
    </div>
  );
}

const VERDICT: Record<Option["verdict"], string> = {
  Costly: RED,
  "Out of reach": RED,
  "Falls short": "#6b6f78",
};

export function ProblemWhereTheyGo({ have = [] }: { have?: string[] }) {
  const set = new Set(have);
  return (
    <section id="ch-where" className="mx-2 scroll-mt-[var(--navbar-bottom,0px)] rounded-[16px] bg-white px-4 py-24 sm:px-8 md:py-32">
      <Rise className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
        <Label className="text-green-dark">So where do they go?</Label>
        <h2 className="font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink [text-wrap:balance] md:text-[64px]">
          Every other door costs more, <span className="text-ink/40">or doesn’t open far enough.</span>
        </h2>
      </Rise>

      <ul className="mx-auto mt-14 grid max-w-[1100px] gap-2 md:mt-20 md:grid-cols-2">
        {OPTIONS.map((o, i) => (
          <Rise key={o.name} delay={0.06 * (i % 2)} className={o.wide ? "md:col-span-2" : ""}>
            <li
              className={`flex h-full flex-col overflow-hidden rounded-[16px] ${o.wide ? "md:flex-row" : ""}`}
              style={{ backgroundColor: PAPER }}
            >
              <div className={`grid min-h-[180px] place-items-center px-6 pt-8 ${o.wide ? "md:w-[44%] md:pb-8" : ""}`}>
                <Art art={o.art} have={set} />
              </div>
              <div className={`flex flex-1 flex-col gap-3 p-6 sm:p-8 ${o.wide ? "md:justify-center" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-[15px] font-bold leading-[20px] text-ink/64">{o.name}</p>
                  <span
                    className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase leading-[14px] tracking-[0.08em] text-white"
                    style={{ backgroundColor: VERDICT[o.verdict] }}
                  >
                    {o.verdict}
                  </span>
                </div>
                <p
                  className={`font-display font-extrabold leading-[1] tracking-[-0.035em] text-ink ${o.wide ? "text-[40px] sm:text-[48px] md:text-[64px]" : "text-[40px] md:text-[44px]"}`}
                >
                  {o.stat}
                </p>
                <p className="font-display text-[16px] font-medium leading-[24px] text-ink/72">{o.line}</p>
                <p className="mt-auto pt-2 font-display text-[12px] font-medium leading-[16px] text-ink/48">{o.source}</p>
              </div>
            </li>
          </Rise>
        ))}
      </ul>
    </section>
  );
}

/* ── 4. The trap: the loop she can't get out of. ──────────────────────────────────────────────────────────── */

const TRAP = [
  { art: <CreditGauge className="h-[46px] w-[70px]" />, title: "No credit history", line: "" },
  {
    art: (
      <div className="relative">
        <Sprite src={`${S}/bank__building.webp`} className="h-[50px]" />
        <Sprite src={`${S}/bank__badge-no.webp`} className="absolute -right-3 -top-2 h-[22px]" />
      </div>
    ),
    title: "The bank says no",
    line: "",
  },
  { art: <Sprite src={`${S}/lender__give.webp`} className="h-[58px]" />, title: "A moneylender says yes", line: "" },
  { art: <Sprite src={`${S}/gauge__ledger.webp`} className="h-[46px]" />, title: "Repayments go unrecorded", line: "His ledger never reaches a credit bureau." },
];

export function ProblemTrap() {
  const reduce = useReducedMotion();
  const angle = useMotionValue(0);
  const [active, setActive] = useState(0);
  useMotionValueEvent(angle, "change", (a) => setActive(Math.floor((((a + 45) % 360) + 360) % 360 / 90)));
  useEffect(() => {
    if (reduce) return;
    const c = animate(angle, [0, 360], { duration: 8, ease: "linear", repeat: Infinity });
    return () => c.stop();
  }, [angle, reduce]);

  // Positions round the ring, clockwise from the top.
  const POS = ["left-1/2 top-0 -translate-x-1/2 -translate-y-1/2", "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"];

  return (
    <section
      id="ch-trap"
      style={{ backgroundColor: NIGHT, color: CREAM }}
      className="mx-2 scroll-mt-[var(--navbar-bottom,0px)] overflow-hidden rounded-[16px] px-4 py-24 sm:px-8 md:py-32"
    >
      <Rise className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
        <Label>The trap</Label>
        <h2 className="font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] [text-wrap:balance] md:text-[64px]">
          Years of repaying, <span style={{ color: RED_ON_DARK }}>and still no credit score.</span>
        </h2>
      </Rise>

      {/* Desktop: the loop. */}
      <div className="relative mx-auto mt-28 hidden aspect-square w-full max-w-[520px] md:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="50" cy="50" r="49.6" fill="none" stroke="rgba(251,248,239,0.18)" strokeWidth="0.4" strokeDasharray="1.2 1.2" />
        </svg>
        {!reduce && (
          <motion.div className="absolute inset-0" style={{ rotate: angle }} aria-hidden>
            <span className="absolute left-1/2 top-0 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: RED_ON_DARK, boxShadow: `0 0 0 6px rgba(255,107,125,0.18)` }} />
          </motion.div>
        )}
        <div className="absolute inset-[22%] flex flex-col items-center justify-center text-center">
          <p className="font-display text-[15px] font-bold leading-[22px] text-[#fbf8ef]/64 [text-wrap:balance]">
            Repaying a moneylender, however faithfully, builds no credit history. So the next time she asks a bank, the answer is the same.
          </p>
        </div>
        {TRAP.map((t, i) => {
          const on = reduce || active === i;
          return (
            <div key={t.title} className={`absolute ${POS[i]} w-[200px]`}>
              <motion.div
                animate={{ scale: on ? 1.04 : 1, opacity: on ? 1 : 0.55 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center gap-2 rounded-[16px] bg-[#fbf8ef] px-4 py-4 text-center text-ink"
                style={{ boxShadow: on ? `0 0 0 3px ${RED_ON_DARK}` : "none" }}
              >
                <div className="grid h-[60px] place-items-center">{t.art}</div>
                <p className="font-display text-[16px] font-extrabold leading-[20px]">{t.title}</p>
                {t.line && <p className="font-display text-[13px] font-medium leading-[18px] text-ink/64">{t.line}</p>}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Phones: the loop as a column that points back to its start. */}
      <ol className="mx-auto mt-12 flex max-w-[360px] flex-col items-center md:hidden">
        {TRAP.map((t, i) => (
          <li key={t.title} className="flex w-full flex-col items-center">
            <Rise className="flex w-full items-center gap-4 rounded-[16px] bg-[#fbf8ef] p-4 text-ink">
              <div className="grid size-[72px] shrink-0 place-items-center rounded-[12px]" style={{ backgroundColor: PAPER }}>
                {t.art}
              </div>
              <div>
                <p className="font-display text-[17px] font-extrabold leading-[22px]">{t.title}</p>
                {t.line && <p className="font-display text-[14px] font-medium leading-[20px] text-ink/64">{t.line}</p>}
              </div>
            </Rise>
            <span className="py-2 text-[20px] leading-none" style={{ color: RED_ON_DARK }} aria-hidden>
              {i < TRAP.length - 1 ? "↓" : "↺"}
            </span>
          </li>
        ))}
        <p className="text-center font-display text-[14px] font-bold leading-[20px] text-[#fbf8ef]/64">And back to the start.</p>
      </ol>

    </section>
  );
}

/* ── In the fix: what ₹25,000 for a year costs her. ───────────────────────────────────────────────────────── */

const LOAN = 25_000;
const COSTS = [
  { who: "From a moneylender", rate: 17.77, note: "average informal rate in rural India", color: RED },
  { who: "Through Rang De", rate: 8.5, note: "the most a Rang De loan charges, no hidden fees", color: GREEN, upTo: true },
];

export function CostCompare() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const max = Math.max(...COSTS.map((c) => c.rate));
  return (
    <section className="mx-2 rounded-[16px] bg-white px-4 py-20 sm:px-8 md:py-28">
      <Rise className="mx-auto flex max-w-[860px] flex-col items-center gap-4 text-center">
        <Label className="text-green-dark">What it costs her</Label>
        <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink [text-wrap:balance] md:text-[52px]">
          The same ₹25,000 for a year. <span style={{ color: GREEN }}>Less than half the interest.</span>
        </h2>
      </Rise>
      <div ref={ref} className="mx-auto mt-12 flex max-w-[860px] flex-col gap-6 md:mt-16">
        {COSTS.map((c, i) => {
          const interest = Math.round((LOAN * c.rate) / 100);
          return (
            <div key={c.who} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-[16px] font-bold leading-[22px] text-ink md:text-[18px]">{c.who}</p>
                <p className="font-display text-[14px] font-bold leading-[20px] text-ink/56">
                  {c.upTo ? "up to " : ""}
                  {c.rate}% a year
                </p>
              </div>
              <div className="relative h-[64px] overflow-hidden rounded-[10px] bg-bg-grey">
                <motion.div
                  className="flex h-full items-center rounded-[10px] px-4"
                  style={{ backgroundColor: c.color }}
                  initial={reduce ? false : { width: "0%" }}
                  animate={{ width: reduce || inView ? `${(c.rate / max) * 100}%` : "0%" }}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.25, ease: EASE }}
                >
                  <span className="whitespace-nowrap font-display text-[22px] font-extrabold text-white md:text-[28px]">
                    {c.upTo ? "≤ " : ""}₹{interest.toLocaleString("en-IN")}
                  </span>
                </motion.div>
              </div>
              <p className="font-display text-[13px] font-medium leading-[18px] text-ink/56">Interest over the year · {c.note}</p>
            </div>
          );
        })}
        <p className="font-display text-[12px] font-medium leading-[16px] text-ink/48">
          Simple yearly interest on ₹25,000, for illustration. Moneylender rate: NABARD, Jul 2026. Rang De rate: rangde.in.
        </p>
      </div>
    </section>
  );
}
