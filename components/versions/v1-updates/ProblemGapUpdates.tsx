"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RangDeStats } from "@/lib/stats";
import { Icon } from "@/components/ui";
import { ScrollInk } from "../ScrollInk";

/*
 * Version 1 updates: the problem and how Rang De closes the gap. Forked from components/versions/ProblemGap.tsx (Version 1)
 * on 25 Nov 2026, with the type, hierarchy and spacing reworked:
 *
 * - The heading a step up on large screens (H3 → H2), so it clearly outranks the card titles (H4). No eyebrow (26 Nov).
 * - Cards read left-aligned: a title, a divider, then the points as a short list, each with its key words in bold so the
 *   card can be skimmed. Points in ink 80 for contrast; sources at the foot in P4.
 * - Spacing on the design system's steps; the cards held to the page width (1240px) instead of the full screen.
 *
 * Laptops and tablets: one pinned section (timeline at `T` below). Each heading gets the same entrance: in the middle of
 * the screen at the hero headline's size, then gliding up to its place and shrinking to its own size before its cards
 * come in. Phones: the two panels one after the other, each card rising in as it comes into view.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREY_BG = "#f1f2f5";
const GREEN_BG = "#cbe0b8";

/** `head`: the card's short header, a few words to skim (26 Nov 2026); `title`: the sentence under it. */
type Card = { head: string; title: ReactNode; points: ReactNode[]; note?: string };

/** The key words in a point. */
const K = ({ children }: { children: ReactNode }) => <strong className="font-bold text-text-grey-80">{children}</strong>; // bold in grey 80, the rest of the point grey 64

const PROBLEMS: Card[] = [
  {
    head: "Few get bank loans",
    title: "86% of India’s eligible population can’t get bank loans",
    points: [
      <>
        Banks ask for <K>land or property as collateral</K>. Rural entrepreneurs often have none in their name.
      </>,
      <>
        First-time borrowers have <K>no credit history</K>, so a bank has nothing to judge them on.
      </>,
      <>
        Only about <K>12% of Indian adults</K> borrowed from a bank or formal lender in 2021.¹
      </>,
    ],
    note: "¹ World Bank Global Findex, 2021",
  },
  {
    head: "Costly loan options",
    title: "Informal loans are expensive and don’t build a credit score",
    points: [
      <>
        <K>Nearly half of rural households</K> rely on informal lenders like moneylenders.²
      </>,
      <>
        Informal loans in rural India average <K>17% a year</K>, reducing the growth they were meant to fuel.²
      </>,
      <>
        Moneylender repayments <K>aren’t recorded</K>. Years of repaying still leave no credit score.
      </>,
    ],
    note: "² NABARD Rural Economic Conditions & Sentiments Survey, Jul 2026",
  },
];

const solutionsFor = (stats?: RangDeStats): Card[] => {
  const funded = stats ? stats.entrepreneurs.toLocaleString("en-IN") : "31,849";
  const crore = stats ? stats.disbursedCr.toFixed(2) : "124.11";
  return [
    {
      head: "On-ground evaluation",
      title: "Personal & accessible: no land or credit history needed", // "no land" kept together
      points: [
        <>
          A local partner visits the business and <K>vets the borrower in person</K>.
        </>,
        <>
          The business and the person behind it are assessed <K>on the ground, not on paper</K>.
        </>,
        <>
          <K>{funded} entrepreneurs</K> have been funded over <K>₹{crore} cr</K> so far, across rural India.
        </>,
      ],
    },
    {
      head: "Fair, affordable loans",
      title: "Fair interest, and repayments that build a credit score",
      points: [
        <>
          Social investors <K>fund the loan directly</K>, so borrowers don’t have to turn to a moneylender.
        </>,
        <>
          Interest of <K>up to 8.5% a year</K>, with no hidden charges and repayment options that fit.
        </>,
        <>
          Every repayment is <K>reported to the credit bureaus</K>, opening the door to formal credit later.
        </>,
      ],
    },
  ];
};

// "Rang De": a non-breaking space, so the name never splits across lines.
const HEAD_PROBLEM = "The financial system wasn’t built for the businesses of rural India";
const HEAD_SOLUTION = "Here’s how Rang De closes the gap.";

