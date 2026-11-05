"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { WordReveal, wordRevealLength } from "@/components/ui/WordReveal";
// The body copy reveals at a quarter of the shared hero pace (4x slower) so it can be read before the
// stats start.
const LEAD_STAGGER = 0.08;
const LEAD_DURATION = 0.6;
import { heroIntroStories } from "@/lib/content";
import { setNavIntro } from "@/lib/nav-intro";
import { usePageReady } from "@/lib/use-page-ready";

/*
 * Version 1.1's hero entrance. The headline is typed out, centred in the viewport, in an uneven
 * human rhythm: "Invest", then 📈 pops in with a "₹5,000 ↗" pill drifting down above it; once the
 * pill is fully in, "in the other Startup" is typed, a farmer 🧑🏽‍🌾 rises from behind the line with a
 * "₹5,425 ↙" pill, then "India". Both emojis shrink away so the words close up into one line.
 * The line moves up for the body copy, the stats come in (numbers first, then the RBI seal pops
 * into the middle and pushes them apart), everything eases into its resting place, the story cards
 * rise from the bottom of the screen, and the nav fades back in with a shine on Get started.
 * Scrolling, swiping or pressing a key skips straight to the end.
 */

const TITLE = "Invest in the other Startup India";
const AFTER_INVEST = TITLE.indexOf(" in"); // 📈 goes here
const AFTER_STARTUP = TITLE.indexOf(" India"); // 🧑🏽‍🌾 goes here

const EASE = [0.22, 1, 0.36, 1] as const;
// The whole intro runs at 1.7x its first pace: every wait and duration is scaled by SPEED.
const SPEED = 1 / 1.7;
// Typed a word at a time: the letters of a word come in a quick burst, with a short pause
// before the next word, varied a little so it reads as a person typing.
const keyGap = (next: string) => (next === " " ? 260 : 45) * (0.75 + Math.random() * 0.5);
const PILL_IN = 0.5 * SPEED; // seconds for a pill to drift down and fade in
const COLLAPSE = 0.9 * SPEED; // seconds for the emojis to shrink away
// The circle behind the hero (real time, not sped up): a slow, graceful ease-out.
const DISC_DURATION = 3.5; // s for the disc to grow from 96%
const GLOW_DURATION = 4.5; // s for its glow to swell out from 70%
const GLOW_DELAY = 0.4; // s after the disc starts
const GLOW_EASE = [0.33, 1, 0.68, 1] as const; // ease-out cubic: even and unhurried, no early rush
const HOLD_MS = 2500; // how long the finished line, emojis and all, stays before they shrink away

type Step = {
  typed: number;
  growth: boolean;
  farmer: boolean;
  collapsed: boolean;
  lead: boolean;
  numbers: boolean;
  rbi: boolean;
  settled: boolean;
  /** The big soft circle behind the hero, and the light that sweeps round its glow once. */
  glow: boolean;
  /** Seconds each pill stays (fading in, then slowly out): until the emojis shrink away. */
  debitFor: number;
  creditFor: number;
  /** Skipped or reduced motion: everything at rest, nothing animating. */
  instant: boolean;
};

const START: Step = { typed: 0, growth: false, farmer: false, collapsed: false, lead: false, numbers: false, rbi: false, settled: false, glow: false, debitFor: 0, creditFor: 0, instant: false };
const DONE: Step = { typed: TITLE.length, growth: false, farmer: false, collapsed: true, lead: true, numbers: true, rbi: true, settled: true, glow: true, debitFor: 0, creditFor: 0, instant: true };

