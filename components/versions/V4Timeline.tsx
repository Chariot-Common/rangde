"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Version 2 B's "Why it matters": the same idea as Version 2's loop (your social investment → business → repayment →
 * credit history → opportunities), told as one borrower's story over time instead of an abstract ring. The section pins
 * and a timeline slides past sideways as you scroll: Month 0, your ₹2,000; Month 1, Rekha restocks her shop; Months 2–13,
 * twelve repayments; Month 13, her first credit score; Year 2, a bigger loan. Each stop lights up as it reaches the middle
 * of the screen, and the track under it fills green. It ends on "Today's loan helps make tomorrow's credit possible."
 * The figures are an illustration (marked as such), built from the How it works example. With reduced motion the stops
 * are a plain list.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";
const GREEN_DARK = "#3A6E0C";
const GREEN_LIGHT = "#cbe0b8";
const ICONS = "/images/why-rangde-v2";

type Stop = { when: string; label: string; title: string; text: string; icon: string; visual: "invest" | "photo" | "repay" | "score" | "grow" };
const STOPS: Stop[] = [
  { when: "Month 0", label: "Your social investment", title: "₹2,000 from you", text: "Alongside 30 other social investors, you fund Rekha’s ₹40,000 loan.", icon: `${ICONS}/icon-banknotes.webp`, visual: "invest" },
  { when: "Month 1", label: "Business", title: "Her shop, restocked", text: "Rekha fills the shelves of her grocery store in Rajasthan and sells more each week.", icon: `${ICONS}/icon-bank.webp`, visual: "photo" },
  { when: "Months 2–13", label: "Repayment", title: "12 repayments, all on time", text: "Every month she repays from what the shop earns, and your share comes back to you.", icon: `${ICONS}/icon-hand-check.webp`, visual: "repay" },
  { when: "Month 13", label: "Credit history", title: "Her first credit score", text: "Each repayment was reported to the credit bureaus. For the first time, she has a credit file.", icon: `${ICONS}/icon-bar-chart.webp`, visual: "score" },
  { when: "Year 2", label: "Opportunities", title: "A bigger loan, ₹1,00,000", text: "With a good score she can borrow more, for a second counter and a fridge.", icon: `${ICONS}/icon-target-center.webp`, visual: "grow" },
];
const N = STOPS.length;

const PHONE = "(max-width: 767px)";

export function V4Timeline() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0); // how far the track slides, px
  const [active, setActive] = useState(0);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(PHONE);
    const on = () => setPhone(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  // The track slides from its first stop centred to its last stop centred.
  useEffect(() => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-stop]");
      if (cards.length < 2) return;
      const first = cards[0].offsetLeft + cards[0].offsetWidth / 2;
      const last = cards[cards.length - 1].offsetLeft + cards[cards.length - 1].offsetWidth / 2;
      setTravel(last - first);
      track.style.paddingLeft = `${view.clientWidth / 2 - cards[0].offsetWidth / 2}px`;
      track.style.paddingRight = `${view.clientWidth / 2 - cards[cards.length - 1].offsetWidth / 2}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(view);
    ro.observe(track);
    return () => ro.disconnect();
  }, [phone]);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  // A short hold at each end, so the first stop is read before it moves and the last one stays a moment.
  const p = useTransform(scrollYProgress, [0.05, 0.92], [0, 1], { clamp: true });
  // Rests on each stop, centred, for a while, then glides to the next (moving all the time, it left the card half off the
  // screen between stops on phones).
  const x = useTransform(p, (v) => {
    const pos = v * (N - 1);
    const k = Math.min(N - 2, Math.floor(pos));
    const f = Math.min(1, Math.max(0, (pos - k - 0.3) / 0.4));
    const eased = f * f * (3 - 2 * f);
    return -((k + eased) / (N - 1)) * travel;
  });
  const fill = useTransform(p, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(N - 1, Math.round(v * (N - 1)))));
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
            <li key={s.label}>
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
          className="sticky flex flex-col justify-center gap-8 overflow-hidden py-8 md:gap-12"
          style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px))" }}
        >
          {heading}

          <div ref={viewRef} className="relative w-full">
            {/* The timeline: a track with a dot for each stop, filling green as it slides. */}
            <motion.div ref={trackRef} style={{ x }} className="relative flex w-max items-stretch gap-4 md:gap-6">
              {STOPS.map((s, i) => (
                <div key={s.label} data-stop className="flex w-[78vw] max-w-[340px] shrink-0 flex-col gap-4 md:w-[340px]">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative z-10 size-[14px] shrink-0 rounded-full border-[3px] border-white transition-colors duration-300"
                      style={{ backgroundColor: i <= active ? GREEN : "var(--color-text-grey-24)", boxShadow: `0 0 0 1.5px ${i <= active ? GREEN : "var(--color-text-grey-24)"}` }}
                    />
                    <span className={`font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.2px] transition-colors duration-300 ${i <= active ? "text-green-dark" : "text-text-grey-40"}`}>{s.when}</span>
                  </div>
                  <StopCard stop={s} on={i === active} past={i < active} />
                </div>
              ))}
              {/* The track behind the dots. */}
              <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-[7px] -z-0 h-[2px] bg-text-grey-16" />
            </motion.div>
            {/* The green, from the left edge to the middle of the screen, where the current stop is. */}
            <div aria-hidden className="pointer-events-none absolute left-0 top-[6px] h-[4px] w-1/2 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ width: fill, backgroundColor: GREEN, marginLeft: "auto" }} />
            </div>
          </div>

          <motion.div initial={false} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }} transition={{ duration: 0.4, ease: EASE }}>
            <Closing />
          </motion.div>
          <p className="px-4 text-center font-display text-[11px] font-medium leading-[16px] text-text-grey-48">
            An illustration: the amounts and timings show how a typical loan unfolds.
          </p>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return <p className="px-4 text-center font-display text-p1 font-bold text-text-grey-100 md:text-[20px] md:leading-[30px]">Today’s loan helps make tomorrow’s credit possible.</p>;
}

/** One stop on the timeline: its label, a small picture of the moment, the line. `on` for the stop in the middle. */
function StopCard({ stop, on, past = false }: { stop: Stop; on: boolean; past?: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col gap-4 rounded-[16px] p-5 transition-[background-color,box-shadow,opacity,transform] duration-500 ${
        on ? "bg-white shadow-[0_0_0_1.5px_#62af1d,0_16px_40px_rgba(41,45,54,0.10)]" : past ? "bg-[#f6f9f2] opacity-80" : "bg-[#f4f5f7] opacity-60"
      }`}
      style={{ transform: on ? "translateY(-4px)" : "none" }}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: GREEN_LIGHT }}>
          <span className="block size-[20px]" style={{ backgroundColor: GREEN_DARK, WebkitMask: `url(${stop.icon}) center / contain no-repeat`, mask: `url(${stop.icon}) center / contain no-repeat` }} />
        </span>
        <span className="font-display text-[13px] font-bold uppercase leading-[16px] tracking-[0.88px] text-text-grey-64">{stop.label}</span>
      </div>
      <Visual kind={stop.visual} on={on} />
      <div className="flex flex-col gap-1">
        <p className="font-display text-[20px] font-bold leading-[26px] text-text-grey-100">{stop.title}</p>
        <p className="font-display text-[15px] font-medium leading-[22px] text-text-grey-64">{stop.text}</p>
      </div>
    </div>
  );
}

