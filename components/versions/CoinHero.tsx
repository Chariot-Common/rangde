"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { WordReveal, wordRevealLength } from "@/components/ui/WordReveal";
import { heroStatsFrom } from "@/lib/content";
import { setNavIntro } from "@/lib/nav-intro";
import { usePageReady } from "@/lib/use-page-ready";
import { COIN_FLY, Sprite } from "./CharacterHowItWorks";

/*
 * Version 6's hero entrance. The Rang De logo (1.5x the nav logo, no company line) sits just above
 * the headline from the start, the whole block centred on the screen. Six coins (the How it works coin) fly left to right across
 * the headline, each revealing its own random handful of letters; the second line then comes in word
 * by word. The coins come back right to left along the stats row, revealing the numbers and labels;
 * once the last has gone the RBI seal scales up and its label drops in. The coins are 3x in the white
 * space either side and shrink to 1x over the text, for depth: money going in, money coming back.
 * The people strip then rises from the bottom, gently pushing the copy up into its resting place,
 * the logo flies to its spot in the nav, and the nav buttons and bottom line fade in.
 * Scrolling, swiping or pressing a key skips straight to the end.
 */

const LINE_1 = "Invest directly in rural entrepreneurs.";
const LINE_2 = "Help them build credit, while you earn returns.";

const EASE = [0.22, 1, 0.36, 1] as const;
// The whole entrance runs 4x faster than first drafted: each duration and pause below is scaled by PACE.
const PACE = 1 / 4;
const COINS = 6;
const COIN_GAP = 0.16 * PACE; // seconds between coins
const COIN_FLIGHT = 1.5 * PACE; // seconds for one coin to cross the screen
const COIN_SIZE = 44; // px, the coin at 1x over the text
const COIN_BIG = 3; // scale in the white space either side
const LINE_2_STAGGER = 0.08 * PACE;
const LINE_2_DURATION = 0.6 * PACE;

type Phase = "logo" | "line1" | "line2" | "stats" | "rbi" | "settle" | "done";

