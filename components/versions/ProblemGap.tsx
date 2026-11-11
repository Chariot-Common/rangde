"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RangDeStats } from "@/lib/stats";

/*
 * Version 1's problem and solution (Figma "Rang De Master Design III", node 3020:62), in place of the before → after
 * pairs. Two buckets: the problem, and how Rang De closes the gap.
 *
 * Laptops and tablets: one pinned section. On the grey: "The financial system wasn't built for the businesses of rural
 * India" on its own, then the two problem cards come in, one after the other. Scrolling on, the background turns green,
 * the heading becomes "Here's how Rang De closes the gap.", the problem cards fall back (blurred, faded) and the two
 * solution cards land over them, one after the other: the answer sitting on top of the problem it answers.
 * Phones: the same two panels one after the other (grey, then green), each card rising in as it comes into view.
 *
 * Copy as in the Figma; the solution card's figures are live (entrepreneurs funded, ₹ crore lent). Type on the page's own
 * scale (review, 11 Nov 2026), so it sits with the sections around it: the heading H3, card titles H4, points P2 in ink 64
 * (P1 on very large screens), sources P4; the title and points in a centred column of steady width inside each card.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREY_BG = "#f1f2f5";
const GREEN_BG = "#cbe0b8";

type Card = { title: ReactNode; points: ReactNode[]; note?: string };

const PROBLEMS: Card[] = [
  {
    title: "86% of India’s eligible population can’t get bank loans",
    points: [
      "Banks ask for land or property as collateral. Rural entrepreneurs often have none in their name.",
      "First-time borrowers have no credit history, so a bank has nothing to judge them on.",
      "Only about 12% of Indian adults borrowed from a bank or formal lender in 2021.¹",
    ],
    note: "¹ World Bank Global Findex, 2021",
  },
  {
    title: "Informal loans are expensive and don’t build a credit score",
    points: [
      "Nearly half of rural households rely on informal lenders like moneylenders.²",
      "Informal loans in rural India average 17% / yr — reducing the growth they were meant to fuel.²",
      "Moneylender repayments aren’t recorded. Years of repaying still leave no credit score.",
    ],
    note: "² NABARD Rural Economic Conditions & Sentiments Survey, Jul 2026",
  },
];

const solutionsFor = (stats?: RangDeStats): Card[] => [
  {
    title: (
      <>
        Personal &amp; accessible –<br />
        no land or credit history needed
      </>
    ),
    points: [
      "A local partner visits the business and vets the borrower in person.",
      "The business and the person behind it are assessed on the ground, not on paper.",
      stats
        ? `${stats.entrepreneurs.toLocaleString("en-IN")} entrepreneurs have been funded over ₹${stats.disbursedCr.toFixed(2)} cr so far, across rural India.`
        : "31,849 entrepreneurs have been funded over ₹124.11 cr so far, across rural India.",
    ],
  },
  {
    title: "Fair interest, and repayments that build a credit score",
    points: [
      "Social investors fund the loan directly, so borrowers don’t have to turn to a moneylender.",
      "Interest of only up to 8.5% a year, with no hidden charges and appropriate repayment options",
      "Every repayment is reported to the credit bureaus, opening them up to formal credit in the future",
    ],
  },
];

const HEAD_PROBLEM = (
  <>
    The financial system wasn’t built
    <br />
    for the businesses of rural India
  </>
);
const HEAD_SOLUTION = "Here’s how Rang De closes the gap.";

const PHONE = "(max-width: 767px)";

export function ProblemGap({ stats }: { stats?: RangDeStats }) {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(PHONE);
    const on = () => setPhone(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  const solutions = solutionsFor(stats);
  return phone ? <Stacked solutions={solutions} /> : <Pinned solutions={solutions} />;
}

/* ───────────── Laptops and tablets: pinned ───────────── */

// Through the pinned scroll, 0 → 1.
// First the heading alone in the middle of the screen; then it moves up to its place and the problem cards scroll up
// from below into theirs (review, 11 Nov 2026).
const T = {
  headUp: [0.03, 0.14],
  problem1: [0.1, 0.24],
  problem2: [0.17, 0.31],
  turn: [0.42, 0.52], // green, heading swap, problems fall back
  solution1: [0.52, 0.64],
  solution2: [0.6, 0.72],
} as const;