/** A small picture of each moment. */
function Visual({ kind, on }: { kind: Stop["visual"]; on: boolean }) {
  const box = "flex h-[96px] items-center justify-center rounded-[12px] bg-[#fafbf8]";
  if (kind === "photo")
    return (
      <div className="relative h-[96px] overflow-hidden rounded-[12px]">
        {/* Rekha Bai's photo from her listing on rangde.in (the same one the How it works animation uses), cropped to her face. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- remote listing photo, sized by imgix */}
        <img src="https://rangde.imgix.net/bImg/Rekha-42-img.jpg?auto=compress,format&w=680&h=192&fit=crop&crop=faces" alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      </div>
    );
  if (kind === "invest")
    return (
      <div className={`${box} gap-2`}>
        <span className="flex size-[44px] items-center justify-center rounded-full bg-white font-display text-[18px] font-bold text-green-dark shadow-[0_0_0_2px_#62af1d]">₹</span>
        <span className="font-display text-[26px] font-bold text-text-grey-100">2,000</span>
      </div>
    );
  if (kind === "repay")
    return (
      <div className={`${box} flex-col gap-2 px-4`}>
        <div className="grid w-full grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.span
              key={i}
              className="h-[22px] rounded-[4px]"
              initial={false}
              animate={{ backgroundColor: on ? GREEN : "rgba(41,45,54,0.08)" }}
              transition={{ duration: 0.25, delay: on ? i * 0.06 : 0 }}
            />
          ))}
        </div>
        <span className="font-display text-[12px] font-bold text-text-grey-64">On time, month after month</span>
      </div>
    );
  if (kind === "score")
    return (
      <div className={`${box} flex-col gap-1`}>
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.88px] text-text-grey-48">Credit score</span>
        <span className="font-display text-[34px] font-bold leading-[38px] text-[#3F8A22]">742</span>
        <span className="font-display text-[12px] font-bold text-text-grey-64">Good</span>
      </div>
    );
  return (
    <div className={`${box} items-end gap-3 pb-4`}>
      <div className="flex flex-col items-center gap-1">
        <span className="w-[44px] rounded-[6px] bg-text-grey-16" style={{ height: 28 }} />
        <span className="font-display text-[11px] font-bold text-text-grey-48">₹40k</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <motion.span className="w-[44px] rounded-[6px]" style={{ backgroundColor: GREEN }} initial={false} animate={{ height: on ? 62 : 28 }} transition={{ duration: 0.6, ease: EASE }} />
        <span className="font-display text-[11px] font-bold text-green-dark">₹1L</span>
      </div>
    </div>
  );
}