export function CoinHero({ strip, below }: { strip: ReactNode; below?: ReactNode }) {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("logo");
  const done = reduce || phase === "done";
  const stats = heroStatsFrom(useRangDeStats());

  const groupRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const groupY = useMotionValue(0);
  const stripY = useMotionValue(0);
  const stripOpacity = useMotionValue(0);
  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);
  const logoScale = useMotionValue(1);
  // The big logo is positioned above the headline before it is shown; logoX/Y move it from its CSS
  // spot (centred). Its size is read once it is on the page.
  const logoOpacity = useMotionValue(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoSize = useRef({ w: 90, h: 72 });

  // One motion value per coin; the flight sets x, the path (y, band) is set per pass.
  const coinX = [useMotionValue(-999), useMotionValue(-999), useMotionValue(-999), useMotionValue(-999), useMotionValue(-999), useMotionValue(-999)];
  const [path, setPath] = useState<CoinPath | null>(null);

  // Centre the whole block (headline to stats) with the big logo just above it, and park the strip
  // below the screen. Done before first paint and again as the intro starts (the first can be lost).
  const place = () => {
    const group = groupRef.current;
    let groupTop: number | null = null;
    if (group) {
      const r = group.getBoundingClientRect();
      const shift = groupY.get(); // measure the resting layout, not the lifted one
      const y = window.innerHeight / 2 - (r.top - shift + r.bottom - shift) / 2;
      groupY.set(y);
      groupTop = r.top - shift + y;
    }
    const strip = stripRef.current;
    if (strip) {
      stripY.set(window.innerHeight - (strip.getBoundingClientRect().top - stripY.get()) + 60);
      stripOpacity.set(0);
    }
    const logo = logoRef.current;
    if (logo) {
      const r = logo.getBoundingClientRect();
      logoSize.current = { w: r.width / logoScale.get(), h: r.height / logoScale.get() };
      if (groupTop !== null) logoY.set(logoTo(0, Math.max(16, groupTop - logoSize.current.h - 40)).y);
      logoOpacity.set(1);
    }
  };
  // Offsets that put the logo's top-left corner at (left, top) on screen, measured from where it is
  // now (its CSS centring is relative to the page without the scrollbar, so it isn't computed).
  const logoTo = (left: number, top: number) => {
    const r = logoRef.current?.getBoundingClientRect();
    return r ? { x: logoX.get() + left - r.left, y: logoY.get() + top - r.top } : { x: logoX.get(), y: logoY.get() };
  };

  useLayoutEffect(() => {
    if (reduce) {
      setNavIntro("shown");
      stripOpacity.set(1);
      return;
    }
    setNavIntro("hidden");
    place();
    return () => setNavIntro("shown");
    // Runs once on mount; everything it touches is a ref or a motion value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // The script.
  useEffect(() => {
    if (!ready || reduce) return;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (s: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, s * 1000);
        timers.add(id);
      });

    // Deal the characters out to the coins at random; each coin reveals its own as it passes them.
    // The coins fly along the row's middle; they are at 1x across the span of its characters.
    // On phones the copy wraps onto several lines, so each coin flies at the height of one of its own
    // characters, with its own random start and speed (sporadic rather than a tidy stream).
    const fly = async (chars: HTMLElement[], row: HTMLElement, dir: 1 | -1) => {
      const phone = window.innerWidth < 640;
      const rowRect = row.getBoundingClientRect();
      const rects = chars.map((c) => c.getBoundingClientRect());
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      const shuffled = [...chars].sort(() => Math.random() - 0.5);
      const hands: { el: HTMLElement; x: number; y: number }[][] = Array.from({ length: COINS }, () => []);
      shuffled.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        hands[i % COINS].push({ el, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 });
      });
      const ys = hands.map((hand) => (phone && hand.length ? hand[Math.floor(Math.random() * hand.length)].y : (rowRect.top + rowRect.bottom) / 2));
      setPath({ ys, left, right, dir, jitter: !phone });
      const off = 160;
      const from = dir === 1 ? -off : window.innerWidth + off;
      const to = dir === 1 ? window.innerWidth + off : -off;
      const flights = coinX.map((x, i) => {
        x.set(from);
        const unsub = x.on("change", (v) => {
          for (const c of hands[i]) if (dir === 1 ? v >= c.x : v <= c.x) c.el.style.opacity = "1";
        });
        const delay = phone ? Math.random() * 0.7 * PACE : i * COIN_GAP;
        const duration = phone ? (1 + Math.random() * 0.7) * PACE : COIN_FLIGHT;
        return animate(x, to, { duration, delay, ease: [0.4, 0, 0.6, 1] }).then(() => {
          unsub();
          hands[i].forEach((c) => (c.el.style.opacity = "1"));
        });
      });
      await Promise.all(flights);
    };

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      timers.forEach(clearTimeout);
      coinX.forEach((x) => x.stop());
      setPath(null);
      setPhase("done");
      animate(groupY, 0, { duration: 0.4, ease: EASE });
      animate(stripY, 0, { duration: 0.4, ease: EASE });
      animate(stripOpacity, 1, { duration: 0.4 });
      setNavIntro("shown");
    };

    (async () => {
      place();
      setPhase("line1");
      const line1 = line1Ref.current;
      if (line1) await fly([...line1.querySelectorAll<HTMLElement>("[data-ch]")], line1, 1);
      if (cancelled) return;
      setPath(null);
      setPhase("line2");
      await wait(wordRevealLength(LINE_2, LINE_2_STAGGER, LINE_2_DURATION) + 0.3 * PACE);
      if (cancelled) return;
      setPhase("stats");
      const row = statsRef.current;
      if (row) await fly([...row.querySelectorAll<HTMLElement>("[data-ch]")], row, -1);
      if (cancelled) return;
      setPath(null);
      setPhase("rbi");
      await wait(0.9 * PACE);
      if (cancelled) return;
      // The strip rises and fades in, gently pushing the copy up to its resting place.
      setPhase("settle");
      // The logo rides up with the copy so it stays just above it.
      animate(logoY, logoY.get() - groupY.get(), { duration: 1.1 * PACE, ease: EASE });
      animate(groupY, 0, { duration: 1.1 * PACE, ease: EASE });
      animate(stripOpacity, 1, { duration: 0.9 * PACE, ease: "easeOut" });
      await animate(stripY, 0, { duration: 1.1 * PACE, ease: EASE });
      if (cancelled) return;
      // Then the logo flies to the nav, and the nav fades in as it gets there.
      const navLogo = visibleNavLogo();
      if (navLogo) {
        const s = navLogo.width / logoSize.current.w;
        animate(logoScale, s, { duration: 0.8 * PACE, ease: EASE });
        const to = logoTo(navLogo.left, navLogo.top);
        animate(logoX, to.x, { duration: 0.8 * PACE, ease: EASE });
        await animate(logoY, to.y, { duration: 0.8 * PACE, ease: EASE });
      }
      if (cancelled) return;
      // The nav fades in around the landed logo, its own logo kept invisible underneath as a spacer;
      // then the flying logo hands over to it in the same spot.
      setNavIntro("landing");
      await wait(0.35 * PACE);
      finish();
    })();

    const keys = ["wheel", "touchmove", "keydown"] as const;
    keys.forEach((k) => window.addEventListener(k, finish, { passive: true }));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      keys.forEach((k) => window.removeEventListener(k, finish));
    };
    // The motion values and refs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduce]);

  const rbiOn = done || phase === "rbi" || phase === "settle";

  return (
    <div className="relative isolate flex w-full flex-col items-center gap-12 overflow-hidden px-4 pt-[100px] sm:px-2 sm:pt-12 md:pt-16 lg:gap-16 lg:pt-[64px]">
      <motion.div ref={groupRef} style={{ y: groupY }} className="flex w-full flex-col items-center gap-12 lg:gap-16">
        {/* Each sentence on its own line from lg up; the second a step lighter. */}
        <h1 aria-label={`${LINE_1} ${LINE_2}`} className="w-full max-w-[1280px] text-center font-display text-h1 font-bold text-ink">
          <span ref={line1Ref} aria-hidden className="lg:block lg:whitespace-nowrap">
            <Chars text={LINE_1} shown={done} />
          </span>{" "}
          <WordReveal
            as="span"
            text={LINE_2}
            stagger={LINE_2_STAGGER}
            duration={LINE_2_DURATION}
            play={done || (phase !== "logo" && phase !== "line1")}
            className="text-ink/64 lg:block lg:whitespace-nowrap"
          />
        </h1>
        <div ref={statsRef} className="w-full max-w-[1200px]">
          <CoinStats stats={stats} shown={done} rbiOn={rbiOn} />
        </div>
      </motion.div>

      <motion.div ref={stripRef} style={{ y: stripY, opacity: stripOpacity }} className="flex w-full flex-col items-center gap-12 lg:gap-16">
        <div className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]">{strip}</div>
        {below && <div className="w-full">{below}</div>}
      </motion.div>

      {/* The intro's own layer: the big logo and the coins, above the page, below the page loader. */}
      {!done && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[150]">
          {/* 1.5x the nav logo (46x36 on phones, 60x48 from md); hidden until it is placed above the headline. */}
          <motion.div
            ref={logoRef}
            className="absolute left-[calc(50%-34.5px)] top-[calc(50%-27px)] h-[54px] w-[69px] origin-top-left md:left-[calc(50%-45px)] md:top-[calc(50%-36px)] md:h-[72px] md:w-[90px]"
            style={{ x: logoX, y: logoY, scale: logoScale, opacity: logoOpacity }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the nav's own logo file, sized by the intro */}
            <img src="/icons/rangde-logo-mark.svg" alt="" className="size-full object-contain" />
          </motion.div>
          {path && coinX.map((x, i) => <Coin key={`${path.dir}-${i}`} x={x} path={path} index={i} />)}
        </div>
      )}
    </div>
  );
}

