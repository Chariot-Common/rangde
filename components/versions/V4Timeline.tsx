"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { RangDeStats } from "@/lib/stats";

/*
 * Version 2 B's "Why it matters": Version 2's loop (your social investment → business → repayment → credit history →
 * opportunities) told as a timeline that slides past sideways as you scroll, resting on each stop in the middle of the
 * screen. About everyone Rang De lends to, not one borrower (review, 11 Nov 2026), with the live figures where there
 * are some (entrepreneurs funded, principal repaid, from the same feed as the money section).
 *
 * Kept direct, in Version 1's voice: each stop is a small label, a short bold claim and one plain line. The track is a line with a dot per stop
 * that moves with the cards and fills green up to the current stop; each "when" sits under its dot, clear of the line.
 * With reduced motion the stops are a plain row.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";
const DOT = 14; // the dot's size; the line runs through the dots' centres

// In Version 1's voice (its problem → answer cards, ProblemPairs.tsx): a short bold claim, then one plain line.
type Stop = { when: string; label: string; title: string; line: string };
const stopsFor = (stats: RangDeStats): Stop[] => [
  { when: "Today", label: "Your social investment", title: "Investors lend to them", line: "Directly, from ₹500, with no land needed. Every borrower is vetted in person first." },
  { when: "Month 1", label: "Business", title: `${stats.entrepreneurs.toLocaleString("en-IN")} businesses funded`, line: "Stock for a shop, tools for a workshop, livestock for a farm." },
  { when: "Every month", label: "Repayment", title: "Interest stays fair", line: `Up to 8.5% a year, no hidden charges. ${stats.principalRepaidPct.toFixed(1)}% of principal repaid so far.` },
  { when: "As they repay", label: "Credit history", title: "Repaying builds credit", line: "Every repayment is reported to the credit bureaus, so a credit history starts." },
  { when: "Next", label: "Opportunities", title: "The next loan doesn’t start from zero", line: "A credit record opens the door to more capital, from banks too." },
];
const N = 5;

export function V4Timeline({ stats }: { stats: RangDeStats }) {
  const STOPS = stopsFor(stats);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0); // first stop's dot to the last one's, px
  const [pad, setPad] = useState(0); // the track's left padding, so the first stop starts centred
  const [active, setActive] = useState(0);

  // The track slides from its first stop centred to its last stop centred.
  useEffect(() => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-stop]");
      if (cards.length < 2) return;
      const w = cards[0].offsetWidth;
      setTravel(cards[cards.length - 1].offsetLeft - cards[0].offsetLeft);
      setPad(Math.max(0, view.clientWidth / 2 - w / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(view);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  // A short hold at each end, so the first stop is read before it moves and the last one stays a moment.
  const p = useTransform(scrollYProgress, [0.05, 0.92], [0, 1], { clamp: true });
  // Rests on each stop, centred, then glides to the next.
  const step = useTransform(p, (v) => {
    const pos = v * (N - 1);
    const k = Math.min(N - 2, Math.floor(pos));
    const f = Math.min(1, Math.max(0, (pos - k - 0.3) / 0.4));
    return k + f * f * (3 - 2 * f);
  });
  const x = useTransform(step, (s) => (-s / (N - 1)) * travel);
  // The green: from the first dot to the one in the middle of the screen (it moves with the track, so it is the track's).
  const green = useTransform(step, (s) => (s / (N - 1)) * travel);
  useMotionValueEvent(step, "change", (s) => setActive(Math.round(s)));
  const [done, setDone] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setDone(v > 0.9));

  const heading = (
    <div className="flex flex-col items-center gap-4 px-4 text-center">
      <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-text-grey-80">Why it matters</p>
      <h2 className="max-w-[900px] font-display text-h3 font-bold [text-wrap:balance]">
        <span className="text-text-grey-100">You’re not just giving someone a loan. </span>
        <span className="text-green-dark">You’re helping them build their financial future.</span>
      </h2>
    </div>
  );

  if (reduce) {
    return (
      <section aria-label="How a loan builds a financial future" className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-white px-4 py-16 sm:px-8">
        {heading}
        <ol className="grid w-full max-w-[1100px] gap-3 md:grid-cols-5">
          {STOPS.map((s) => (
            <li key={s.label} className="flex flex-col gap-3">
              <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.2px] text-green-dark">{s.when}</p>
              <StopCard stop={s} on />
            </li>
          ))}
        </ol>
        <Closing />
      </section>
    );
  }

  return (
    <section aria-label="How a loan builds a financial future" className="mx-2 rounded-[16px] bg-white">
      <div ref={wrapRef} className="relative" style={{ height: "calc(4.2 * (100svh - var(--navbar-bottom, 0px)))" }}>
        <div
          className="sticky flex flex-col justify-center gap-10 overflow-hidden py-8 md:gap-14"
          style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
        >
          {heading}

          <div ref={viewRef} className="w-full">
            <motion.div ref={trackRef} style={{ x, paddingLeft: pad, paddingRight: pad }} className="relative flex w-max gap-4 md:gap-6">
              {/* The line through the dots, grey, and its green up to the current stop. */}
              <span aria-hidden className="absolute top-[6px] h-[2px] rounded-full bg-text-grey-16" style={{ left: pad + DOT / 2, width: travel }} />
              <motion.span aria-hidden className="absolute top-[5px] h-[4px] rounded-full" style={{ left: pad + DOT / 2, width: green, backgroundColor: GREEN }} />

              {STOPS.map((s, i) => {
                const reached = i <= active;
                return (
                  <div key={s.label} data-stop className="flex w-[76vw] max-w-[320px] shrink-0 flex-col md:w-[320px]">
                    <span
                      aria-hidden
                      className="relative z-10 block rounded-full border-[3px] border-white transition-colors duration-300"
                      style={{ width: DOT, height: DOT, backgroundColor: reached ? GREEN : "#d6d7da", boxShadow: `0 0 0 1.5px ${reached ? GREEN : "#d6d7da"}` }}
                    />
                    <p className={`mb-4 mt-3 font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.2px] transition-colors duration-300 ${reached ? "text-green-dark" : "text-text-grey-40"}`}>
                      {s.when}
                    </p>
                    <StopCard stop={s} on={i === active} />
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <motion.div initial={false} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }} transition={{ duration: 0.4, ease: EASE }}>
              <Closing />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return <p className="px-4 text-center font-display text-p1 font-bold text-text-grey-100 md:text-[20px] md:leading-[30px]">Today’s loan helps make tomorrow’s credit possible.</p>;
}

/** A stop: what it is, a short bold claim, one line. The one in the middle is white with a green outline; the rest are grey. */
function StopCard({ stop, on }: { stop: Stop; on: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col gap-3 rounded-[16px] p-6 transition-[background-color,box-shadow,opacity] duration-500 ${
        on ? "bg-white opacity-100 shadow-[0_0_0_1.5px_#62af1d,0_16px_40px_rgba(41,45,54,0.10)]" : "bg-[#f4f5f7] opacity-55"
      }`}
    >
      <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-text-grey-64">{stop.label}</p>
      <p className="font-display text-[24px] font-bold leading-[30px] tracking-[-0.48px] text-text-grey-100 [text-wrap:balance]">{stop.title}</p>
      <p className="font-display text-[17px] font-medium leading-[24px] text-text-grey-80">{stop.line}</p>
    </div>
  );
}
