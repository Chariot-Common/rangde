"use client";

import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { stories } from "@/lib/content";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { LinkButton, SIGNUP_URL } from "./ui";
import { EASE, Rise } from "./WhyRealStory";

/*
 * /v/why, second pass (16 Nov 2026 review). Read only the headings and you have the story:
 *   (hero) Lend to rural entrepreneurs. Get repaid with interest. → Since 2019, across 29 states (map)
 *   → Small businesses keep India running. Most have never had a loan. → So they borrow from moneylenders… Rang De gives them
 *   their first loan. → Where your money goes (3 steps) → A first loan that works for her (two rate cards) → See what your
 *   money does → Join N people lending on Rang De → Read the numbers yourself (report cards, one per scroll).
 * Every section opens the same way: a small green label, then a centred heading.
 */

const GREEN_DARK = "#3a6e0c";
const LIME = "#D9E89A";
const RED = "#E32642";
const INK = "#292D36";
const PAPER = "#F7F3ED";

const H = "font-display font-extrabold tracking-[-0.04em] [text-wrap:balance]";
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** The one way every section opens: a small label, then the heading, centred. */
function Head({ children, sub, dark }: { children: ReactNode; sub?: ReactNode; dark?: boolean }) {
  const reduce = useReducedMotion();
  // Watch the wrapper, not the heading: a fully masked heading never counts as "in view".
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className="mx-auto flex max-w-[1000px] flex-col items-center gap-3 text-center md:gap-4">
      <motion.h2
        className={`${H} text-[34px] leading-[1.02] md:text-[60px] lg:text-[72px] ${dark ? "text-white" : "text-ink"}`}
        initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)", y: 36 }}
        animate={reduce || seen ? { clipPath: "inset(0% 0% -10% 0%)", y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.h2>
      {sub && <p className={`max-w-[560px] font-display text-[15px] font-medium leading-[22px] md:text-[18px] md:leading-[28px] ${dark ? "text-white/72" : "text-ink/64"}`}>{sub}</p>}
    </div>
  );
}

/* ── The problem: three figures as a bar chart (columns on laptops, bars on phones). ─────────────────────────────── */

const PROBLEM = [
  { big: "6 in 10", line: "small businesses in India have never had a formal loan", size: 0.78, bg: INK },
  { big: "~1 in 2", line: "rural households borrow from informal lenders", size: 0.64, bg: INK },
  { big: "17.77%", line: "a year: what those lenders charge, on average", size: 1, bg: RED },
];

