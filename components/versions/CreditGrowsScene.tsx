"use client";

import Image from "next/image";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/*
 * Version 2's How it works, step 5, "Their credit grows" (from the review call): the borrower's side of the loop. Rekha Bai
 * (the borrower the earlier steps follow) with her credit rating: her repayments tick in, month by month, and the
 * needle on her rating moves from "New to credit" up to "Good". Then an arrow out to what that opens up: new possibilities
 * (expand the business, new machinery, more clients). Plays once each time the step opens (the parent remounts it).
 * Side by side in a wide frame; in a narrow one (phones) the possibilities take the card's place.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const MONTHS = 12;
const GREEN = "#62AF1D";
const BLUE_DEEP = "#00517A";
// The needle's sweep, in degrees from pointing straight up: left (new to credit) to right of centre (good).
const FROM = -78;
const TO = 48;

const RATINGS = [
  { at: -1, label: "New to credit", color: "rgba(41,45,54,0.48)" },
  { at: 0.35, label: "Fair", color: "#C98A0B" },
  { at: 0.72, label: "Good", color: "#399121" },
];

const POSSIBILITIES = [
  { label: "Expand the business", icon: "M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" },
  { label: "Buy new machinery", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" },
  { label: "Take on more clients", icon: "M10 13a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M15 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2 5h2a2 2 0 0 1 2 2v1M5 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h2" },
  { label: "A bigger loan next time", icon: "M3 17l6-6l4 4l8-8M14 7h7v7" },
];

export function CreditGrowsScene() {
  const reduce = useReducedMotion();
  // 0 → 1: the repayments and the needle.
  const t = useMotionValue(reduce ? 1 : 0);
  const [phase, setPhase] = useState<"rating" | "open">(reduce ? "open" : "rating");
  const [paid, setPaid] = useState(reduce ? MONTHS : 0);
  const [rating, setRating] = useState(reduce ? RATINGS.length - 1 : 0);

  useEffect(() => {
    if (reduce) return;
    const a = animate(t, 1, { duration: 3.4, delay: 0.6, ease: [0.45, 0, 0.25, 1] });
    const id = setTimeout(() => setPhase("open"), 4600);
    return () => {
      a.stop();
      clearTimeout(id);
    };
  }, [reduce, t]);

  useMotionValueEvent(t, "change", (v) => {
    setPaid(Math.min(MONTHS, Math.floor(v * MONTHS + 0.0001)));
    let r = 0;
    RATINGS.forEach((x, i) => {
      if (v >= x.at) r = i;
    });
    setRating(r);
  });
  const [deg, setDeg] = useState(reduce ? TO : FROM);
  useMotionValueEvent(t, "change", (v) => setDeg(FROM + (TO - FROM) * v));
  const open = phase === "open";

  return (
    <div className="@container size-full bg-[#FAFBF8]">
      <div className="flex size-full flex-col items-center justify-center gap-4 p-5 @[560px]:flex-row @[560px]:gap-6 @[560px]:p-10">
        {/* Her credit rating. */}
        <motion.div
          layout={!reduce}
          transition={{ duration: 0.6, ease: EASE }}
          className={`flex w-full max-w-[340px] flex-col gap-4 rounded-[16px] bg-white p-5 ${open ? "@max-[559px]:hidden" : ""} shadow-[0_1px_2px_rgba(41,45,54,0.06),0_6px_20px_rgba(41,45,54,0.10)] @[560px]:p-6`}
        >
          <div className="flex items-center gap-3">
            <span className="relative size-[44px] shrink-0 overflow-hidden rounded-full bg-[#F1F2F5]">
              <Image src="/how-it-works/s4-rekha.webp" alt="" fill sizes="44px" className="object-cover object-top" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-[20px] text-ink">Rekha Bai</p>
              <p className="font-display text-[12px] font-medium leading-[16px] text-ink/64">Grocery store · Rajasthan</p>
            </div>
          </div>

          {/* The gauge: a half ring, the part travelled in green, the needle over it. */}
          <div className="relative mx-auto w-full max-w-[240px]">
            <svg viewBox="0 0 200 112" className="block w-full" aria-hidden>
              <path d="M 16 100 A 84 84 0 0 1 184 100" fill="none" stroke="rgba(41,45,54,0.08)" strokeWidth="14" strokeLinecap="round" />
              {/* The green runs exactly to the needle. */}
              <path d="M 16 100 A 84 84 0 0 1 184 100" fill="none" stroke={GREEN} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={`${(deg + 90) / 180} 1`} />
              {/* Rotated by attribute round the hub (a CSS transform origin is unreliable inside SVG). */}
              <g transform={`rotate(${deg} 100 100)`}>
                <line x1="100" y1="100" x2="100" y2="40" stroke={BLUE_DEEP} strokeWidth="4" strokeLinecap="round" />
              </g>
              <circle cx="100" cy="100" r="8" fill={BLUE_DEEP} />
            </svg>
            <div className="mt-1 text-center">
              <p className="font-display text-[11px] font-bold uppercase leading-[14px] tracking-[0.88px] text-ink/48">Credit rating</p>
              <motion.p
                key={rating}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="font-display text-[22px] font-bold leading-[28px]"
                style={{ color: RATINGS[rating].color }}
              >
                {RATINGS[rating].label}
              </motion.p>
            </div>
          </div>

          {/* Her repayments, month by month, each reported to the credit bureaus. */}
          <div className="flex flex-col gap-2 border-t border-ink/8 pt-4">
            <div className="flex justify-between font-display text-[12px] font-medium leading-[16px] text-ink/64">
              <span>Repaid on time</span>
              <span className="font-bold text-ink tabular-nums">
                {paid} of {MONTHS} months
              </span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: MONTHS }, (_, i) => (
                <span key={i} className="h-[6px] rounded-full transition-colors duration-300" style={{ backgroundColor: i < paid ? GREEN : "rgba(41,45,54,0.08)" }} />
              ))}
            </div>
            <p className="font-display text-[11px] font-medium leading-[14px] text-ink/48">Every repayment is reported to the credit bureaus.</p>
          </div>
        </motion.div>

        {/* What it opens up. */}
        {open && (
          <>
            <motion.svg
              aria-hidden
              viewBox="0 0 24 24"
              className="hidden size-[28px] shrink-0 text-ink/40 @[560px]:block"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <path d="M5 12h14M13 6l6 6l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            <div className="flex w-full max-w-[340px] flex-col gap-2 @[560px]:max-w-[260px]">
              <motion.p
                className="font-display text-[11px] font-bold uppercase leading-[14px] tracking-[0.88px] text-green-dark"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              >
                New possibilities
              </motion.p>
              {POSSIBILITIES.map((p, i) => (
                <motion.div
                  key={p.label}
                  className="flex items-center gap-3 rounded-[12px] bg-white px-3 py-2.5 shadow-[0_0_0_1px_rgba(41,45,54,0.06)] @[560px]:py-3"
                  initial={reduce ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.25, ease: EASE }}
                >
                  <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6E6] text-[#3A6E0C]">
                    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
                      <path d={p.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="font-display text-[14px] font-bold leading-[18px] text-ink">{p.label}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
