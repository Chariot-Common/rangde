"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { LinkButton, SIGNUP_URL } from "./ui";
import { HowItWorksStage } from "@/components/how-it-works/HowItWorksStage";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";
import { CreditGrowsScene } from "./CreditGrowsScene";
import { EASE } from "./WhyRealStory";

/*
 * /v/why, "One thread", second pass (20 Nov 2026 review: lighter headings, tighter spacing, a real-looking how-it-works,
 * a calmer risk note).
 *   Headings follow the other versions: bold (700), not black; no heavy negative tracking; a two-tone pair (ink, then
 *   grey). realfood.gov does the same at 700 with normal tracking.
 *   Only two sections pin (the problem, how it works), each about 1.7–2 screens of scroll.
 * The problem's line art is a stand-in borrowed from the how-it-works story until the files in
 * docs/why-thread-line-art-prompts.md arrive.
 */

const DEEP = "#1F3F0B";
const GREEN = "#3a6e0c";
const LIME = "#D9E89A";
const PAPER = "#F7F3ED";
const INK = "#292D36";
const RED = "#E32642";

const HEAD = "font-display font-bold tracking-[-0.02em] leading-[1.06] [text-wrap:balance]";
const H2 = `${HEAD} text-[32px] md:text-[48px] lg:text-[56px]`;
const SUB = "font-display text-[15px] font-medium leading-[22px] md:text-[17px] md:leading-[26px]";
const SECTION = "mx-2 rounded-[24px] px-4 py-16 sm:px-6 md:py-24 lg:px-8";
const WIDE = "mx-auto w-full max-w-[1400px]";
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const span = (v: number, a: number, b: number) => clamp((v - a) / (b - a));


/** A two-line heading (first line ink or white, second greyed) whose lines rise out of a mask one after the other as it
 * comes into view (after rangde.org's and dwell.au's headings). */
function Lines({ a, b, className, grey }: { a: ReactNode; b?: ReactNode; className: string; grey: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const on = useInView(ref, { once: true, amount: 0.6 });
  const line = (content: ReactNode, i: number, extra?: string) => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span className={`block ${extra ?? ""}`} initial={reduce ? false : { y: "105%" }} animate={on || reduce ? { y: "0%" } : undefined} transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}>
        {content}
      </motion.span>
    </span>
  );
  return (
    <h2 ref={ref} className={className}>
      {line(a, 0)}
      {b && line(b, 1, grey)}
    </h2>
  );
}

function usePin() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return { ref, p: scrollYProgress };
}
const STICKY = "sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col";
const CREAM = "#F3EFD8";

/** One letter of a heading that comes in from a blur as `p` passes its slot (after realfood.gov's "can solve this crisis"). */
/** Splits a line into words (kept whole, so a line never breaks inside a word) and the words into letters. */
function byWord(text: string, render: (ch: string, index: number) => ReactNode) {
  let n = 0;
  return text.split(" ").map((word, w, all) => (
    <span key={w} className="inline-block whitespace-nowrap">
      {word.split("").map((ch) => render(ch, n++))}
      {w < all.length - 1 && render(" ", n++)}
    </span>
  ));
}

function BlurChar({ ch, p, at }: { ch: string; p: MotionValue<number>; at: number }) {
  const t = useTransform(p, (v) => span(v, at, at + 0.06));
  const filter = useTransform(t, (v) => `blur(${(1 - v) * 12}px)`);
  const opacity = useTransform(t, (v) => 0.08 + 0.92 * v);
  return (
    <motion.span className="inline-block whitespace-pre" style={{ filter, opacity }}>
      {ch}
    </motion.span>
  );
}

/* ── 1 The problem (19 Nov 2026 review: one big centred statement, no layers of headings). Pinned for a little over a
      screen; the words brighten one by one as you scroll, like the turn further down. The first line is in Rang De's own
      words (from their LinkedIn post "Be someone's first yes"); the second is the loop that keeps the bank saying no. ── */

const PROBLEM = [
  { text: "For millions of rural entrepreneurs, the bank never says yes.", color: "#FFFFFF" },
  { text: "No credit history, so no loan. No loan, so no credit history.", color: LIME },
];
const PROBLEM_TEXT = PROBLEM.map((l) => l.text).join(" ");