export function TypedHero({ lead }: { lead: string }) {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const [script, setStep] = useState<Step>(START);
  const step = reduce ? DONE : script;
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  // Offsets from the resting layout: the copy is lifted to the middle of the screen, the cards
  // wait below its bottom edge.
  const groupY = useMotionValue(0);
  const stripY = useMotionValue(0);

  // Where the copy should sit: the visible part (headline, or headline + body) centred in the
  // viewport, or 0 once it has settled.
  const centreTarget = () => {
    const s = stepRef.current;
    if (s.settled) return 0;
    const el = s.lead ? blockRef.current : titleRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const offset = groupY.get();
    return window.innerHeight / 2 - (r.top - offset + r.bottom - offset) / 2;
  };

  // Before first paint: hide the nav, lift the headline to the middle, park the cards off screen.
  useLayoutEffect(() => {
    if (reduce) return;
    setNavIntro("hidden");
    groupY.set(centreTarget());
    const strip = stripRef.current;
    if (strip) stripY.set(window.innerHeight - strip.getBoundingClientRect().top + 40);
    return () => {
      setNavIntro("shown");
    };
    // Runs once on mount; the helpers only read refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // While typing, keep the headline centred as it grows (it wraps onto more lines on phones).
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const recentre = () => {
      const s = stepRef.current;
      if (s.lead || s.settled) return;
      animate(groupY, centreTarget(), { duration: 0.25, ease: EASE });
    };
    const ro = new ResizeObserver(recentre);
    ro.observe(title);
    window.addEventListener("resize", recentre);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recentre);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The headline moves up quickly to make room for the body copy.
  useEffect(() => {
    if (!step.lead || step.settled) return;
    animate(groupY, centreTarget(), { duration: 0.55, ease: EASE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.lead]);

  // Everything eases into place and the cards rise from the bottom of the screen.
  useEffect(() => {
    if (!step.settled) return;
    const quick = step.instant;
    animate(groupY, 0, { duration: quick ? 0.4 : 0.9 * SPEED, ease: EASE });
    animate(stripY, 0, { duration: quick ? 0.4 : SPEED, delay: quick ? 0 : 0.1 * SPEED, ease: EASE });
  }, [step.settled, step.instant, groupY, stripY]);

  // The script.
  useEffect(() => {
    if (!ready || reduce) return;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms * SPEED);
        timers.add(id);
      });
    const set = (patch: Partial<Step>) => {
      if (!cancelled) setStep((s) => ({ ...s, ...patch }));
    };
    // Keystroke gaps are drawn up front so the pills know how long they have until the line
    // collapses: each fades out right up to that moment.
    const gaps = TITLE.split("").map((ch) => keyGap(ch));
    const sum = (from: number, to: number) => gaps.slice(from, to).reduce((a, b) => a + b, 0);
    const untilCollapse = (afterEmoji: number, typedFrom: number) =>
      ((afterEmoji + sum(typedFrom, TITLE.length) + (typedFrom < AFTER_STARTUP ? 150 + 400 : 0)) * SPEED + HOLD_MS) / 1000;
    const typeTo = async (end: number) => {
      for (let i = stepRef.current.typed + 1; i <= end; i++) {
        await wait(gaps[i - 1]);
        if (cancelled) return;
        set({ typed: i });
      }
    };
    const release = () => {
      setNavIntro("reveal");
    };
    const skip = () => {
      if (cancelled) return;
      cancelled = true;
      timers.forEach(clearTimeout);
      setStep(DONE);
      release();
    };

    (async () => {
      await wait(300);
      // Typing carries on as soon as each emoji has landed; the pills float in alongside it.
      await typeTo(AFTER_INVEST);
      await wait(150);
      set({ growth: true, debitFor: untilCollapse(350, AFTER_INVEST) });
      await wait(350);
      await typeTo(AFTER_STARTUP);
      await wait(150);
      set({ farmer: true, creditFor: untilCollapse(400, AFTER_STARTUP) });
      await wait(400);
      await typeTo(TITLE.length);
      // Hold the finished line, emojis and all, for 2.5s so it can be read (not sped up).
      await wait(HOLD_MS / SPEED);
      set({ collapsed: true });
      await wait(COLLAPSE * 1000);
      set({ lead: true });
      // Real time (not sped up): the stats follow straight on as the body copy's last words land,
      // with no pause after it (the pause belongs to the headline only).
      await wait(((wordRevealLength(lead, LEAD_STAGGER, LEAD_DURATION) - LEAD_DURATION / 2) * 1000) / SPEED);
      set({ numbers: true });
      await wait(2100);
      set({ rbi: true });
      await wait(800);
      set({ settled: true });
      await wait(1000);
      if (cancelled) return;
      // The finishing touches: the nav fades in and Get started shines straight away; the circle then
      // comes in behind the hero at its own slow pace (nothing the reader does cuts it short).
      if (cancelled) return;
      cancelled = true;
      release();
      await wait(400 / SPEED);
      setStep((s) => ({ ...s, glow: true }));
    })();

    const keys = ["wheel", "touchmove", "keydown"] as const;
    keys.forEach((k) => window.addEventListener(k, skip, { passive: true }));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      keys.forEach((k) => window.removeEventListener(k, skip));
    };
  }, [ready, reduce, lead]);

  const { typed, instant } = step;
  const showEmojis = !instant;

  return (
    <div className="relative isolate flex w-full flex-col items-center gap-12 overflow-hidden px-4 pt-[100px] sm:px-2 sm:pt-12 md:pt-16 lg:gap-16 lg:pt-[64px]">
      {/* Only reduced motion makes the circle appear at once; skipping the intro still lets it ease in. */}
      <HeroGlow on={step.glow} instant={!!reduce} />
      <motion.div style={{ y: groupY }} className="flex w-full flex-col items-center gap-12 lg:gap-16">
        <div ref={blockRef} className="flex w-full max-w-[930px] flex-col items-center gap-2 text-center">
          {/* One line on desktop even while the emojis make it wider than the column. */}
          <h1 ref={titleRef} aria-label={TITLE} className="min-h-[1lh] font-display text-h1 font-bold leading-[38px] text-green-dark md:leading-[64px] lg:whitespace-nowrap">
            {/* The line glides to its new centre as each letter lands (layout animation) instead of
                jumping half a letter, and each letter fades in. */}
            <motion.span aria-hidden layout={instant ? false : "position"} transition={{ layout: { duration: 0.22, ease: EASE } }} className="inline-block">
              <Letters from={0} to={Math.min(typed, AFTER_INVEST)} instant={instant} />
              {showEmojis && step.growth && (
                <EmojiSlot src="/images/hero-intro/growth.png" entrance="pop" collapsed={step.collapsed} pill={<AmountPill label="₹5,000" arrow="up" tone="debit" stay={step.debitFor} gone={step.collapsed} />} />
              )}
              <Letters from={AFTER_INVEST} to={Math.min(Math.max(typed, AFTER_INVEST), AFTER_STARTUP)} instant={instant} />
              {showEmojis && step.farmer && (
                <EmojiSlot src="/images/hero-intro/farmer.png" entrance="rise" collapsed={step.collapsed} pill={<AmountPill label="₹5,425" arrow="down" tone="credit" stay={step.creditFor} gone={step.collapsed} />} />
              )}
              <Letters from={AFTER_STARTUP} to={Math.max(typed, AFTER_STARTUP)} instant={instant} />
            </motion.span>
          </h1>
          <WordReveal
            text={lead}
            stagger={LEAD_STAGGER}
            duration={LEAD_DURATION}
            play={step.lead}
            className="w-full max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] sm:max-w-[930px]"
          />
        </div>
        <div className="w-full max-w-[1200px]">
          <HeroStats intro={{ numbers: step.numbers, rbi: step.rbi }} />
        </div>
      </motion.div>
      <motion.div ref={stripRef} style={{ y: stripY }} className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]">
        <StoryCarousel items={heroIntroStories} layout="recent" />
      </motion.div>
    </div>
  );
}