/** The nav's logo as it sits on screen right now (phone and desktop rows each have one). */
function visibleNavLogo() {
  const imgs = [...document.querySelectorAll<HTMLImageElement>('header img[src*="rangde-logo-mark"]')];
  const r = imgs.map((i) => i.getBoundingClientRect()).find((b) => b.width > 0);
  return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
}

/** One coin on its pass: 3x out in the white space, easing down to 1x over the row, facing its way. */
type CoinPath = { ys: number[]; left: number; right: number; dir: 1 | -1; jitter: boolean };

function Coin({ x, path, index }: { x: MotionValue<number>; path: CoinPath; index: number }) {
  const vw = typeof window === "undefined" ? 1440 : window.innerWidth;
  const scale = useTransform(x, [-160, path.left, path.right, vw + 160], [COIN_BIG, 1, 1, COIN_BIG]);
  const art = COIN_FLY[index % 2];
  const k = (COIN_SIZE * 1.7) / art[3];
  const w = art[3] * k;
  const h = art[4] * k;
  // A little height variation between coins so the stream doesn't look ruled.
  const dy = path.jitter ? ((index * 37) % 13) - 6 : 0;
  return (
    <motion.div className="absolute top-0" style={{ left: -w / 2, width: w, height: h, x, y: path.ys[index] - h / 2 + dy, scale }}>
      <div style={{ width: w, height: h, transform: path.dir === -1 ? "scaleX(-1)" : undefined }} className="relative">
        <Sprite s={art} k={k} style={{ left: 0, top: 0 }} />
      </div>
    </motion.div>
  );
}