export function ThreadProblem() {
  const reduce = useReducedMotion();
  const { ref, p: scroll } = usePin();
  const still = useTransform(scroll, () => 1);
  const p = reduce ? still : scroll;
  const total = PROBLEM_TEXT.split(" ").length;
  let n = 0;
  return (
    <section id="c-problem" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: DARK }}>
      <div ref={ref} className={reduce ? "" : "relative h-[180svh]"}>
        <div className={`${reduce ? "flex flex-col py-24" : STICKY} items-center justify-center gap-10 px-4 text-center md:gap-14`}>
          <h2 className={`${HEAD} max-w-[1120px] text-[34px] leading-[1.15] md:text-[56px] lg:text-[64px]`} aria-label={PROBLEM_TEXT}>
            {PROBLEM.map((line) => (
              <span key={line.text} className="block" style={{ color: line.color }}>
                {line.text.split(" ").map((w) => {
                  const i = n++;
                  return <FillWord key={i} w={w} p={p} at={0.08 + (i / total) * 0.6} />;
                })}
              </span>
            ))}
          </h2>
          {/* Source: SIDBI's 2025 survey of 2,097 small businesses (SIDBI & Crisil), as SIDBI reports it: respondents "named
              inadequate documents, limited credit history and the inability to offer collateral" as the main barriers. */}
          <a
            href="https://www.sidbi.in/blog/the-msme-credit-gap-in-india-what-does-the-data-say"
            target="_blank"
            rel="noreferrer"
            className="max-w-[560px] font-display text-[14px] font-medium leading-[21px] underline decoration-current/30 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: "rgba(243,239,216,0.64)" }}
          >
            Small businesses name limited credit history and no collateral among the main barriers to a loan. SIDBI &amp; Crisil, 2025
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── 2 The numbers (19 Nov 2026, option A). Two cards of equal size side by side, with the same gap between them as the
      page's edge. Each answers the next question after "the bank never says yes": where do they borrow, and what does it
      cost them. Each has its own heading, its own kind of picture and one large number, so the two never read as one
      chart:
        Left, lime: "Half of them borrow outside the banks." 100 dots, 49 lit in red (people), 49%.
        Right, light: "It costs more, and builds nothing." ₹100 borrowed against about ₹118 to repay (money), ₹18.
      The pictures play and the numbers count up once each card is on screen. The section stays put once its end reaches
      the bottom of the screen, so "This is why Rang De exists" slides up over it (useStayAtBottom).
      Checked 22 Nov 2026 (NABARD RECSS Round 12, July 2026):
        49%: 23.6% informal only + 25.3% both = 48.9%, of rural households that borrow.
        ₹18: the average interest rate on informal loans is 17.77% a year, so about ₹18 on ₹100 over a year (nearly 20% of
             informal borrowers paid none, which pulls the average down).
      The ₹30 lakh crore credit gap (SIDBI & Crisil) stays in Read the numbers yourself. ─────────────────────────────── */

const DARK = "#1B1D22";

/** 49 of 100 dots light up in red, one after another. */
function DotsPicture({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid w-[200px] grid-cols-10 gap-[6px] md:w-[240px]" role="img" aria-label="49 of every 100 dots are lit.">
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className="aspect-square rounded-full transition-colors duration-300"
          style={{ backgroundColor: on && i < 49 ? RED : "rgba(31,63,11,0.16)", transitionDelay: reduce ? "0ms" : `${i * 14}ms` }}
        />
      ))}
    </div>
  );
}