/**
 * An emoji in the headline. Its slot opens as it arrives and closes as it leaves, so the words on
 * either side move apart and back together. "pop" springs it up from nothing; "rise" lifts it from
 * below the line, as if from behind it (the slot clips everything under the line).
 */
function EmojiSlot({ src, entrance, collapsed, pill }: { src: string; entrance: "pop" | "rise"; collapsed: boolean; pill: ReactNode }) {
  return (
    <motion.span
      className="relative inline-block h-[1em] align-[-0.14em]"
      initial={{ width: "0em", marginLeft: "0em" }}
      animate={collapsed ? { width: "0em", marginLeft: "0em" } : { width: "1em", marginLeft: "0.25em" }}
      transition={{ duration: collapsed ? COLLAPSE : 0.3, ease: EASE }}
    >
      <span className="absolute inset-0" style={entrance === "rise" ? { clipPath: "inset(-100% -100% 0 -100%)" } : undefined}>
        <motion.span
          className="absolute inset-x-0 bottom-0 flex justify-center leading-none"
          initial={entrance === "pop" ? { scale: 0 } : { y: "110%" }}
          animate={collapsed ? { scale: 0, y: 0 } : { scale: 1, y: 0 }}
          transition={
            collapsed
              ? { duration: COLLAPSE, ease: EASE }
              : entrance === "pop"
                ? { duration: 0.35, ease: EASE }
                : { duration: 0.4, ease: EASE }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small decorative image sized in em to match the headline */}
          <img src={src} alt="" className="block size-[1em]" />
        </motion.span>
      </span>
      {pill}
    </motion.span>
  );
}