// The heading: H3, a step up to H2 on large screens; H4 on short laptop screens so the cards keep their room.
const HEAD_TYPE = "font-display text-h3 font-bold text-ink [text-wrap:balance] xl:text-h2 [@media(max-height:820px)]:text-h4";

const PHONE = "(max-width: 767px)";

export function ProblemGapUpdates({ stats }: { stats?: RangDeStats }) {
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

/** The heading on its own: no eyebrow, the line does the work (26 Nov 2026). It fills in letter by letter, left to right
 * and line by line, as "The money may be small…" does (ScrollInk's plain fill: pale ink → ink). `drive` (pinned): a 0–1
 * value from the section's own scroll, so the fill runs while the heading holds in the middle of the screen; without it
 * (phones), the fill follows the heading's own trip up the screen. */
function Heading({ text, drive }: { text: string; drive?: MotionValue<number> }) {
  return <ScrollInk as="h2" tone="plain" text={text} drive={drive} className={`max-w-[900px] text-center ${HEAD_TYPE}`} />;
}

/* ───────────── Laptops and tablets: pinned ───────────── */

// Through the pinned scroll, 0 → 1. Two headings, each with the same entrance (26 Nov 2026):
// 1. The problem heading alone in the middle of the screen, at the hero headline's size. It fills in letter by letter
//    (first line, then the second) while it holds there, then glides up to its place, shrinking to its own size, and
//    the problem cards scroll up from below into theirs.
// 2. The turn: the background goes green, and the problem heading and cards blur and fade back together, then stay
//    there (blurred, a third visible) behind everything that follows.
// 3. "Here's how Rang De closes the gap." scrolls up from the bottom of the screen, at hero size, to the middle, as the
//    problem heading did when the page scrolled from the hero. It fills in while it holds there, then glides up to its
//    place, shrinking, and the solution cards land. The problem heading behind it fades a little further as it lands.
const T = {
  ink1: [0, 0.07], // the problem heading fills in, in the middle of the screen
  headUp: [0.08, 0.16],
  problem1: [0.13, 0.25],
  problem2: [0.19, 0.31],
  turn: [0.38, 0.45], // green; the problem heading and cards blur and fade
  solEnter: [0.4, 0.49], // the solution heading scrolls up from the bottom to the middle
  ink2: [0.5, 0.57], // …fills in there
  solUp: [0.58, 0.66], // …then glides up to its place
  solution1: [0.63, 0.75],
  solution2: [0.69, 0.81],
} as const;

const smooth = (v: number) => v * v * (3 - 2 * v);

// The problem heading and cards once the green is in: this faded and this blurred, held to the end of the section.
const BACK_OPACITY = 0.35;
const BACK_BLUR = 9; // px (was 6)
// The problem heading alone, once the solution heading has landed on top of it (so the two don't muddy each other).
const BACK_HEAD_OPACITY = 0.12;

/** The problem cards' (and heading's) opacity through the turn: 1 → BACK_OPACITY, then held. */
function backFade(p: number) {
  const [a, b] = T.turn;
  if (p <= a) return 1;
  if (p >= b) return BACK_OPACITY;
  return 1 - (1 - BACK_OPACITY) * ((p - a) / (b - a));
}

function Pinned({ solutions }: { solutions: Card[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const turn = useTransform(scrollYProgress, [...T.turn], [0, 1], { clamp: true });
  const bg = useTransform(turn, [0, 1], [GREY_BG, GREEN_BG]);
  // The problems fall back as the background turns: the heading and the cards blur and fade to BACK_OPACITY together,
  // then hold there, blurred, for the rest of the section (26 Nov 2026: they no longer fade away; the solution heading
  // and cards sit in front of them).
  // As functions, not keyframe maps: Motion hands a plain scroll → opacity map to the browser's scroll timeline, which
  // didn't hold its end value (the opacity crept back up).
  const blur = useTransform(turn, (v) => `blur(${v * BACK_BLUR}px)`);
  const fade = useTransform(scrollYProgress, backFade);
  // The problem heading: as the cards, then a little further back as the solution heading glides up onto it.
  const headFade = useTransform(scrollYProgress, (p) => {
    const [a, b] = T.solUp;
    if (p <= a) return backFade(p);
    if (p >= b) return BACK_HEAD_OPACITY;
    return BACK_OPACITY - (BACK_OPACITY - BACK_HEAD_OPACITY) * ((p - a) / (b - a));
  });
  // The two headings' letter fills.
  const ink1 = useTransform(scrollYProgress, [...T.ink1], [0, 1], { clamp: true });
  const ink2 = useTransform(scrollYProgress, [...T.ink2], [0, 1], { clamp: true });

  // How far the heading sits below its place when centred, so it is in the middle of the screen.
  const stageRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const heroProbe = useRef<HTMLSpanElement>(null);
  const [drop, setDrop] = useState(0);
  // How much bigger the heading is when centred: the hero headline's size (H1) over its own, held to the stage's width.
  const [big, setBig] = useState(1);
  // How far below the middle the solution heading starts: just past the bottom of the screen (the stage clips it).
  const [below, setBelow] = useState(0);
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
      const title = titleRef.current?.querySelector("h2");
      const probe = heroProbe.current;
      let scale = 1;
      if (title && probe) {
        const ratio = parseFloat(getComputedStyle(probe).fontSize) / parseFloat(getComputedStyle(title).fontSize);
        const room = (stage.clientWidth - 64) / Math.max(1, head.offsetWidth);
        scale = Math.max(1, Math.min(ratio, room));
        setBig(scale);
      }
      setBelow(st.height / 2 + (head.offsetHeight * scale) / 2 + 24);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);
  const lifting = useTransform(scrollYProgress, [T.problem1[0], T.problem2[1]], [0, 1], { clamp: true });
  const groupY = useTransform(lifting, (v) => -v * lift);
  // Centred: down by `drop`, plus whatever the group has lifted by then, so it is the true middle of the screen.
  const middle = () => drop + lifting.get() * lift;
  // The problem heading: centred (1) → in its place (0).
  const probCentre = useTransform(scrollYProgress, [...T.headUp], [1, 0], { clamp: true });
  const probY = useTransform(() => smooth(probCentre.get()) * middle());
  const probScale = useTransform(probCentre, (v) => 1 + smooth(v) * (big - 1));
  // The solution heading: up from below the screen to the middle, at the pace of the scroll (`solIn`, 1 → 0), then
  // centred (1) → in its place (0).
  const solIn = useTransform(scrollYProgress, [...T.solEnter], [1, 0], { clamp: true });
  const solCentre = useTransform(scrollYProgress, [...T.solUp], [1, 0], { clamp: true });
  const solY = useTransform(() => smooth(solCentre.get()) * middle() + solIn.get() * below);
  const solScale = useTransform(solCentre, (v) => 1 + smooth(v) * (big - 1));

  return (
    <div ref={ref} className="relative mx-2" style={{ height: reduce ? "auto" : "calc(5 * (100svh - var(--navbar-bottom, 0px)))" }}>
      {/* The hero headline's type size, to measure against. */}
      <span ref={heroProbe} aria-hidden className="pointer-events-none invisible absolute font-display text-h1" />
      <motion.section
        ref={stageRef}
        aria-label="The problem, and how Rang De closes the gap"
        className={`${reduce ? "" : "sticky"} flex flex-col items-center overflow-hidden rounded-[16px] px-ds-6 py-ds-9 lg:px-ds-8 [@media(max-height:820px)]:py-ds-6`}
        style={{ top: "var(--navbar-bottom, 0px)", height: reduce ? "auto" : "calc(100svh - var(--navbar-bottom, 0px))", backgroundColor: reduce ? GREY_BG : bg }}
      >
        <motion.div ref={groupRef} className="flex w-full flex-1 flex-col items-center gap-ds-8 [@media(max-height:820px)]:gap-ds-6" style={reduce ? undefined : { y: groupY }}>
          {/* The two headings share one slot, each centred in it, so both sit in the true middle of the screen when
              centred. The problem heading blurs out with its cards; the solution heading scrolls up from below. */}
          <div ref={headRef} className="relative z-10 grid place-items-center">
            <motion.div
              ref={titleRef}
              className="col-start-1 row-start-1"
              style={reduce ? undefined : { y: probY, scale: probScale, filter: blur, opacity: headFade }}
            >
              <Heading text={HEAD_PROBLEM} drive={reduce ? undefined : ink1} />
            </motion.div>
            {!reduce && (
              <motion.div className="col-start-1 row-start-1" style={{ y: solY, scale: solScale }}>
                <Heading text={HEAD_SOLUTION} drive={ink2} />
              </motion.div>
            )}
          </div>

          {/* The cards: the two problems, and the two solutions landing over them. */}
          <div className="relative grid w-full max-w-page flex-1 grid-cols-2 gap-4">
            {PROBLEMS.map((c, i) => (
              <RiseIn key={i} progress={scrollYProgress} range={i === 0 ? T.problem1 : T.problem2} reduce={!!reduce} filter={blur} opacity={fade}>
                <GapCard card={c} fill={!reduce} />
              </RiseIn>
            ))}
            {!reduce && (
              <div className="absolute inset-zero grid grid-cols-2 gap-4">
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

/** A card: an icon, the short header, the sentence under it, a divider, the points as a short list, and (for the problems)
 * the source at the foot. `fill` (laptops, pinned): the card is as tall as the room under the heading; the content sits
 * centred in it, the source pinned to the bottom. The solutions are as tall as the problems they land on.
 * Alignment, as on a pricing card: the head (icon, header, sentence), divider and source centred, on the page's centre
 * line; the points left-aligned for easy reading, but as one block centred in the card (as wide as its longest line).
 * 26 Nov 2026: the short header (H4) so the card can be read at a glance, with the old title under it as the sentence (P2,
 * grey 64), and an icon as tall as the header's line (40px). The icon is a placeholder ("info") for every card for now,
 * to judge the structure; the real ones come later. */
function GapCard({ card, solution = false, fill = false }: { card: Card; solution?: boolean; fill?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col items-center rounded-[20px] bg-white p-x24 text-center md:p-ds-6 xl:p-ds-7 [@media(max-height:820px)]:p-ds-6 ${fill ? "justify-center" : ""} ${solution ? "shadow-[0_24px_60px_rgba(41,45,54,0.14)]" : ""}`}
    >
      {/* With a source pinned to the bottom (mt-auto), the content takes an auto margin too, so the spare room splits
          evenly above and below it. */}
      <div className={`flex w-full max-w-[520px] flex-col items-center gap-x24 xl:gap-ds-6 [@media(max-height:820px)]:gap-x20 ${fill && card.note ? "mt-auto" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <span aria-hidden className={`flex size-ds-7 items-center justify-center rounded-full [@media(max-height:820px)]:size-ds-6 ${solution ? "bg-green-16" : "bg-ink/8"}`}>
            <Icon name="info" size={24} />
          </span>
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-display text-h4 font-bold text-ink [text-wrap:balance] [@media(max-height:820px)]:text-p1">{card.head}</h3>
            <p className="font-display text-p2 font-medium text-ink/64 [text-wrap:balance] [@media(max-height:820px)]:text-p3">{card.title}</p>
          </div>
        </div>
        <span aria-hidden className="h-px w-full shrink-0 bg-ink/16" /* as the opportunities card's divider */ />
        <ul className={`flex w-fit max-w-[460px] list-disc flex-col gap-x20 pl-x20 text-left md:gap-x24 xl:gap-ds-6 [@media(max-height:820px)]:gap-4 ${solution ? "marker:text-green-100" : "marker:text-ink/32"}`}>
          {card.points.map((p, i) => (
            <li key={i} className="pl-f1 font-display text-p2 font-medium text-text-grey-64 [text-wrap:pretty] md:text-p3 2xl:text-p2">
              {p}
            </li>
          ))}
        </ul>
      </div>
      {card.note && <p className={`mt-auto font-display text-p4 font-medium text-ink/48 ${fill ? "pt-x24" : "pt-ds-6"}`}>{card.note}</p>}
    </div>
  );
}

/** Reduced motion and phones: the green panel with its heading and the two solutions. */
function SolutionPanel({ solutions, phone = false }: { solutions: Card[]; phone?: boolean }) {
  return (
    <section aria-label="How Rang De closes the gap" className={`mt-2 flex flex-col items-center gap-ds-6 rounded-[16px] px-4 ${phone ? "py-ds-8" : "py-ds-9"}`} style={{ backgroundColor: GREEN_BG }}>
      <Heading text={HEAD_SOLUTION} />
      <div className={`grid w-full max-w-page gap-4 ${phone ? "grid-cols-1" : "grid-cols-2"}`}>
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
      <section aria-label="The problem" className="flex flex-col items-center gap-ds-6 rounded-[16px] px-4 py-ds-8" style={{ backgroundColor: GREY_BG }}>
        <Heading text={HEAD_PROBLEM} />
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