/** ₹100 borrowed, then the same bar with about ₹18 of interest added on the end. */
function CostPicture({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  const grow = (delay: number) => ({ initial: reduce ? false : { scaleX: 0 }, animate: on || reduce ? { scaleX: 1 } : undefined, transition: { duration: 0.9, delay, ease: EASE } });
  const LABEL = "font-display text-[15px] font-bold text-ink/64";
  const BASE = "rgba(41,45,54,0.18)";
  return (
    <div className="flex w-[260px] flex-col gap-4 md:w-[320px]" role="img" aria-label="Borrow ₹100 informally and repay about ₹118 a year later.">
      <div className="flex flex-col gap-2">
        <p className={LABEL}>Borrow ₹100</p>
        <div className="flex h-[32px] w-full">
          <motion.span className="block h-full origin-left rounded-[6px]" style={{ width: "84.9%", backgroundColor: BASE }} {...grow(0)} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className={LABEL}>Repay about ₹118 a year later</p>
        <div className="flex h-[32px] w-full gap-[3px]">
          <motion.span className="block h-full origin-left rounded-l-[6px]" style={{ width: "84.9%", backgroundColor: BASE }} {...grow(0.2)} />
          <motion.span className="flex h-full origin-left items-center justify-center rounded-r-[6px] font-display text-[12px] font-bold text-white" style={{ width: "15.1%", backgroundColor: RED }} {...grow(0.9)}>
            ₹18
          </motion.span>
        </div>
      </div>
    </div>
  );
}

const CARDS: { id: string; bg: string; fg: string; sub: string; heading: string; picture: (on: boolean) => ReactNode; to: number; prefix?: string; suffix?: string; line: string }[] = [
  {
    id: "informal",
    bg: LIME,
    fg: DEEP,
    sub: "rgba(31,63,11,0.72)",
    heading: "Half of them borrow outside the banks.",
    picture: (on) => <DotsPicture on={on} />,
    to: 49,
    suffix: "%",
    line: "of rural families who borrow go to moneylenders, relatives or friends.",
  },
  {
    id: "cost",
    bg: PAPER,
    fg: INK,
    sub: "rgba(41,45,54,0.64)",
    heading: "It costs more, and builds nothing.",
    picture: (on) => <CostPicture on={on} />,
    to: 18,
    prefix: "₹",
    line: "a year on every ₹100 borrowed informally (17.77% on average). Repaying on time still builds no credit history.",
  },
];

function NumberCard({ c }: { c: (typeof CARDS)[number] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { once: true, amount: 0.45 }) || !!reduce;
  return (
    <li ref={ref} className="flex min-h-[560px] flex-col gap-8 rounded-[24px] p-6 md:min-h-[min(760px,calc(100svh-var(--navbar-bottom,0px)-24px))] md:p-10 lg:p-14" style={{ backgroundColor: c.bg, color: c.fg }}>
      <h3 className={`${HEAD} max-w-[520px] text-[28px] md:text-[36px] lg:text-[44px]`}>{c.heading}</h3>
      <div className="flex items-center">{c.picture(on)}</div>
      <div className="mt-auto flex flex-col gap-3">
        <p className="font-display text-[96px] font-black leading-[0.85] tracking-[-0.05em] tabular-nums md:text-[120px] lg:text-[168px]">
          <CountUp to={c.to} prefix={c.prefix} suffix={c.suffix} on={on} />
        </p>
        <p className="max-w-[480px] font-display text-[17px] font-bold leading-[25px] md:text-[19px] md:leading-[28px]">{c.line}</p>
        <p className="font-display text-[14px] font-medium" style={{ color: c.sub }}>
          NABARD rural survey, July 2026
        </p>
      </div>
    </li>
  );
}

/** Makes a section stay put (under the navigation bar, or with its end at the bottom of the screen if it's taller than the
 * screen), so the next section slides up over it. */
function useStayAtBottom() {
  const ref = useRef<HTMLElement>(null);
  const [top, setTop] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Just under the navigation bar when the section fits on screen; otherwise with its end at the bottom of the screen.
    const set = () => {
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      setTop(Math.min(nav, window.innerHeight - el.offsetHeight));
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, []);
  return { ref, top };
}

export function ThreadEvidence() {
  const { ref, top } = useStayAtBottom();
  return (
    <section ref={ref} id="c-evidence" aria-label="The numbers" className="sticky z-0 mx-2" style={{ top }}>
      <ul className="grid gap-2 md:grid-cols-2">
        {CARDS.map((c) => (
          <NumberCard key={c.id} c={c} />
        ))}
      </ul>
    </section>
  );
}

/* ── The turn (after realfood.gov's "Real Food can solve this crisis."): from the problem to Rang De. Pinned for about
      one screen: the line comes in letter by letter from a blur, then the sentence under it fills from grey to white
      word by word as you scroll. ─────────────────────────────────────────────────────────────────────────────── */

const TURN = "This is why Rang De exists.";
const TURN_TEXT = "Rang De connects rural businesses that need a loan with people who want to lend. Each repayment builds the borrower’s credit history, so the next loan is easier to get. It’s called peer-to-peer lending, and Rang De is registered with the RBI.";

function FillWord({ w, p, at }: { w: string; p: MotionValue<number>; at: number }) {
  const opacity = useTransform(p, (v) => 0.22 + 0.78 * span(v, at, at + 0.04));
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

export function ThreadTurn() {
  const reduce = useReducedMotion();
  const { ref, p: scroll } = usePin();
  const still = useTransform(scroll, () => 1);
  const p = reduce ? still : scroll;
  const words = TURN_TEXT.split(" ");
  const paraIn = useTransform(p, (v) => span(v, 0.3, 0.38));
  const paraY = useTransform(p, (v) => 24 * (1 - span(v, 0.3, 0.38)));
  return (
    <section id="c-turn" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: DEEP }}>
      <div ref={ref} className={reduce ? "" : "relative h-[220svh]"}>
        <div className={`${reduce ? "flex flex-col py-20" : STICKY} items-center justify-center gap-8 px-4 text-center md:gap-12`}>
          <h2 className={`${HEAD} max-w-[1100px] text-[40px] md:text-[72px] lg:text-[88px]`} style={{ color: LIME }} aria-label={TURN}>
            {byWord(TURN, (ch, i) => <BlurChar key={i} ch={ch} p={p} at={0.04 + i * 0.008} />)}
          </h2>
          {/* Only once the line above has fully come in: the sentence rises in, faint, then fills word by word. */}
          <motion.p className="max-w-[880px] font-display text-[20px] font-bold leading-[1.35] text-white md:text-[32px] lg:text-[36px] [text-wrap:balance]" aria-label={TURN_TEXT} style={{ opacity: paraIn, y: paraY }}>
            {words.map((w, i) => (
              <FillWord key={i} w={w} p={p} at={0.4 + (i / words.length) * 0.5} />
            ))}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ── 3 How it works (22 Nov 2026): Version 2's step animations (the real app screens from the how-it-works pop-up, and the
      credit-growth scene), set in this page's design. The section pins; scrolling moves through five steps. Left: the
      heading and the steps on a rail that fills as you go, the open one with its line of detail. Right: a deep-green
      panel filling the screen's height, the step's name on it, and the animation in a white frame. Phones: the heading,
      a five-part progress bar, the open step, then the animation. Each step can be clicked to jump to it. ─────────── */

const HOW = [
  { t: "Rang De checks every borrower", s: "Local partner organisations meet every borrower and check their business before the loan is listed." },
  { t: "You choose who to lend to", s: "Each profile says who they are, what the loan is for and how they plan to repay it." },
  { t: "Your money reaches them", s: "Rang De collects your money on the 1st or 15th. Within 24 hours, it’s in their bank account." },
  { t: "Repayments come back to you", s: "They repay every month, and you see each repayment and what you’ve earned in one place." },
  { t: "Their credit history grows", s: "Each repayment is reported to the credit bureaus that banks check." },
];

/** The five step animations (Version 2's app screens, then the credit-growth scene) stacked edge to edge in one tall
 * strip inside a plain white card, with no frame around it. Scrolling glides the strip from one animation to the next:
 * each holds while its step is open and slides on as the step changes, eased by a spring so it never jumps. Only the
 * animations next to the one in view are mounted, so each starts playing as it slides in. (19 Nov 2026, after a
 * Pinterest reference.) */
function HowStrip({ p, at }: { p: MotionValue<number>; at: number }) {
  const reduce = useReducedMotion();
  const n = HOW.length;
  const target = useTransform(p, (v) => {
    const x = Math.min(n - 1, Math.max(0, v * n - 0.5));
    const k = Math.floor(x);
    const f = x - k;
    const e = f < 0.2 ? 0 : f > 0.8 ? 1 : (1 - Math.cos(((f - 0.2) / 0.6) * Math.PI)) / 2;
    return k + e;
  });
  const pos = useSpring(target, { stiffness: 140, damping: 28, mass: 0.6 });
  const [near, setNear] = useState(0);
  useMotionValueEvent(pos, "change", (v) => setNear(Math.round(v)));
  const y = useTransform(pos, (v) => `${(-v / n) * 100}%`);
  const shown = reduce ? at : near;
  return (
    <div className="relative mx-auto aspect-[374/342] w-[84%] self-center overflow-hidden rounded-[24px] bg-white shadow-6 md:w-[min(100%,calc((100svh-var(--navbar-bottom,0px)-96px)*1.0936))]">
      <motion.ul className="absolute inset-x-0 top-0 flex flex-col" style={{ height: `${n * 100}%`, y: reduce ? `${(-at / n) * 100}%` : y }}>
        {HOW.map((h, i) => (
          <li key={h.t} className="relative flex-1 border-b border-ink/8 last:border-b-0" aria-hidden={i !== at || undefined}>
            {Math.abs(i - shown) <= 1 &&
              (i < HOW_IT_WORKS_STEPS.length ? (
                <HowItWorksStage stepIndex={i} label={HOW_IT_WORKS_STEPS[i].illustrationLabel} />
              ) : (
                <div role="img" aria-label="A borrower's repayments tick in month by month and her credit score rises; then new possibilities open up: a bigger loan, new machinery, more clients." className="size-full">
                  <CreditGrowsScene />
                </div>
              ))}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function ThreadHow() {
  const reduce = useReducedMotion();
  const { ref, p } = usePin();
  const [at, setAt] = useState(0);
  useMotionValueEvent(p, "change", (v) => setAt(Math.min(HOW.length - 1, Math.floor(v * HOW.length))));
  const rail = useTransform(p, (v) => (reduce ? 1 : v));
  const go = (i: number) => {
    const el = ref.current;
    if (reduce || !el) return setAt(i);
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.5) / HOW.length) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <section id="c-how" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: PAPER }}>
      <div ref={ref} className={reduce ? "" : "relative h-[340svh]"}>
        <div className={`${reduce ? "py-10" : STICKY} grid w-full gap-4 p-3 md:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] md:gap-3`}>
          {/* Left: heading and the steps. */}
          <div className="flex min-h-0 flex-col justify-between gap-4 px-2 pt-4 md:px-6 md:py-8">
            <Lines className={`${H2} text-ink`} a="How it works." b={"You choose. Rang\u00a0De does the rest."} grey="text-ink/48" />

            <ol className="relative hidden flex-col pl-7 md:flex">
              <span className="absolute bottom-3 left-[5px] top-3 w-[2px] rounded-full bg-ink/10" aria-hidden />
              <motion.span className="absolute left-[5px] top-3 w-[2px] origin-top rounded-full" style={{ height: "calc(100% - 24px)", scaleY: rail, backgroundColor: GREEN }} aria-hidden />
              {HOW.map((h, i) => (
                <li key={h.t} className="relative py-2.5">
                  <span className="absolute -left-7 top-[17px] size-3 rounded-full border-2 transition-colors duration-300" style={{ borderColor: i <= at ? GREEN : "rgba(41,45,54,0.2)", backgroundColor: i <= at ? GREEN : PAPER }} aria-hidden />
                  <button type="button" onClick={() => go(i)} aria-current={i === at ? "step" : undefined} className="text-left font-display text-[18px] font-bold leading-[1.25] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-dark lg:text-[22px]" style={{ color: i === at ? INK : "rgba(41,45,54,0.36)" }}>
                    {h.t}
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${i === at ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <p className="overflow-hidden font-display text-[15px] font-medium leading-[22px] text-ink/64 lg:text-[16px] lg:leading-[24px]">
                      <span className="block max-w-[420px] pt-1.5">{h.s}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Phones: progress, then the open step. */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex gap-1.5">
                {HOW.map((h, i) => (
                  <button key={h.t} type="button" onClick={() => go(i)} aria-label={`Step ${i + 1}: ${h.t}`} className="h-[4px] flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: i <= at ? GREEN : "rgba(41,45,54,0.12)" }} />
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={at} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <p className="font-display text-[18px] font-bold leading-[1.25] text-ink">
                    <span style={{ color: GREEN }}>{at + 1}</span> {HOW[at].t}
                  </p>
                  <p className="mt-1 font-display text-[14px] font-medium leading-[20px] text-ink/64">{HOW[at].s}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: the step animations in one strip that glides on as you scroll (see HowStrip). */}
          <HowStrip p={p} at={at} />
        </div>
      </div>
    </section>
  );
}

/* ── 4 One loan, three good things: three white cards that stack as you scroll (the second slides over the first), each with a
      photo, then the risk as a calm note at reading size. ────────────────────────────────────────────────────────── */

const DOES = [
  { t: "It funds a business.", s: "Your money becomes part of a rural business owner’s loan.", img: "/images/collage/collage-10.webp", chip: "Loan funded" },
  { t: "It can earn you interest.", s: "Your money comes back as they repay, with interest on top.", img: "/images/collage/collage-13.webp", chip: "Repayment received" },
  { t: "It builds their credit.", s: "Each loan repaid on time adds to their credit history. Next time a bank asks, the answer isn’t “None yet.”", img: "/images/collage/collage-07.webp", chip: "Credit history building" },
];

export function ThreadMoney() {
  return (
    <section id="c-compare" className={SECTION} style={{ backgroundColor: DEEP }}>
      <div className={`${WIDE} flex flex-col gap-8 md:gap-12`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Lines className={`${H2} text-white`} a="One loan, three good things." grey="" />
          <p className={`${SUB} max-w-[520px] text-white/64`}>Rang De calls this social investment: lending that does good and can earn you interest.</p>
        </div>
        <ul className="flex flex-col">
          {DOES.map((d, i) => (
            <li
              key={d.t}
              className="sticky mb-3 grid overflow-hidden rounded-[24px] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.25)] md:mb-4 md:grid-cols-[5fr_7fr]"
              style={{ top: `calc(var(--navbar-bottom,0px) + ${32 + i * 20}px)` }}
            >
              <div className="flex flex-col justify-center gap-4 p-6 md:p-14">
                <span className="font-display text-[14px] font-bold tabular-nums" style={{ color: GREEN }}>
                  {i + 1} of {DOES.length}
                </span>
                <p className={`${HEAD} text-[28px] text-ink md:text-[48px]`}>{d.t}</p>
                <p className={`${SUB} max-w-[380px] text-ink/64`}>
                  {d.s}
                </p>
              </div>
              <div className="relative h-[200px] md:h-auto md:min-h-[min(540px,62svh)]">
                <Image src={d.img} alt="" fill sizes="(min-width: 768px) 520px, 100vw" className="object-cover" />
                <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-display text-[13px] font-bold text-ink shadow-[0_6px_16px_rgba(41,45,54,0.16)]">
                  <span className="flex size-[18px] items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: LIME, color: DEEP }}>
                    ✓
                  </span>
                  {d.chip}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {/* What to expect: the terms a lender asks about first, read together with the risk note under them. All from
            Rang De's own pages (22 Nov 2026): returns and the ₹500 / ₹50,000 limits from the FAQs; loan lengths from the loans listed
            on /invest/individuals that day (6, 12 and 18 months, repaid monthly); fees from the Pricing Structure Policy
            (compliance fee up to 4% of amounts invested manually, a yearly plan up to ₹999 where it applies). */}
        <div className="flex flex-col gap-3">
          <p className="font-display text-[15px] font-bold text-white/72 md:text-[17px]">What to expect</p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { big: "Up to 8.5%", line: "a year in interest, depending on the loan" },
              { big: "6–18 months", line: "how long today’s loans run, repaid monthly" },
              { big: "From ₹500", line: "to start; up to ₹50,000 with any one borrower" },
              { big: "Up to 4%", line: "fee on loans you choose yourself. Yearly plans: up to ₹999." },
            ].map((t) => (
              <li key={t.big} className="flex flex-col gap-1 rounded-[16px] p-4 md:p-5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <p className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-[28px]">{t.big}</p>
                <p className="font-display text-[13px] font-medium leading-[19px] text-white/64 md:text-[14px]">{t.line}</p>
              </li>
            ))}
          </ul>
          <a href="https://rangde.in/pricing-structure-policy" target="_blank" rel="noreferrer" className="w-fit font-display text-[13px] font-bold text-white/72 underline decoration-white/32 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            See the full pricing policy<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="flex items-start gap-3 rounded-[16px] bg-white px-5 py-4">
          <Icon name="info" size={20} className="mt-0.5" />
          <p className={`${SUB} text-ink/72`}>Like any loan, repayment isn’t guaranteed. If a borrower can’t repay, you could lose part of what you lent.</p>
        </div>
      </div>
    </section>
  );
}

/* ── 5 Proof: the heading stays on the left with the button; cards scroll up on the right. ─────────────────────── */

/** One proof figure: the card rises in, and its number counts up from zero while it does. */
function ProofCard({ to, prefix = "", suffix = "", line, bg, fg }: { to: number; prefix?: string; suffix?: string; line: string; bg: string; fg: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  return (
    <motion.li
      ref={ref}
      className="flex min-h-[160px] flex-col justify-end gap-1 rounded-[20px] p-6 md:min-h-[220px] md:p-8"
      style={{ backgroundColor: bg, color: fg }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={on || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <p className={`${HEAD} whitespace-nowrap text-[48px] tabular-nums md:text-[72px]`}>
        <CountUp to={to} prefix={prefix} suffix={suffix} on={on || !!reduce} />
      </p>
      <p className="font-display text-[15px] font-bold md:text-[18px]">{line}</p>
    </motion.li>
  );
}

export function ThreadProof() {
  const s = useRangDeStats();
  return (
    <section id="c-proof" className={`${SECTION} bg-white`}>
      <div className={`${WIDE} grid gap-8 md:grid-cols-[5fr_7fr] md:gap-12`}>
        <div className="flex flex-col items-start gap-4 self-start md:sticky md:top-[calc(var(--navbar-bottom,0px)+48px)]">
          <Lines className={`${H2} text-ink`} a="It’s already working." b="You wouldn’t be lending alone." grey="text-ink/48" />
          <p className={`${SUB} text-ink/64`}>Live figures. Rang De is registered with the RBI.</p>
          <div className="mt-2 max-sm:hidden">
            <LinkButton href={SIGNUP_URL}>Start lending</LinkButton>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          <ProofCard to={Math.round(s.disbursedCr)} prefix="₹" suffix=" Cr" line="lent through Rang De since 2019" bg={DEEP} fg="#fff" />
          <ProofCard to={s.entrepreneurs} line="loans to rural businesses" bg={LIME} fg={DEEP} />
          <ProofCard to={s.investors} line={`people lending, ${s.investorsAbroad.toLocaleString("en-IN")} of them from outside India`} bg={PAPER} fg={INK} />
        </ul>
      </div>
    </section>
  );
}

/* ── The lenders (22 Nov 2026, in place of the Instagram reels): who is lending, from the live feed, as one big line that
      counts up, two plain facts and the button. ───────────────────────────────────────────────────────────────── */

export function ThreadLenders() {
  const s = useRangDeStats();
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { once: true, amount: 0.4 });
  const inIndia = s.investors - s.investorsAbroad;
  return (
    <section ref={ref} id="c-lenders" className={`${SECTION} text-white`} style={{ backgroundColor: DEEP }}>
      <div className={`${WIDE} grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-12`}>
        <div className="flex flex-col gap-5">
          <h2 className={`${HEAD} text-[40px] md:text-[64px] lg:text-[80px]`}>
            Join <span style={{ color: LIME }}><CountUp to={s.investors} on={on} /></span> people
            <span className="block">lending on Rang De.</span>
          </h2>
          <p className={`${SUB} max-w-[520px] text-white/72`}>People across India, and Indians abroad, lend to rural businesses through Rang De.</p>
          <div className="mt-2 max-sm:hidden">
            <LinkButton href={SIGNUP_URL}>Start lending</LinkButton>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {[
            { big: inIndia, line: "lend from across India" },
            { big: s.investorsAbroad, line: "lend from outside India" },
          ].map((f) => (
            <li key={f.line} className="flex flex-col gap-1 rounded-[20px] p-5 md:p-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <p className={`${HEAD} text-[32px] md:text-[44px]`} style={{ color: LIME }}>
                <CountUp to={f.big} on={on} />
              </p>
              <p className="font-display text-[14px] font-bold text-white/80 md:text-[16px]">{f.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Read the numbers yourself (22 Nov 2026): one card per source, each with the figure it gives, a small chart drawn
      from that source's own numbers (so the picture is as exact as the text), one line of what it found, and a link to
      the report itself. The charts draw in when the card comes into view.
        NABARD RECSS (July 2026): of rural households that borrowed, 51% used formal lenders only, 23.6% informal only,
          25.3% both. Average informal rate 17.77%. Link: NABARD's publications page (the 2026 PDFs aren't indexed).
        SIDBI & Crisil (May 2025): addressable credit gap ≈ 24% of finance demand, ≈ ₹30 lakh crore; 2,097 MSMEs, 19
          sectors. Link: SIDBI's own summary (the report's PDF link redirects to SIDBI's home page).
        TransUnion CIBIL & SIDBI, MSME Pulse (July 2026): 3.6 crore of 8.7 crore registered MSMEs have accessed formal
          credit (41%). Link: the report PDF.
        Rang De: lent and repaid since 2019, from the live feed. ─────────────────────────────────────────────────── */

type Seg = { v: number; c: string; label: string };

/** One part of a split bar: grows from the left with the scroll, its percentage counting up under it. */
function Part({ sg, p, a, b }: { sg: Seg; p: MotionValue<number>; a: number; b: number }) {
  const t = useTransform(p, (v) => span(v, a, b));
  const eased = useTransform(t, (v) => 1 - Math.pow(1 - v, 3));
  const label = useTransform(eased, (v) => `${(v * sg.v).toFixed(sg.v % 1 ? 1 : 0)}%`);
  const textOpacity = useTransform(t, (v) => 0.2 + 0.8 * v);
  return (
    <div className="flex min-w-0 flex-col gap-1.5" style={{ width: `${sg.v}%` }}>
      <motion.span className="block h-[16px] origin-left rounded-[4px]" style={{ backgroundColor: sg.c, scaleX: eased }} />
      <motion.span className="font-display text-[12px] font-bold leading-[15px] text-ink/72" style={{ opacity: textOpacity }}>
        <motion.span className="tabular-nums">{label}</motion.span>
        <span className="block font-medium text-ink/56">{sg.label}</span>
      </motion.span>
    </div>
  );
}

/** A bar split into parts, each labelled right under its own part, the parts growing one after another as you scroll. */
function Stacked({ segs, p }: { segs: Seg[]; p: MotionValue<number> }) {
  return (
    <div className="flex w-full gap-[3px]">
      {segs.map((sg, i) => (
        <Part key={sg.label} sg={sg} p={p} a={0.15 + i * 0.22} b={0.45 + i * 0.22} />
      ))}
    </div>
  );
}

function CountUp({ to, decimals = 0, on, prefix = "", suffix = "" }: { to: number; decimals?: number; on: boolean; prefix?: string; suffix?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useMotionValueEvent(mv, "change", setV);
  useEffect(() => {
    if (!on) return;
    if (reduce) {
      mv.set(to);
      return;
    }
    const a = animate(mv, to, { duration: 1.1, ease: EASE });
    return () => a.stop();
  }, [on, reduce, to, mv]);
  const fmt = (n: number) => `${prefix}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  // Screen readers get the real figure; the counting is for the eye only.
  return (
    <span className="tabular-nums">
      <span aria-hidden>{fmt(v)}</span>
      <span className="sr-only">{fmt(to)}</span>
    </span>
  );
}

function SourceCard({ i, q, big, line, chart, note, by, href, linkText }: { i: number; q: string; big: (on: boolean) => ReactNode; line: string; chart: (p: MotionValue<number>) => ReactNode; note?: string; by: string; href: string; linkText: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const live = on || !!reduce;
  // The chart follows the scroll: it starts as the card's top enters the screen and is complete by the time the card's
  // bottom is a little above the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end 0.6"] });
  const chartP = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  return (
    <motion.li
      ref={ref}
      className="flex flex-col gap-5 rounded-[24px] bg-white p-6 md:p-7"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={live ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
    >
      <p className="font-display text-[18px] font-bold leading-[1.25] text-ink md:text-[20px]">{q}</p>
      <div className="flex flex-col gap-1">
        <p className={`${HEAD} whitespace-nowrap text-[38px] md:text-[40px]`} style={{ color: GREEN }}>
          {big(live)}
        </p>
        <p className="font-display text-[15px] font-medium leading-[22px] text-ink/72">{line}</p>
      </div>
      {chart(chartP)}
      {note && <p className="font-display text-[13px] font-medium leading-[19px] text-ink/56">{note}</p>}
      <div className="mt-auto flex flex-col gap-3 border-t border-ink/8 pt-4">
        <p className="font-display text-[12px] font-bold text-ink/48">{by}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-ink/12 px-4 py-2 font-display text-[14px] font-bold text-ink transition-colors hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark"
        >
          {linkText}
          <span aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </motion.li>
  );
}

export function ThreadSources() {
  const s = useRangDeStats();
  const repaidShare = Math.round((s.repaidCr / s.disbursedCr) * 100);
  return (
    <section id="f-resources" className={SECTION} style={{ backgroundColor: PAPER }}>
      <div className={`${WIDE} flex flex-col gap-8 md:gap-12`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Lines className={`${H2} text-ink`} a="Read the numbers yourself." b="Every figure, with its source." grey="text-ink/48" />
        </div>
        <ol className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          <SourceCard
            i={0}
            q="Where do rural families borrow from?"
            big={(on) => <CountUp to={49} suffix="%" on={on} />}
            line="of those who borrow take at least some informal loans."
            chart={(p) => (
              <Stacked
                p={p}
                segs={[
                  { v: 51, c: GREEN, label: "Formal lenders only" },
                  { v: 25.3, c: "#B81C33", label: "Both" },
                  { v: 23.6, c: RED, label: "Informal only" },
                ]}
              />
            )}
            by="NABARD rural survey, July 2026"
            href="https://www.nabard.org/Publication.aspx?cid=507&id=24"
            linkText="NABARD’s reports"
          />
          <SourceCard
            i={1}
            q="How much credit do small businesses miss out on?"
            big={(on) => <CountUp to={30} prefix="₹" suffix=" lakh cr" on={on} />}
            line="about a quarter of the finance they need."
            chart={(p) => (
              <Stacked
                p={p}
                segs={[
                  { v: 76, c: GREEN, label: "Met by formal lenders" },
                  { v: 24, c: RED, label: "Not met" },
                ]}
              />
            )}
            note="An estimate, from a survey of 2,097 small businesses in 19 sectors."
            by="SIDBI & Crisil, May 2025"
            href="https://www.sidbi.in/blog/the-msme-credit-gap-in-india-what-does-the-data-say"
            linkText="SIDBI’s summary"
          />
          <SourceCard
            i={2}
            q="What do informal loans cost?"
            big={(on) => <CountUp to={17.77} decimals={2} suffix="%" on={on} />}
            line="a year on average. Repaying on time still builds no credit history."
            chart={(p) => <Stacked p={p} segs={[{ v: 17.77, c: RED, label: "Average a year" }]} />}
            note="The average includes interest-free loans from family and friends."
            by="NABARD rural survey, July 2026"
            href="https://www.nabard.org/Publication.aspx?cid=507&id=24"
            linkText="NABARD’s reports"
          />
          <SourceCard
            i={3}
            q="Do loans on Rang De get repaid?"
            big={(on) => <CountUp to={Math.round(s.repaidCr)} prefix="₹" suffix=" Cr" on={on} />}
            line={`repaid to lenders, of ₹${s.disbursedCr.toFixed(0)} Cr lent since 2019.`}
            chart={(p) => (
              <Stacked
                p={p}
                segs={[
                  { v: repaidShare, c: GREEN, label: "Repaid" },
                  { v: 100 - repaidShare, c: "rgba(41,45,54,0.24)", label: "Still due" },
                ]}
              />
            )}
            note="Repayment isn’t guaranteed: some loans are late, and some aren’t repaid."
            by="Rang De, live figures"
            href="https://rangde.imgix.net/docs/rang-de-annual-report-2024-25.pdf"
            linkText="Annual report 2024–25 (PDF)"
          />
        </ol>
      </div>
    </section>
  );
}

/* ── The close (25 Nov 2026): the page ends where it began. The problem section's line, "The business is ready. The loan
      isn't.", comes back on the same deep green, now answered, with the one button. ─────────────────────────────── */

export function ThreadClose() {
  return (
    <section id="c-close" className={`${SECTION} text-center`} style={{ backgroundColor: DEEP, color: CREAM }}>
      <div className={`${WIDE} flex flex-col items-center gap-8`}>
        <Lines className={H2} a="The business is ready." b={<span style={{ color: LIME }}>Now the loan can be.</span>} grey="" />
        <LinkButton href={SIGNUP_URL}>Start lending</LinkButton>
      </div>
    </section>
  );
}