/** Text whose characters start invisible, for the coins to reveal one by one (spaces stay as text). */
function Chars({ text, shown }: { text: string; shown: boolean }) {
  return text.split("").map((ch, i) =>
    ch === " " ? (
      " "
    ) : (
      <span key={i} data-ch className="transition-opacity duration-300 ease-out" style={{ opacity: shown ? 1 : 0 }}>
        {ch}
      </span>
    ),
  );
}

// Same layout as HeroStats (phones: the seal on top over a 2x2 grid; sm up: one row, seal in the
// middle), but with fixed figures so the coins can reveal them character by character.
const MOBILE_ORDER_CLASS = ["order-[2]", "order-[3]", "order-[1]", "order-[4]", "order-[5]"];

function CoinStats({ stats, shown, rbiOn }: { stats: ReturnType<typeof heroStatsFrom>; shown: boolean; rbiOn: boolean }) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-6 gap-y-12 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-[16px] sm:gap-y-8 lg:flex-nowrap">
      {stats.map((stat, index) => {
        const isRbi = stat.kind === "icon";
        return (
          <div
            key={stat.label}
            className={`flex flex-col items-center ${isRbi ? "col-span-2 gap-[8px] justify-self-center sm:min-w-0" : "gap-[4px]"} sm:order-none sm:flex-1 ${MOBILE_ORDER_CLASS[index]}`}
            // As on v1: the RBI column starts with no width, so the four numbers sit evenly spaced;
            // when the seal pops in it grows into the middle and pushes them apart.
            style={isRbi ? { flexGrow: rbiOn ? 1 : 0, transition: "flex-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1)" } : undefined}
          >
            {stat.kind === "number" ? (
              <p className="font-display text-[24px] font-bold leading-[28px] text-ink lg:text-h4 lg:leading-[40px]">
                <span aria-hidden>
                  <Chars text={stat.format(stat.target)} shown={shown} />
                </span>
                <span className="sr-only">{stat.format(stat.target)}</span>
              </p>
            ) : (
              <motion.div
                className="relative h-[48px] w-[48px] sm:h-[64px] sm:w-[64px]"
                initial={false}
                animate={{ scale: rbiOn ? 1 : 0 }}
                transition={{ duration: 0.45 * PACE, ease: EASE }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small static seal */}
                <img src={stat.icon} alt="" className="size-full object-cover" />
              </motion.div>
            )}
            {isRbi ? (
              <motion.p
                className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[1.2px] text-ink/80 sm:font-bold sm:text-h5 sm:tracking-[0.88px]"
                initial={false}
                animate={rbiOn ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4 * PACE, delay: rbiOn && !shown ? 0.35 * PACE : 0, ease: EASE }}
              >
                {stat.label}
              </motion.p>
            ) : (
              <p className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[1.2px] text-ink/80 sm:font-bold sm:text-h5 sm:tracking-[0.88px]">
                <span aria-hidden>
                  <Chars text={stat.label} shown={shown} />
                </span>
                <span className="sr-only">{stat.label}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