export function ClearProblem() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const on = !!reduce || seen;
  const grow = (i: number) => ({ duration: 0.9, delay: on ? 0.1 + i * 0.14 : 0, ease: EASE });
  return (
    <section id="c-problem" className="mx-2 rounded-[16px] bg-white px-4 pb-10 pt-20 sm:px-8 md:pt-28">
      <Rise>
        <Head>
          Small businesses keep India running.
          <span className="block text-ink/40">Most have never had a loan.</span>
        </Head>
      </Rise>

      <div ref={ref} className="mx-auto mt-12 max-w-[1240px] md:mt-16">
        {/* Phones: bars growing from the left, each wide enough to hold its figure. */}
        <div className="flex flex-col gap-2 md:hidden">
          {PROBLEM.map((p, i) => (
            <motion.div
              key={p.big}
              className="overflow-hidden rounded-[14px] text-white"
              style={{ backgroundColor: p.bg }}
              initial={reduce ? false : { width: "0%" }}
              animate={{ width: on ? `${Math.max(0.7, p.size) * 100}%` : "0%" }}
              transition={grow(i)}
            >
              <div className="flex w-[260px] flex-col gap-2 px-5 py-5 min-[400px]:w-[280px]">
                <span className="whitespace-nowrap font-display text-[34px] font-extrabold leading-[0.95] tracking-[-0.04em] tabular-nums">{p.big}</span>
                <span className="font-display text-[14px] font-bold leading-[19px] text-white/88">{p.line}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Laptops: columns rising from a baseline, each as wide as its figure needs. */}
        <div className="hidden h-[56svh] max-h-[560px] items-end gap-3 md:flex">
          {PROBLEM.map((p, i) => (
            <motion.div
              key={p.big}
              className="flex min-w-fit flex-auto flex-col justify-between overflow-hidden rounded-t-[20px] px-7 pb-7 pt-6 text-white lg:px-9 lg:pt-8"
              style={{ backgroundColor: p.bg }}
              initial={reduce ? false : { height: "0%" }}
              animate={{ height: on ? `${p.size * 100}%` : "0%" }}
              transition={grow(i)}
            >
              <span className="whitespace-nowrap font-display text-[56px] font-extrabold leading-[0.95] tracking-[-0.045em] tabular-nums lg:text-[80px] xl:text-[96px]">{p.big}</span>
              <span className="max-w-[300px] font-display text-[17px] font-bold leading-[24px] text-white/88 lg:text-[20px] lg:leading-[28px]">{p.line}</span>
            </motion.div>
          ))}
        </div>
        <div className="hidden h-px bg-ink/16 md:block" />
      </div>
      <p className="mx-auto mt-5 max-w-[760px] text-center font-display text-[12px] font-medium leading-[17px] text-ink/48">
        TransUnion CIBIL &amp; SIDBI, MSME Pulse, July 2026 · NABARD Rural Economic Conditions &amp; Sentiments Survey, July 2026
      </p>
    </section>
  );
}

/* ── The turn: the problem hands over to Rang De, in one short band (no pinned scroll). ─────────────────────────── */

export function ClearTurn() {
  return (
    <section id="f-rangde" className="mx-2 flex min-h-[52svh] flex-col items-center justify-center gap-5 rounded-[16px] px-4 py-20 text-center md:gap-8 md:py-28" style={{ backgroundColor: GREEN_DARK }}>
      <Rise>
        <p className="font-display text-[17px] font-bold leading-[24px] text-white/72 md:text-[24px] md:leading-[32px]">
          So they borrow from moneylenders, at <span className="text-white">17.77%</span> a year.
        </p>
      </Rise>
      <Head dark>
        <span className="block text-[44px] leading-[0.98] md:text-[88px] lg:text-[112px]">
          Rang De gives them their <span style={{ color: LIME }}>first</span> loan.
        </span>
      </Head>
    </section>
  );
}

/* ── Where your money goes (18 Nov 2026): one connected picture instead of three separate cards. You on the left, her in
      the middle, you again on the right. Scrolling sends a coin from you to her bank account, then twelve repayments
      back to you, while the amount returned counts up. One step's words show at a time. ──────────────────────────── */

const STEPS = [
  { title: "Pick an entrepreneur.", line: "Every profile is met and verified by a local partner before it’s listed." },
  { title: "Your money goes straight to her loan.", line: "It reaches her bank account within 24 hours of collection, as RBI rules require." },
  { title: "She repays monthly. You get it back, with interest.", line: "Every repayment shows up in your dashboard." },
];
const LENT = 5000;
const BACK = 5425; // a year at 8.5%, as the calculator works it out
const AT = [14, 50, 86]; // where the three stops sit along the track, %

function FlowCoin({ p, from, to, start, span, small }: { p: MotionValue<number>; from: number; to: number; start: number; span: number; small?: boolean }) {
  const t = (v: number) => clamp((v - start) / span);
  const left = useTransform(p, (v) => `${from + (to - from) * (1 - Math.pow(1 - t(v), 2))}%`);
  const opacity = useTransform(p, (v) => (t(v) <= 0 || t(v) >= 1 ? 0 : 1));
  return (
    <motion.span
      aria-hidden
      className={`absolute top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display font-extrabold shadow-[0_6px_16px_rgba(41,45,54,0.2)] ${small ? "size-[22px] text-[11px] md:size-[28px] md:text-[13px]" : "size-[34px] text-[16px] md:size-[48px] md:text-[22px]"}`}
      style={{ left, opacity, backgroundColor: LIME, color: GREEN_DARK }}
    >
      ₹
    </motion.span>
  );
}

export function ClearSteps() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [at, setAt] = useState(0);
  const [paid, setPaid] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    setAt(v < 0.3 ? 0 : v < 0.6 ? 1 : 2);
    setPaid(Math.round(12 * clamp((v - 0.66) / 0.3)));
  });
  const out = useTransform(p, (v) => clamp((v - 0.3) / 0.26));
  const back = useTransform(p, (v) => clamp((v - 0.62) / 0.34));
  const head = <Head>Where your money goes.</Head>;

  if (reduce) {
    return (
      <section id="c-how" className="mx-2 rounded-[16px] px-4 py-20 sm:px-8" style={{ backgroundColor: PAPER }}>
        {head}
        <ol className="mx-auto mt-10 flex max-w-[640px] flex-col gap-6">
          {STEPS.map((st, i) => (
            <li key={st.title} className="flex gap-4">
              <span className="font-display text-[20px] font-bold" style={{ color: GREEN_DARK }}>{i + 1}</span>
              <div>
                <p className="font-display text-[22px] font-bold leading-[1.15] text-ink">{st.title}</p>
                <p className="mt-1 font-display text-[15px] leading-[22px] text-ink/64">{st.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const stop = "absolute top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center";
  const you = "flex size-[64px] items-center justify-center rounded-full border-2 bg-white font-display text-[15px] font-extrabold text-ink transition-colors duration-300 md:size-[112px] md:text-[22px]";
  const chip = "absolute top-full mt-2 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-bold tabular-nums md:mt-3 md:px-3.5 md:py-1.5 md:text-[14px]";

  return (
    <section id="c-how" className="mx-2 overflow-clip rounded-[16px]" style={{ backgroundColor: PAPER }}>
      <div ref={stage} className="relative h-[240svh]">
        <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col justify-center gap-8 px-3 pb-24 pt-16 sm:px-8 md:gap-12 md:pb-10">
          {head}

          {/* The picture: you → her → you. */}
          <div className="relative mx-auto h-[150px] w-full max-w-[1040px] md:h-[250px]">
            <span className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink/12" style={{ left: `${AT[0]}%`, right: `${100 - AT[2]}%` }} aria-hidden />
            <motion.span className="absolute top-1/2 h-[3px] origin-left -translate-y-1/2" style={{ left: `${AT[0]}%`, width: `${AT[1] - AT[0]}%`, scaleX: out, backgroundColor: GREEN_DARK }} aria-hidden />
            <motion.span className="absolute top-1/2 h-[3px] origin-left -translate-y-1/2" style={{ left: `${AT[1]}%`, width: `${AT[2] - AT[1]}%`, scaleX: back, backgroundColor: GREEN_DARK }} aria-hidden />

            <FlowCoin p={p} from={AT[0]} to={AT[1]} start={0.3} span={0.26} />
            {Array.from({ length: 12 }, (_, k) => (
              <FlowCoin key={k} p={p} from={AT[1]} to={AT[2]} start={0.63 + k * 0.022} span={0.09} small />
            ))}

            <div className={stop} style={{ left: `${AT[0]}%` }}>
              <span className={you} style={{ borderColor: GREEN_DARK }}>You</span>
              <span className={`${chip} bg-white text-ink`}>Lend ₹{LENT.toLocaleString("en-IN")}</span>
            </div>

            <div className={stop} style={{ left: `${AT[1]}%` }}>
              <span className="relative block size-[104px] overflow-hidden rounded-full border-[3px] transition-colors duration-300 md:size-[190px] md:border-4" style={{ borderColor: at >= 1 ? GREEN_DARK : "#fff" }}>
                <Image src="/images/collage/collage-16.webp" alt="A weaver smiling at her handloom." fill sizes="190px" className="object-cover" style={{ objectPosition: "66% 38%" }} />
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={at === 0 ? "v" : "b"} className={chip} style={{ backgroundColor: GREEN_DARK, color: "#fff" }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {at === 0 ? "✓ Met in person, verified" : "Her bank account"}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className={stop} style={{ left: `${AT[2]}%` }}>
              <span className={you} style={{ borderColor: paid > 0 ? GREEN_DARK : "rgba(41,45,54,0.16)", color: paid > 0 ? INK : "rgba(41,45,54,0.4)" }}>You</span>
              <span className={chip} style={{ backgroundColor: paid > 0 ? LIME : "rgba(41,45,54,0.06)", color: paid > 0 ? GREEN_DARK : "rgba(41,45,54,0.4)" }}>
                {paid > 0 ? (
                  <>
                    ₹{Math.round((BACK * paid) / 12).toLocaleString("en-IN")} back<span className="max-md:hidden"> · {paid}/12</span>
                  </>
                ) : (
                  "Repaid monthly"
                )}
              </span>
            </div>
          </div>

          {/* One step's words at a time. */}
          <div className="mx-auto flex min-h-[150px] w-full max-w-[720px] flex-col items-center gap-4 text-center md:min-h-[170px]">
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className="flex size-[28px] items-center justify-center rounded-full font-display text-[13px] font-bold transition-colors duration-300 md:size-[32px] md:text-[14px]"
                  style={{ backgroundColor: i === at ? GREEN_DARK : "rgba(41,45,54,0.08)", color: i === at ? "#fff" : "rgba(41,45,54,0.4)" }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={at} className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE }}>
                <p className="font-display text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink [text-wrap:balance] md:text-[40px]">{STEPS[at].title}</p>
                <p className="max-w-[520px] font-display text-[15px] font-medium leading-[22px] text-ink/64 md:text-[18px] md:leading-[27px]">{STEPS[at].line}</p>
              </motion.div>
            </AnimatePresence>
            <p className="font-display text-[11px] font-medium text-ink/40 md:text-[12px]">Example: ₹5,000 lent for a year at 8.5%.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── It's already happened: four real loans from rangde.in's success stories, each with what was funded and the return
      lenders got. The row drifts on its own and stops under the pointer. ─────────────────────────────────────────── */

export function ClearStories() {
  const s = useRangDeStats();
  const card = (st: (typeof stories)[number], k: string, hidden?: boolean) => (
    <li key={k} aria-hidden={hidden} className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[20px] text-white md:w-[400px]" style={{ backgroundColor: "#1F3F0B" }}>
      <div className="relative h-[180px] md:h-[230px]">
        <Image src={st.image} alt="" fill sizes="400px" className="object-cover" />
        <span className="absolute -bottom-7 left-6 block size-[64px] overflow-hidden rounded-[12px] border-[3px] border-white md:size-[72px]">
          <Image src={st.avatar} alt="" fill sizes="72px" className="object-cover" />
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6 pt-12">
        <p className="font-display text-[15px] font-medium leading-[23px] text-white/72 md:text-[17px] md:leading-[26px]">
          <span className="font-bold text-white">{st.highlight}</span>
          {st.rest}
        </p>
        <div className="grid grid-cols-2 border-t border-white/16 pt-5">
          <div>
            <p className="whitespace-nowrap font-display text-[19px] font-extrabold tracking-[-0.02em] tabular-nums md:text-[26px]">{st.totalFunded}</p>
            <p className="font-display text-[12px] font-medium text-white/64 md:text-[13px]">Total funded</p>
          </div>
          <div className="border-l border-white/16 pl-5">
            <p className="whitespace-nowrap font-display text-[19px] font-extrabold tracking-[-0.02em] tabular-nums md:text-[26px]" style={{ color: LIME }}>{st.returns}</p>
            <p className="font-display text-[12px] font-medium text-white/64 md:text-[13px]">Returns provided</p>
          </div>
        </div>
      </div>
    </li>
  );
  return (
    <section id="c-stories" className="mx-2 overflow-hidden rounded-[16px] bg-white py-20 md:py-28">
      <div className="px-4">
        <Rise>
          <Head>
            It has already happened <span style={{ color: GREEN_DARK }}>{s.entrepreneurs.toLocaleString("en-IN")}</span> times.
          </Head>
        </Rise>
      </div>
      <ul className="mt-10 flex w-max gap-3 hover:[animation-play-state:paused] motion-safe:animate-[marquee_60s_linear_infinite] md:mt-16 md:gap-4">
        {stories.map((st) => card(st, `a${st.image}`))}
        {stories.map((st) => card(st, `b${st.image}`, true))}
      </ul>
    </section>
  );
}

/* ── A first loan that works for her: two rate cards, side by side. ─────────────────────────────────────────────── */

const POINTS = ["Met and vetted in person", "Clear repayment dates", "Builds her credit history", "Next loan can come from a bank"];

function RateCard({ rd, on }: { rd: boolean; on: boolean }) {
  const rate = rd ? 8.5 : 17.77;
  return (
    <div className="flex flex-col gap-6 rounded-[20px] p-6 md:gap-8 md:p-10" style={{ backgroundColor: rd ? GREEN_DARK : PAPER, color: rd ? "#fff" : INK }}>
      <p className="font-display text-[14px] font-bold uppercase tracking-[0.12em] md:text-[15px]" style={{ color: rd ? LIME : "rgba(41,45,54,0.56)" }}>
        {rd ? "With Rang De" : "With a moneylender"}
      </p>
      <div className="flex flex-col gap-3">
        <p className="flex items-baseline gap-2 font-display font-extrabold tracking-[-0.045em]">
          {rd && <span className="text-[20px] tracking-[-0.02em] md:text-[24px]">up to</span>}
          <span className="text-[64px] leading-[0.9] tabular-nums md:text-[96px]" style={{ color: rd ? "#fff" : RED }}>
            {rate}%
          </span>
        </p>
        <p className="font-display text-[15px] font-medium md:text-[17px]" style={{ color: rd ? "rgba(255,255,255,0.72)" : "rgba(41,45,54,0.64)" }}>
          interest a year{rd ? "" : ", on average"}
        </p>
        {/* The two rates on one scale: 17.77% fills the bar. */}
        <div className="mt-2 h-[10px] overflow-hidden rounded-full" style={{ backgroundColor: rd ? "rgba(255,255,255,0.16)" : "rgba(41,45,54,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: rd ? LIME : RED }}
            initial={{ width: "0%" }}
            animate={{ width: on ? `${(rate / 17.77) * 100}%` : "0%" }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
          />
        </div>
      </div>
      <ul className="flex flex-col border-t" style={{ borderColor: rd ? "rgba(255,255,255,0.16)" : "rgba(41,45,54,0.1)" }}>
        {POINTS.map((pt) => (
          <li key={pt} className="flex items-center gap-3 border-b py-3 font-display text-[15px] font-bold md:py-4 md:text-[17px]" style={{ borderColor: rd ? "rgba(255,255,255,0.16)" : "rgba(41,45,54,0.1)", color: rd ? "#fff" : "rgba(41,45,54,0.4)" }}>
            <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full text-[13px]" style={{ backgroundColor: rd ? LIME : "rgba(41,45,54,0.08)", color: rd ? GREEN_DARK : "rgba(41,45,54,0.4)" }} aria-label={rd ? "Yes" : "No"}>
              {rd ? "✓" : "–"}
            </span>
            <span className={rd ? "" : "line-through decoration-ink/24"}>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClearCompare() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section id="c-compare" className="mx-2 rounded-[16px] bg-white px-4 py-20 sm:px-8 md:py-28">
      <Rise>
        <Head>A first loan that works for her.</Head>
      </Rise>
      <div ref={ref} className="mx-auto mt-10 grid max-w-[1080px] gap-3 md:mt-16 md:grid-cols-2 md:gap-4">
        <Rise>
          <RateCard rd on={!!reduce || seen} />
        </Rise>
        <Rise delay={0.08}>
          <RateCard rd={false} on={!!reduce || seen} />
        </Rise>
      </div>
      <p className="mx-auto mt-5 max-w-[1080px] text-center font-display text-[12px] font-medium leading-[17px] text-ink/48">
        Moneylender rate: NABARD Rural Economic Conditions &amp; Sentiments Survey, July 2026.
      </p>
    </section>
  );
}

/* ── See what your money does: the calculator, then what a first-time lender needs to know before the button:
      what you can earn, how long, the risk (in the words of the site's own Q&A) and the fee. ─────────────────────── */

const HONEST: { big: string; line: string; confirm?: boolean }[] = [
  { big: "Up to 8.5%", line: "a year: what you can earn" },
  { big: "1 to 24 months", line: "how long a loan runs" },
  { big: "No guarantee", line: "RBI rules don’t allow one. If a borrower can’t repay, that part of your money can be lost." },
  { big: "2% + GST", line: "compliance fee when you lend", confirm: true },
];

export function ClearTry() {
  return (
    <section id="c-try" className="mx-2 flex flex-col items-center gap-10 rounded-[16px] px-4 py-20 sm:px-8 md:gap-14 md:py-28" style={{ backgroundColor: PAPER }}>
      <Rise>
        <Head>See what your money does.</Head>
      </Rise>
      <InvestmentSlider refined />
      <Rise className="w-full max-w-[1240px]">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-6 border-t border-ink/12 pt-8 md:grid-cols-4 md:gap-x-8 md:pt-10">
          {HONEST.map((h) => (
            <li key={h.big} className="flex flex-col gap-1.5">
              <p className="font-display text-[22px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink md:text-[32px]">{h.big}</p>
              <p className="font-display text-[13px] font-medium leading-[19px] text-ink/64 md:text-[15px] md:leading-[22px]">{h.line}</p>
              {h.confirm && <span className="w-fit rounded-full bg-[#FFE9A8] px-2.5 py-1 font-display text-[11px] font-bold text-ink">To confirm with Rang De</span>}
            </li>
          ))}
        </ul>
      </Rise>
      {/* Phones already have the floating Get started button. */}
      <div className="max-sm:hidden">
        <LinkButton href={SIGNUP_URL}>Get started</LinkButton>
      </div>
    </section>
  );
}

/* ── Proof: the heading the reels sit under. ───────────────────────────────────────────────────────────────────── */

export function ClearProofHeading() {
  const s = useRangDeStats();
  return (
    <span className="flex flex-col items-center gap-3 px-2 md:gap-4">
      <span className={`${H} block text-[34px] leading-[1.02] text-ink md:text-[60px] lg:text-[72px]`}>
        Join <span style={{ color: GREEN_DARK }}>{s.investors.toLocaleString("en-IN")}</span> people
        <br className="max-md:hidden" /> lending on Rang De.
      </span>
    </span>
  );
}

/* ── Read the numbers yourself (after realfood.gov's Resources, reworked 16 Nov): each step of the scroll brings one report
      to the front of a deck on the right, fanning the ones before it out to the left, while the left column tells you what
      that report found and links to it. The cards carry only the source, the figure and one line. ───────────────────── */

const REPORTS = [
  {
    by: "TransUnion CIBIL & SIDBI",
    title: "MSME Pulse",
    date: "July 2026",
    big: "6 in 10",
    line: "small businesses have never had a formal loan",
    finding: "Only 3.6 crore of India’s 8.7 crore registered small businesses have ever had formal credit.",
    href: "https://www.transunioncibil.com/lp/msme-pulse-jul-2026",
    bg: INK,
    fg: "#fff",
    accent: LIME,
  },
  {
    by: "NABARD",
    title: "Rural Economic Conditions & Sentiments Survey",
    date: "July 2026",
    big: "17.77%",
    line: "a year, on informal loans",
    finding: "That’s the average rate on informal loans, and nearly half of rural households take them.",
    href: null,
    bg: RED,
    fg: "#fff",
    accent: "#fff",
  },
  {
    by: "World Bank",
    title: "Global Findex Database",
    date: "2021",
    big: "12%",
    line: "of Indian adults borrowed from a bank",
    finding: "Against 55% in the UK and 66% in the US. Almost a third borrowed from family or friends instead.",
    href: "https://www.worldbank.org/en/publication/globalfindex",
    bg: PAPER,
    fg: INK,
    accent: GREEN_DARK,
  },
  {
    by: "Rang De",
    title: "Live figures",
    date: "Updated daily",
    big: "",
    line: "of principal repaid, by Rang De’s own count",
    finding: "Only 0.3% of the money lent since 2019 has been written off. The figures on this page update from rangde.in every day.",
    href: "https://rangde.in",
    bg: GREEN_DARK,
    fg: "#fff",
    accent: LIME,
  },
];

function ReportCard({ r, repaid }: { r: (typeof REPORTS)[number]; repaid: string }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[22px] p-5 shadow-[0_24px_60px_rgba(41,45,54,0.2)] md:p-8" style={{ backgroundColor: r.bg, color: r.fg }}>
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
        <p className="font-display text-[11px] font-bold uppercase leading-[15px] tracking-[0.12em] opacity-72 md:text-[13px] md:leading-[16px]">{r.by}</p>
        <p className="shrink-0 font-display text-[11px] font-bold leading-[15px] opacity-56 md:text-[13px] md:leading-[16px]">{r.date}</p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="whitespace-nowrap font-display text-[40px] font-extrabold leading-[0.9] tracking-[-0.045em] tabular-nums md:text-[56px] xl:text-[64px]" style={{ color: r.accent }}>
          {r.big || repaid}
        </p>
        <p className="max-w-[220px] font-display text-[14px] font-bold leading-[19px] opacity-88 md:text-[17px] md:leading-[24px]">{r.line}</p>
      </div>
    </div>
  );
}

export function ClearResources() {
  const s = useRangDeStats();
  const repaid = `${s.principalRepaidPct.toFixed(1)}%`;
  return (
    <section id="f-resources" className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-white px-4 py-20 sm:px-8 md:gap-16 md:py-28">
      <Rise>
        <Head>Read the numbers yourself.</Head>
      </Rise>
      <ul className="grid w-full max-w-[1240px] gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map((rep, i) => (
          <li key={rep.title}>
            <Rise delay={i * 0.08} className="flex flex-col gap-4">
              <div className="h-[230px] md:h-[280px]">
                <ReportCard r={rep} repaid={repaid} />
              </div>
              <p className="font-display text-[18px] font-bold leading-[1.2] tracking-[-0.01em] text-ink md:text-[20px]">{rep.title}</p>
              <p className="font-display text-[14px] font-medium leading-[21px] text-ink/64 md:text-[15px] md:leading-[22px]">{rep.finding}</p>
              {rep.href ? (
                <a href={rep.href} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 font-display text-[14px] font-bold underline decoration-ink/24 underline-offset-4 hover:decoration-ink md:text-[15px]" style={{ color: GREEN_DARK }}>
                  Read the report <span aria-hidden>↗</span>
                </a>
              ) : (
                <span className="font-display text-[13px] font-medium text-ink/48">Published by NABARD, July 2026</span>
              )}
            </Rise>
          </li>
        ))}
      </ul>
    </section>
  );
}