/** "₹5,000 ↗" / "₹5,425 ↙": drifts down into place above its emoji, then keeps drifting and fading for
 * `stay` seconds, reaching 0 just as the emojis shrink away (so the earlier ₹5,000 pill fades longer). */
function AmountPill({ label, arrow, tone, stay, gone }: { label: string; arrow: "up" | "down"; tone: "debit" | "credit"; stay: number; gone: boolean }) {
  return (
    <motion.span
      className={`pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 inline-flex items-center gap-[4px] whitespace-nowrap rounded-[6px] px-[8px] py-[4px] font-display text-[11px] font-bold uppercase leading-[14px] tracking-[0.06em] ${
        tone === "debit" ? "bg-pill-debit text-green-dark" : "bg-pill-credit text-white"
      }`}
      style={{ x: "-50%" }}
      initial={{ opacity: 0, y: -14 }}
      animate={gone ? { opacity: 0 } : { opacity: [0, 1, 0], y: [-14, 0, 10] }}
      transition={
        gone
          ? { duration: 0.3 }
          : { duration: Math.max(stay, PILL_IN + 0.5), times: [0, PILL_IN / Math.max(stay, PILL_IN + 0.5), 1], ease: ["easeOut", "easeInOut"] }
      }
    >
      {label}
      {/* A drawn arrow (bolder than the font's ↗ / ↙): up-right for money going in, down-left for money coming back. */}
      <svg aria-hidden viewBox="0 0 10 10" className="size-[9px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
        {arrow === "up" ? <path d="M2 8 8 2M3.5 2H8v4.5" /> : <path d="M8 2 2 8M6.5 8H2V3.5" />}
      </svg>
    </motion.span>
  );
}

/** Typed letters `from`–`to` of the headline, each fading in as it lands. */
function Letters({ from, to, instant }: { from: number; to: number; instant: boolean }) {
  const text = TITLE.slice(from, to);
  if (instant) return text;
  return text.split("").map((ch, i) => (
    <motion.span key={from + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18, ease: "easeOut" }}>
      {ch}
    </motion.span>
  ));
}

/**
 * The big soft circle behind the hero (as on the other versions): a white disc with a warm yellow
 * glow, coming in slowly once the nav is back. Two separate movements, both on a long, gentle
 * ease-out: the disc grows from 96% to full size, while its glow (a layer of its own,
 * behind the disc) swells out from 70% to full size and brightens, so the warmth seems to radiate
 * outward from inside the circle.
 */
function HeroGlow({ on, instant }: { on: boolean; instant: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[33px] -z-10 h-[1040px] w-[1040px] -translate-x-1/2 sm:top-[-95px] sm:h-[650px] sm:w-[650px] md:top-[-125px] md:h-[850px] md:w-[850px] lg:top-[-174px] lg:h-[1250px] lg:w-[1250px]"
    >
      {/* The glow: starts tucked inside the disc and swells outward past its edge. */}
      <motion.div
        className="absolute inset-0 rounded-full shadow-[0_0_250px_rgba(254,199,0,0.64)]"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={on ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: instant ? 0 : GLOW_DURATION, delay: instant ? 0 : GLOW_DELAY, ease: GLOW_EASE }}
      />
      {/* The disc, over its glow. Always solid: it is white on a white page, so fading it would only
          let the glow's smaller edge show through as a second circle. It just grows. */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white"
        initial={{ scale: 0.96 }}
        animate={{ scale: on ? 1 : 0.96 }}
        transition={{ duration: instant ? 0 : DISC_DURATION, ease: GLOW_EASE }}
      />
    </div>
  );
}
