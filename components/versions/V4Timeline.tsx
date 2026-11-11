"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Version 2 B's "Why it matters": Version 2's loop (your social investment → business → repayment → credit history →
 * opportunities) told as one borrower's story over time. The section pins and a timeline slides past sideways as you
 * scroll, resting on each stop in the middle of the screen: Month 0, you lend ₹2,000; Month 1, Rekha restocks her shop;
 * Months 2–13, 12 of 12 repaid on time; Month 13, her first credit score; Year 2, a ₹1,00,000 loan.
 *
 * Kept direct (review, 11 Nov 2026): each stop is a small label, one big figure and one short line. The track is a line
 * with a dot per stop that moves with the cards and fills green up to the current stop; each date sits under its dot,
 * clear of the line. The figures are an illustration (marked as such). With reduced motion the stops are a plain row.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";
const DOT = 14; // the dot's size; the line runs through the dots' centres

type Stop = { when: string; label: string; figure: string; line: string; photo?: string };
const REKHA = "https://rangde.imgix.net/bImg/Rekha-42-img.jpg?auto=compress,format&w=160&h=160&fit=facearea&facepad=2.2";
const STOPS: Stop[] = [
  { when: "Month 0", label: "Your social investment", figure: "₹2,000", line: "You lend to Rekha, with 30 others." },
  { when: "Month 1", label: "Business", figure: "Restocked", line: "Rekha fills the shelves of her grocery store.", photo: REKHA },
  { when: "Months 2–13", label: "Repayment", figure: "12/12", line: "Repaid on time, from what the shop earns." },
  { when: "Month 13", label: "Credit history", figure: "742", line: "Her first credit score. Rated good." },
  { when: "Year 2", label: "Opportunities", figure: "₹1,00,000", line: "Her next loan, two and a half times the first." },
];
const N = STOPS.length;

export function V4Timeline() {
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
            <p className="px-4 text-center font-display text-[11px] font-medium leading-[16px] text-text-grey-48">An illustration of how a typical loan unfolds.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return <p className="px-4 text-center font-display text-p1 font-bold text-text-grey-100 md:text-[20px] md:leading-[30px]">Today’s loan helps make tomorrow’s credit possible.</p>;
}

/** A stop: what it is, one big figure, one line. The one in the middle is white with a green outline; the rest are grey. */
function StopCard({ stop, on }: { stop: Stop; on: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col gap-3 rounded-[16px] p-6 transition-[background-color,box-shadow,opacity] duration-500 ${
        on ? "bg-white opacity-100 shadow-[0_0_0_1.5px_#62af1d,0_16px_40px_rgba(41,45,54,0.10)]" : "bg-[#f4f5f7] opacity-55"
      }`}
    >
      <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-text-grey-64">{stop.label}</p>
      <div className="flex items-center gap-3">
        {stop.photo && (
          // eslint-disable-next-line @next/next/no-img-element -- Rekha Bai's photo from her rangde.in listing, sized by imgix
          <img src={stop.photo} alt="" className="size-[48px] shrink-0 rounded-full object-cover" loading="lazy" />
        )}
        <p className="font-display text-[40px] font-bold leading-[44px] tracking-[-0.8px] text-green-dark">{stop.figure}</p>
      </div>
      <p className="font-display text-[17px] font-medium leading-[24px] text-text-grey-80">{stop.line}</p>
    </div>
  );
}
