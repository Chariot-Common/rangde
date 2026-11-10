"use client";

import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PAIRS, type Side } from "./ProblemPairs";

/*
 * Version 1.1 C: the problem and what Rang De built as three cards side by side, in one pinned section. On
 * scroll, one card at a time is cut, and becomes Rang De's answer to it. One heading (it carries on with "So we built
 * one at Rang De." once the first card turns), then each card is one sentence: the point in bold, the why or how after
 * it, at one size. The cut: a line is drawn through the point, then the card turns green as the struck sentence lifts
 * out and the answer rises in, while the animated icon at the top (from the Why Rang De set) hands over from the
 * problem's (red) to the answer's (green). `style` "replace" is the same without the icons (not used on a page now).
 * On phones the cards are stacked and each turns as it scrolls into view, rather than the section being pinned.
 */

export type CutStyle = "replace" | "motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = {
  problem: ["icon-bank", "icon-banknotes", "icon-warning-circle"],
  solution: ["icon-hand-check", "icon-shield-check", "icon-bar-chart"],
};
// Where card i is cut (0–1 across the pinned scroll), and how long after the cut the answer arrives.
const CUT_AT = (i: number) => 0.18 + i * 0.24;
const SWAP_AFTER = 0.06;

const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

const SENTENCE = "font-display text-[20px] font-medium leading-[28px] [text-wrap:pretty] sm:text-[22px] sm:leading-[31px] lg:text-[24px] lg:leading-[34px]";

/** The point in bold, then why/how, at one size. `cut`: a line drawn through the point. */
function Sentence({ s, tone, cut = false }: { s: Side; tone: "problem" | "solution"; cut?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <p className={`${SENTENCE} ${tone === "solution" ? "text-text-grey-80" : "text-text-grey-64"}`}>
      <span
        className="font-bold text-text-grey-100 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
        style={{
          backgroundImage: "linear-gradient(currentColor, currentColor)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 58%",
          backgroundSize: cut ? "100% 0.09em" : "0% 0.09em",
          transition: reduce ? "none" : "background-size .55s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {s.title}.
      </span>{" "}
      {s.line}
    </p>
  );
}

/** One of the animated Why Rang De icons, as a mask so it takes the card's colour. */
function MotionIcon({ name, color, tint }: { name: string; color: string; tint: string }) {
  const src = `/images/why-rangde-v2/${name}.webp`;
  return (
    <span className="flex size-[56px] items-center justify-center rounded-[16px] sm:size-[64px]" style={{ background: tint }}>
      <span className="block size-[30px] sm:size-[34px]" style={{ background: color, WebkitMask: `url(${src}) center / contain no-repeat`, mask: `url(${src}) center / contain no-repeat` }} />
    </span>
  );
}

function Card({ i, style, cut, swapped }: { i: number; style: CutStyle; cut: boolean; swapped: boolean }) {
  const [problem, solution] = PAIRS[i];
  const reduce = useReducedMotion();
  const fade = { duration: reduce ? 0 : 0.6, ease: EASE };

  // "replace" and "motion": the card itself turns; the struck sentence lifts out and the answer rises in.
  return (
    <motion.div
      className="relative flex min-h-[240px] flex-col gap-6 overflow-hidden rounded-[20px] p-7 sm:p-9 md:min-h-[300px] lg:min-h-[340px]"
      initial={false}
      animate={{ backgroundColor: swapped ? "#cbe0b8" : "#ffffff" }}
      transition={fade}
    >
      {style === "motion" && (
        <div className="relative h-[56px] sm:h-[64px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={swapped ? "s" : "p"}
              className="absolute left-0 top-0"
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {swapped ? (
                <MotionIcon name={ICONS.solution[i]} color="#3A6E0C" tint="rgba(255,255,255,0.6)" />
              ) : (
                <MotionIcon name={ICONS.problem[i]} color="#D92D3A" tint="#FCE8EA" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      <div className={`relative flex-1 ${style === "motion" ? "" : "flex items-center"}`}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={swapped ? "s" : "p"}
            className={style === "motion" ? "" : "w-full"}
            initial={reduce ? false : { y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -36, opacity: 0 }}
            transition={fade}
          >
            {swapped ? <Sentence s={solution} tone="solution" /> : <Sentence s={problem} tone="problem" cut={cut} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** On phones: a card that cuts and turns by itself once it is well on screen. */
function PhoneCard({ i, style }: { i: number; style: CutStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const [swapped, setSwapped] = useState(false);
  const reduce = useReducedMotion();
  // The answer arrives a beat after the cut.
  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setSwapped(true), reduce ? 0 : 700);
    return () => clearTimeout(id);
  }, [inView, reduce]);
  return (
    <div ref={ref}>
      <Card i={i} style={style} cut={inView} swapped={swapped} />
    </div>
  );
}

export function ProblemCards({ style }: { style: CutStyle }) {
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPr(v));
  const pinned = !phone && !reduce;
  const p = pinned ? pr : 1;
  const anyTurned = p >= CUT_AT(0) + SWAP_AFTER;

  const heading = (
    <h2 className="mx-auto max-w-[900px] text-center font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance]">
      The financial system wasn’t built for rural India.{" "}
      <motion.span className="text-green-dark" initial={false} animate={{ opacity: anyTurned || phone ? 1 : 0.16 }} transition={{ duration: 0.5 }}>
        So we built one at Rang De.
      </motion.span>
    </h2>
  );

  const srList = (
    <ol className="sr-only">
      {PAIRS.map(([b, a]) => (
        <li key={b.title}>
          {b.title}. {b.line} With Rang De: {a.title}. {a.line}
        </li>
      ))}
    </ol>
  );

  if (!pinned) {
    return (
      <section aria-label="The problem, and what Rang De does about it" className="mx-2 flex flex-col gap-8 rounded-[16px] bg-bg-grey px-4 py-14 sm:px-8">
        {heading}
        <div aria-hidden className="flex flex-col gap-3">
          {PAIRS.map((_, i) => (phone && !reduce ? <PhoneCard key={i} i={i} style={style} /> : <Card key={i} i={i} style={style} cut swapped />))}
        </div>
        {srList}
      </section>
    );
  }

  return (
    <div ref={ref} className="relative" style={{ height: "calc(3.4 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <section
        aria-label="The problem, and what Rang De does about it"
        className="sticky mx-2 flex flex-col justify-center gap-10 rounded-[16px] bg-bg-grey px-6 py-12 sm:px-10 lg:gap-14 lg:px-[64px]"
        style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px) - 8px)" }}
      >
        {heading}
        <div aria-hidden className="mx-auto grid w-full max-w-[1320px] grid-cols-3 gap-3 lg:gap-4">
          {PAIRS.map((_, i) => (
            <Card key={i} i={i} style={style} cut={p >= CUT_AT(i)} swapped={p >= CUT_AT(i) + SWAP_AFTER} />
          ))}
        </div>
        {srList}
      </section>
    </div>
  );
}