function Pinned({ solutions }: { solutions: Card[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const turn = useTransform(scrollYProgress, [...T.turn], [0, 1], { clamp: true });
  const bg = useTransform(turn, [0, 1], [GREY_BG, GREEN_BG]);
  const [green, setGreen] = useState(false);
  useMotionValueEvent(turn, "change", (v) => setGreen(v > 0.5));
  // The problems fall back as the background turns (blurred and faded), then fade away entirely as the answers land
  // over them.
  const blur = useTransform(turn, (v) => `blur(${v * 6}px)`);
  const fade = useTransform(scrollYProgress, [T.turn[0], T.turn[1], T.solution2[1]], [1, 0.35, 0], { clamp: true });

  // How far the heading sits below its place to begin with, so it starts in the middle of the screen.
  const stageRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [drop, setDrop] = useState(0);
  // How far the heading and the cards together run past the bottom of the screen once the cards are in (on shorter
  // screens): the whole group moves up by that much as the cards come in, so the cards are always seen whole.
  const [lift, setLift] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    const head = headRef.current;
    if (!stage || !head) return;
    const measure = () => {
      const st = stage.getBoundingClientRect();
      const top = head.offsetTop; // its place in the stage, ignoring the transform
      setDrop(Math.max(0, st.height / 2 - (top + head.offsetHeight / 2)));
      const group = groupRef.current;
      if (group) setLift(Math.max(0, group.offsetTop + group.offsetHeight + 16 - stage.clientHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);
  const up = useTransform(scrollYProgress, [...T.headUp], [0, 1], { clamp: true });
  const headY = useTransform(up, (v) => (1 - v * v * (3 - 2 * v)) * drop);
  const lifting = useTransform(scrollYProgress, [T.problem1[0], T.problem2[1]], [0, 1], { clamp: true });
  const groupY = useTransform(lifting, (v) => -v * lift);

  return (
    <div ref={ref} className="relative mx-2" style={{ height: reduce ? "auto" : "calc(4 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <motion.section
        ref={stageRef}
        aria-label="The problem, and how Rang De closes the gap"
        // The heading at the top and the cards filling the rest of the screen under it (review, 11 Nov 2026: the cards sat
        // small in the middle of a laptop screen). On short screens the cards keep their content height and the group
        // lifts to show them whole (`lift`).
        className={`${reduce ? "" : "sticky"} flex flex-col items-center gap-8 overflow-hidden rounded-[16px] px-4 py-[clamp(24px,5svh,80px)] lg:px-8 xl:gap-10 2xl:gap-12 [@media(max-height:820px)]:gap-5`}
        style={{ top: "var(--navbar-bottom, 0px)", height: reduce ? "auto" : "calc(100svh - var(--navbar-bottom, 0px))", backgroundColor: reduce ? GREY_BG : bg }}
      >
        <motion.div ref={groupRef} className="flex w-full flex-1 flex-col items-center gap-[clamp(20px,4svh,48px)]" style={reduce ? undefined : { y: groupY }}>
        {/* The heading: the problem, then (crossfading) the way Rang De closes the gap. */}
        <motion.div ref={headRef} className="relative z-10 grid place-items-center text-center" style={reduce ? undefined : { y: headY }}>
          <motion.h2
            className="col-start-1 row-start-1 font-display text-h3 font-bold text-ink [text-wrap:balance] [@media(max-height:820px)]:text-[32px] [@media(max-height:820px)]:leading-[40px]"
            initial={false}
            animate={{ opacity: green && !reduce ? 0 : 1, y: green && !reduce ? -10 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {HEAD_PROBLEM}
          </motion.h2>
          {!reduce && (
            <motion.p
              aria-hidden={!green}
              className="col-start-1 row-start-1 font-display text-h3 font-bold text-ink [text-wrap:balance] [@media(max-height:820px)]:text-[32px] [@media(max-height:820px)]:leading-[40px]"
              initial={false}
              animate={{ opacity: green ? 1 : 0, y: green ? 0 : 10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {HEAD_SOLUTION}
            </motion.p>
          )}
        </motion.div>

        {/* The cards: the two problems, and the two solutions landing over them. */}
        <div className="relative grid w-full max-w-[1600px] flex-1 grid-cols-2 gap-4">
          {PROBLEMS.map((c, i) => (
            <RiseIn key={i} progress={scrollYProgress} range={i === 0 ? T.problem1 : T.problem2} reduce={!!reduce} filter={blur} opacity={fade}>
              <GapCard card={c} fill={!reduce} />
            </RiseIn>
          ))}
          {!reduce && (
            <div className="absolute inset-0 grid grid-cols-2 gap-4">
              {solutions.map((c, i) => (
                <RiseIn key={i} progress={scrollYProgress} range={i === 0 ? T.solution1 : T.solution2} reduce={false} land>
                  <GapCard card={c} solution fill />
                </RiseIn>
              ))}
            </div>
          )}
        </div>
        </motion.div>
      </motion.section>
      {/* Reduced motion: the solutions as their own green panel, under the problem. */}
      {reduce && <SolutionPanel solutions={solutions} />}
    </div>
  );
}

/** A card rising into place over its stretch of the scroll. `land`: from further down, as the solutions do. The problems
 * also take the shared fall-back (blur and fade) once the background turns. */
function RiseIn({
  children,
  progress,
  range,
  reduce,
  land = false,
  filter,
  opacity,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: readonly [number, number];
  reduce: boolean;
  land?: boolean;
  filter?: MotionValue<string>;
  opacity?: MotionValue<number>;
}) {
  const t = useTransform(progress, [...range], [0, 1], { clamp: true });
  // From well below, so they scroll up into place (the solutions land from a little further still).
  const y = useTransform(t, [0, 1], [land ? 160 : 320, 0]);
  const inOpacity = useTransform(t, [0, 1], [0, 1]);
  const both = useTransform(() => inOpacity.get() * (opacity ? opacity.get() : 1));
  if (reduce) return <div className="h-full">{children}</div>;
  return (
    <motion.div className="h-full" style={{ y, opacity: both, filter }}>
      {children}
    </motion.div>
  );
}

/** A card as in the Figma: a bold title, three points between hairlines, and (for the problems) the source. The
 * solutions are as tall as the problems they land on. `fill` (laptops, pinned): the card is as tall as the room under the
 * heading, so its padding and spacing grow with the screen's height and the title and points sit centred in it, the
 * source pinned to the bottom. */
function GapCard({ card, solution = false, fill = false }: { card: Card; solution?: boolean; fill?: boolean }) {
  // Pinned on laptops: room that grows with the screen's height; elsewhere the Figma's steps.
  const pad = fill ? "px-[clamp(24px,4vw,72px)] py-[clamp(24px,5svh,72px)] [@media(max-height:820px)]:p-6" : "p-8 xl:p-12 2xl:p-16 [@media(max-height:820px)]:p-6";
  const gap = fill ? "gap-[clamp(12px,3.2svh,40px)] [@media(max-height:820px)]:gap-3" : "gap-5 xl:gap-6 2xl:gap-10 [@media(max-height:820px)]:gap-3";
  return (
    <div
      className={`flex h-full flex-col items-center ${solution || fill ? "justify-center" : ""} ${fill ? "gap-[clamp(16px,4svh,48px)]" : "gap-6 xl:gap-8 2xl:gap-12"} rounded-[20px] bg-white text-center [@media(max-height:820px)]:gap-4 ${pad} ${solution ? "shadow-[0_24px_60px_rgba(41,45,54,0.14)]" : ""}`}
    >
      {/* With a source pinned to the bottom (mt-auto), the title takes an auto margin too, so the spare room splits evenly
          above the title and above the source: the content sits centred. */}
      <p className={`${fill && card.note ? "mt-auto" : ""} w-full max-w-[520px] font-display text-h4 font-bold text-ink [text-wrap:balance] [@media(max-height:820px)]:text-[26px] [@media(max-height:820px)]:leading-[32px]`}>{card.title}</p>
      <div className={`flex w-full max-w-[480px] flex-col 2xl:max-w-[560px] ${gap}`}>
        {card.points.map((p, i) => (
          <div key={i} className={`flex flex-col ${gap}`}>
            {i > 0 && <span aria-hidden className="h-px w-full bg-ink/12" />}
            <p className="font-display text-p2 font-medium text-ink/64 [text-wrap:pretty] 2xl:text-p1">{p}</p>
          </div>
        ))}
      </div>
      {card.note && <p className="mt-auto font-display text-p4 font-medium text-ink/48">{card.note}</p>}
    </div>
  );
}

/** Reduced motion and phones: the green panel with its heading and the two solutions. */
function SolutionPanel({ solutions, phone = false }: { solutions: Card[]; phone?: boolean }) {
  return (
    <section aria-label="How Rang De closes the gap" className={`mt-2 flex flex-col items-center gap-8 rounded-[16px] px-4 ${phone ? "py-12" : "py-16"}`} style={{ backgroundColor: GREEN_BG }}>
      <h2 className="text-center font-display text-h3 font-bold text-ink [text-wrap:balance]">{HEAD_SOLUTION}</h2>
      <div className={`grid w-full max-w-[1296px] gap-4 ${phone ? "grid-cols-1" : "grid-cols-2"}`}>
        {solutions.map((c, i) => (
          <InView key={i} index={i}>
            <GapCard card={c} solution />
          </InView>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Phones: the two panels, one after the other ───────────── */

function Stacked({ solutions }: { solutions: Card[] }) {
  return (
    <div className="mx-2 flex flex-col">
      <section aria-label="The problem" className="flex flex-col items-center gap-8 rounded-[16px] px-4 py-12" style={{ backgroundColor: GREY_BG }}>
        <h2 className="text-center font-display text-h3 font-bold text-ink [text-wrap:balance]">{HEAD_PROBLEM}</h2>
        <div className="flex w-full flex-col gap-4">
          {PROBLEMS.map((c, i) => (
            <InView key={i} index={i}>
              <GapCard card={c} />
            </InView>
          ))}
        </div>
      </section>
      <SolutionPanel solutions={solutions} phone />
    </div>
  );
}

function InView({ children, index }: { children: ReactNode; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      animate={reduce || seen ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
