"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { heroStatsFrom } from "@/lib/content";
import { usePageReady } from "@/lib/use-page-ready";
import { ScrollInk } from "./ScrollInk";
import { PhoneStats } from "./approaches";

/*
 * Version 6's hero. No coins and no flying logo: the Rang De logo stays where it is in the nav. When the page
 * is ready the first headline sentence fills in character by character with the same red-green-blue edge as the
 * page's other headings (ScrollInk, driven by time here instead of the scroll); the second, in text grey 64,
 * fades in after it with no fill; then the figures come in, then the gallery fades in rising into place
 * (timings below). The figures roll up like
 * a slot machine: every digit is a reel that runs from 0 up to its own number (a 9 turns through 0 to 9, a 1
 * through 0 to 1), the reels setting one after another from the left. The people strip and the press row sit
 * underneath as before.
 */

const LINE_1 = "Invest directly in rural entrepreneurs.";
const LINE_2_TEXT = "Help them build credit, while you earn returns.";

const EASE = [0.22, 1, 0.36, 1] as const;
// The intro, in order, all within about 0.8s of the page being ready: the first line fills (0–0.25s), the
// second fades in (0.25–0.45s), the figures come in and start rolling (0.4s), then the gallery fades in
// while rising into place (0.55–0.8s).
const LINE_1_SECONDS = 0.25;
const LINE_2 = { delay: 0.25, duration: 0.2 };
const STATS = { delay: 0.4, duration: 0.2 };
const GALLERY = { delay: 0.55, duration: 0.25, rise: 32 };

/** `line1` / `line2` replace the headline (/v/why, 13 Nov 2026); `noStats` drops the figures row and the phone seal. */
export function CoinHero({ strip, below, line1: text1 = LINE_1, line2: text2 = LINE_2_TEXT, noStats = false }: { strip: ReactNode; below?: ReactNode; line1?: string; line2?: string; noStats?: boolean }) {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const stats = heroStatsFrom(useRangDeStats());
  const play = reduce || ready;

  // How far the first line's fill has run, 0–1, started once the page is ready.
  const line1 = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!ready || reduce) return;
    const a = animate(line1, 1, { duration: LINE_1_SECONDS, ease: "easeOut" });
    return () => a.stop();
  }, [ready, reduce, line1]);

  return (
    // Phones (as on Versions 1 and 2): 32px between the headline, the RBI seal and the gallery (48px from sm up).
    <div className="relative isolate flex w-full flex-col items-center gap-8 overflow-hidden px-4 pt-[100px] sm:gap-12 sm:px-2 sm:pt-12">
      <div className="flex w-full flex-col items-center gap-8 sm:gap-12">
        {/* Each sentence on its own line from lg up. */}
        <h1 className="w-full max-w-[1280px] text-center font-display text-h1 font-bold text-ink">
          <ScrollInk as="span" text={text1} drive={line1} className="lg:block lg:whitespace-nowrap" />{" "}
          {/* The second sentence stays still in text grey 64: no fill, no red-green-blue edge. */}
          <motion.span
            className="text-text-grey-64 lg:block lg:whitespace-nowrap"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: play ? 1 : 0 }}
            transition={{ ...LINE_2, ease: "easeOut" }}
          >
            {text2}
          </motion.span>
        </h1>
        {!noStats && (
        <motion.div
          className="w-full max-w-[1200px]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: play ? 1 : 0 }}
          transition={{ ...STATS, ease: "easeOut" }}
        >
          <RollingStats stats={stats} play={play} />
          {/* Phones, as on Versions 1 and 2: only the RBI seal shows, with a chevron under it; the first scroll opens the
              figures in its place (two columns, a rule between the rows). */}
          <PhoneStats />
        </motion.div>
        )}
      </div>

      {/* 24px under the gallery before the press row. */}
      <div className="flex w-full flex-col items-center gap-6">
        <motion.div
          className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]"
          initial={reduce ? false : { opacity: 0, y: GALLERY.rise }}
          animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: GALLERY.rise }}
          transition={{ delay: GALLERY.delay, duration: GALLERY.duration, ease: EASE }}
        >
          {strip}
        </motion.div>
        {below && <div className="w-full">{below}</div>}
      </div>
    </div>
  );
}

// Same layout as HeroStats (phones: the seal on top over a 2x2 grid; sm up: one row, seal in the middle).
const MOBILE_ORDER_CLASS = ["order-[2]", "order-[3]", "order-[1]", "order-[4]", "order-[5]"];

function RollingStats({ stats, play }: { stats: ReturnType<typeof heroStatsFrom>; play: boolean }) {
  return (
    // Phones: the seal alone (the figures open under it in PhoneStats).
    <div className="grid w-full grid-cols-2 gap-x-6 gap-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-[16px] sm:gap-y-8 lg:flex-nowrap">
      {stats.map((stat, index) => {
        const isRbi = stat.kind === "icon";
        return (
          <div key={stat.label} className={`flex flex-col items-center ${isRbi ? "col-span-2 gap-[8px] justify-self-center sm:min-w-0" : "gap-[4px] max-sm:hidden"} sm:order-none sm:flex-1 ${MOBILE_ORDER_CLASS[index]}`}>
            {stat.kind === "number" ? (
              <p className="font-display text-[24px] font-bold text-ink tabular-nums lg:text-h4" style={{ lineHeight: 1.25 }}>
                <RollNumber text={stat.format(stat.target)} play={play} />
              </p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- small static seal
              <img src={stat.icon} alt="" className="h-[48px] w-[48px] object-cover sm:h-[64px] sm:w-[64px]" />
            )}
            <p className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[1.2px] text-ink/80 sm:font-bold sm:text-h5 sm:tracking-[0.88px]">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/** A figure whose digits are reels: each runs up from 0 to its own number, left to right; the rest (commas, ₹, Cr) is plain. */
function RollNumber({ text, play }: { text: string; play: boolean }) {
  let n = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split("").map((ch, i) => {
          if (ch < "0" || ch > "9") return ch === " " ? " " : <span key={i}>{ch}</span>;
          return <Reel key={i} digit={Number(ch)} play={play} delay={0.02 * n++} />;
        })}
      </span>
    </>
  );
}

function Reel({ digit, play, delay }: { digit: number; play: boolean; delay: number }) {
  // 0, 1, 2 … up to the digit, stacked; the stack slides up until the digit is in the window.
  const faces = Array.from({ length: digit + 1 }, (_, i) => i);
  return (
    <span className="inline-block h-[1.25em] overflow-hidden align-top">
      <motion.span
        className="flex flex-col"
        initial={false}
        animate={{ y: play ? `${(-digit / (digit + 1)) * 100}%` : "0%" }}
        transition={{ duration: 0.35 + digit * 0.02, delay: play ? STATS.delay + delay : 0, ease: EASE }}
      >
        {faces.map((f) => (
          <span key={f} className="block h-[1.25em]">
            {f}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
