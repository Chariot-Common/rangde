"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Icon } from "@/components/ui";
import { ScrollInk } from "../ScrollInk";
import { HEAD, OPTIONS, OPTION_STATS, PAPER, STAT_COLS, StatCard, SUB } from "./WhyThread2";

/* ── What are their options? (/v/why3, 25 Nov 2026; after eathungrytiger.com/about's "Crafted with heart").
      "What are / their options?" sits in the middle of the screen at the hero header's size, and stays there while the
      four options rise past it one after another, each in its collapsed form (the body right under the divider) on a
      white card, each in its own lane (see LANES). Each card enters from the bottom of the screen tilted and a little
      smaller, and rises at one steady speed to leave at the top, straightening and growing to full size on the way. The
      next card's icon and title come in at the bottom as the one before leaves at the top.
      Once the last card has gone, the heading scrolls away, and the closing line and the four numbers follow. ──────── */

/** The hero header's type (WhyHero2): 40 / 64 / 72 / 72–80px, bold, 1.08 line height. */
const HERO_TYPE =
  "font-display font-bold leading-[1.08] tracking-[-0.02em] text-text-grey-100 text-[40px] md:text-[64px] lg:text-[72px] xl:text-[clamp(72px,min(5.6vw,9svh),80px)]";

/** Each card's lane: where it crosses, as a share of the free width (0 = left edge, 1 = right edge), and its tilt
 * (degrees) as it enters. 25 Nov 2026: moved off the reference's lanes (left, far right, centre, right) so it doesn't
 * read as a copy; self-help groups now cross left of centre instead of straight over the heading. */
const LANES = [
  { x: 0.12, r: 6 },
  { x: 0.84, r: -5 },
  { x: 0.3, r: 5 },
  { x: 0.74, r: -4 },
];

/** Scroll, in screen heights. One steady speed (no slowing in the middle). Second pass (25 Nov 2026): a card crosses
 * the screen and its own height (about 1.45 screens) in 1.25 screens of scroll, so it rises a little faster than the
 * page; and the next card's icon and title are already showing at the bottom while the one before has only its body
 * left at the top. */
const RUN = 1.25;
const STEP = RUN * 0.72;
const SPAN = STEP * (OPTIONS.length - 1) + RUN;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ThreadOptions3() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // A slight lag behind the scroll, so the cards drift instead of moving rigidly with the wheel; kept short, so they
  // move as you scroll.
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 36, restDelta: 0.0005 });

  return (
    <section id="c-options" aria-labelledby="options3-heading" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: PAPER }}>
      {reduce ? (
        // Reduced motion: the heading, then the four cards side by side, nothing pinned or moving.
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10 px-4 pt-16 sm:px-6 md:gap-14 md:pt-24 lg:px-8">
          <Heading />
          <ul className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-4">
            {OPTIONS.map((o) => (
              <li key={o.k}>
                <OptionCard o={o} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div ref={ref} className="relative" style={{ height: `${(1 + SPAN) * 100}svh` }}>
          {/* The stage: the screen under the navigation bar. The heading sits in its middle; the cards cross it. */}
          <div className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))] overflow-hidden px-4 [--cw:min(76vw,400px)] sm:px-6 md:[--cw:clamp(300px,26vw,440px)] lg:px-8">
            <div className="flex h-full items-center justify-center">
              <Heading />
            </div>
            <ul className="pointer-events-none absolute inset-y-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
              {OPTIONS.map((o, i) => (
                <RisingCard key={o.k} o={o} i={i} p={p} start={(i * STEP) / SPAN} end={(i * STEP + RUN) / SPAN} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* The closing, centred, then a divider and the four numbers, as in /v/why2. The gaps either side of the divider
          are the section's bottom padding (64px, 96px from tablets up). */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-16 px-4 pb-16 pt-16 sm:px-6 md:gap-24 md:pb-24 md:pt-24 lg:px-8">
        <p className="flex flex-col items-center gap-3 text-center">
          <span className="font-display text-[20px] font-medium leading-[1.3] text-ink/56 md:text-[24px]">Every option is shut, too costly, or unreliable.</span>
          <ScrollInk as="span" tone="plain" text="Good rural businesses stay small, or don’t survive at all." className={`${HEAD} block max-w-[18em] text-[32px] md:text-[48px] lg:text-[56px]`} />
        </p>
        <span className="block h-[1.6px] w-full rounded-full bg-ink/16" aria-hidden />
        <ul className={`grid gap-2 md:grid-cols-2 ${STAT_COLS}`}>
          {OPTION_STATS.map((s) => (
            <StatCard key={s.line} s={s} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The heading fills in letter by letter, text grey 24 to text grey 100, as the section comes onto the screen (each line
 * as it's scrolled to, the page's usual fill). */
function Heading() {
  return (
    <h2 id="options3-heading" aria-label="What are their options?" className={`text-center ${HERO_TYPE}`}>
      <ScrollInk as="span" tone="grey" text="What are" className="block" />
      <ScrollInk as="span" tone="grey" text="their options?" className="block" />
    </h2>
  );
}

/** One card on its run up the screen. The outer layer moves the card's top from the stage's bottom (0) to its top (1);
 * the card itself is shifted up by its own height over the same run, so it starts just below the screen, is centred
 * halfway, and ends just above it. Both are transforms, so nothing reflows while scrolling. */
function RisingCard({ o, i, p, start, end }: { o: (typeof OPTIONS)[number]; i: number; p: MotionValue<number>; start: number; end: number }) {
  const lane = LANES[i % LANES.length];
  const t = useTransform(p, (v) => clamp01((v - start) / (end - start)));
  const outer = useTransform(t, (v) => `${(1 - v) * 100}%`);
  const inner = useTransform(t, (v) => `${-v * 100}%`);
  // Tilted as it enters and straight as it leaves; a little smaller until it reaches the middle.
  const rotate = useTransform(t, (v) => lane.r * (1 - v));
  const scale = useTransform(t, (v) => 0.86 + 0.14 * Math.min(1, v / 0.5));
  const visibility = useTransform(t, (v) => (v <= 0 || v >= 1 ? "hidden" : "visible"));
  return (
    <motion.li className="absolute inset-0" style={{ y: outer, visibility }}>
      <motion.div
        className="absolute top-0 w-[var(--cw)]"
        style={{ left: `calc((100% - var(--cw)) * ${lane.x})`, y: inner, rotate, scale }}
      >
        <OptionCard o={o} />
      </motion.div>
    </motion.li>
  );
}

/** An option in its collapsed form: icon, name, title, divider and body together. 25 Nov 2026: in /v/why2's default
 * colours: a white card, the icon (solid nav navy) and the name in nav navy, the title in ink, the divider at ink 16%
 * and the body at ink 64%. A soft shadow keeps it apart from the heading it passes over. */
function OptionCard({ o }: { o: (typeof OPTIONS)[number] }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[24px] bg-white p-6 pt-8 text-center shadow-6 lg:p-8 lg:pt-10">
      <Icon name={o.icon} size={40} className="-mb-3" />
      <p className="font-display text-h5 font-bold uppercase tracking-[0.08em] text-nav-navy">{o.k}</p>
      <h3 className={`${HEAD} text-[28px] leading-[1.12] text-ink lg:text-[34px]`}>{o.t}</h3>
      <span className="block h-[1.8px] w-full rounded-full bg-ink/16" aria-hidden />
      <p className={`${SUB} mx-auto max-w-[300px] text-ink/64`}>{o.s}</p>
    </div>
  );
}
