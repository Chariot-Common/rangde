"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { PAIRS, type Side } from "./ProblemPairs";

/*
 * Version 1.1 D: the problem stays. Six cards in one pinned section: the three problems along the top, each answered
 * by a card under it. On scroll the problems come in, then one column at a time the problem is struck through (it stays
 * readable), a short line drops from it, and Rang De's answer rises into the row below. At the end all six are on
 * screen, each problem above its answer. One heading; each card is one sentence (the point in bold, the why or how
 * after it), with the animated Why Rang De icon for it. On phones each problem is followed by its answer, and each pair
 * plays as it scrolls into view.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = {
  problem: ["icon-bank", "icon-banknotes", "icon-warning-circle"],
  solution: ["icon-hand-check", "icon-shield-check", "icon-bar-chart"],
};
// Across the pinned scroll (0–1): when problem i comes in, and when it is answered.
const IN = (i: number) => 0.02 + i * 0.07;
const ANSWER = (i: number) => 0.3 + i * 0.2;

const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

function Icon({ name, color, tint }: { name: string; color: string; tint: string }) {
  const src = `/images/why-rangde-v2/${name}.webp`;
  return (
    <span className="flex size-[48px] shrink-0 items-center justify-center rounded-[14px] sm:size-[52px]" style={{ background: tint }}>
      <span className="block size-[26px] sm:size-[28px]" style={{ background: color, WebkitMask: `url(${src}) center / contain no-repeat`, mask: `url(${src}) center / contain no-repeat` }} />
    </span>
  );
}

function Sentence({ s, struck, tone }: { s: Side; struck?: boolean; tone: "problem" | "solution" }) {
  const reduce = useReducedMotion();
  return (
    <p className={`font-display text-[18px] font-medium leading-[26px] [text-wrap:pretty] sm:text-[20px] sm:leading-[29px] lg:text-[22px] lg:leading-[31px] ${tone === "solution" ? "text-text-grey-80" : "text-text-grey-64"}`}>
      <span
        className="font-bold text-text-grey-100 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
        style={{
          backgroundImage: "linear-gradient(currentColor, currentColor)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 58%",
          backgroundSize: struck ? "100% 0.09em" : "0% 0.09em",
          transition: reduce ? "none" : "background-size .55s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {s.title}.
      </span>{" "}
      {s.line}
    </p>
  );
}

/** One column: the problem, the line down, the answer. */
function Pair({ i, shown, answered }: { i: number; shown: boolean; answered: boolean }) {
  const [problem, solution] = PAIRS[i];
  const reduce = useReducedMotion();
  const tr = (delay = 0) => ({ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: EASE });
  return (
    // On phones a column of its own; from md up its three parts drop into the shared grid rows (display: contents), so
    // every problem card is as tall as the tallest problem, and every answer as tall as the tallest answer.
    <div className="flex flex-col md:contents">
      {/* The problem: stays, struck through and settled back once answered. */}
      <motion.div
        className="flex min-h-[200px] flex-col gap-5 rounded-[20px] bg-white p-6 sm:p-7 lg:min-h-[200px]"
        initial={false}
        animate={{ opacity: shown ? (answered ? 0.7 : 1) : 0, y: shown ? 0 : 24 }}
        transition={tr()}
      >
        <Icon name={ICONS.problem[i]} color="#D92D3A" tint="#FCE8EA" />
        <Sentence s={problem} tone="problem" struck={answered} />
      </motion.div>

      {/* The line from the problem down to its answer. */}
      <div aria-hidden className="relative mx-auto h-[28px] w-[2px] sm:h-[36px]">
        <motion.span className="absolute inset-0 origin-top rounded-full bg-green-dark" initial={false} animate={{ scaleY: answered ? 1 : 0 }} transition={tr(0.2)} />
      </div>

      {/* Rang De's answer, rising in under it. */}
      <motion.div
        className="flex min-h-[200px] flex-col gap-5 rounded-[20px] bg-[#cbe0b8] p-6 sm:p-7 lg:min-h-[200px]"
        initial={false}
        animate={{ opacity: answered ? 1 : 0, y: answered ? 0 : 28 }}
        transition={tr(0.4)}
      >
        <Icon name={ICONS.solution[i]} color="#3A6E0C" tint="rgba(255,255,255,0.6)" />
        <Sentence s={solution} tone="solution" />
      </motion.div>
    </div>
  );
}

/** On phones: a pair that plays once it is well on screen. */
function PhonePair({ i }: { i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.25 });
  const answered = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref}>
      <Pair i={i} shown={shown} answered={answered} />
    </div>
  );
}

export function ProblemGrid() {
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [pr, setPr] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPr(v));
  const pinned = !phone && !reduce;
  const p = pinned ? pr : 1;

  const heading = (
    <h2 className="mx-auto max-w-[900px] text-center font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance]">
      The financial system wasn’t built for rural India.{" "}
      <motion.span className="text-green-dark" initial={false} animate={{ opacity: p >= ANSWER(0) || phone ? 1 : 0.16 }} transition={{ duration: 0.5 }}>
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
        <div aria-hidden className="flex flex-col gap-8 md:grid md:grid-flow-col md:grid-cols-3 md:grid-rows-[auto_auto_auto] md:gap-x-3 md:gap-y-0">
          {PAIRS.map((_, i) => (phone && !reduce ? <PhonePair key={i} i={i} /> : <Pair key={i} i={i} shown answered />))}
        </div>
        {srList}
      </section>
    );
  }

  return (
    <div ref={ref} className="relative" style={{ height: "calc(3.2 * (100svh - var(--navbar-bottom, 0px)))" }}>
      <section
        aria-label="The problem, and what Rang De does about it"
        className="sticky mx-2 flex flex-col justify-center gap-8 rounded-[16px] bg-bg-grey px-6 py-10 sm:px-10 lg:gap-12 lg:px-[64px]"
        style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100svh - var(--navbar-bottom, 0px) - 8px)" }}
      >
        {heading}
        {/* Three columns, three shared rows (problems, lines, answers), filled column by column. */}
        <div aria-hidden className="mx-auto grid w-full max-w-[1320px] grid-flow-col grid-cols-3 grid-rows-[auto_auto_auto] gap-x-3 lg:gap-x-4">
          {PAIRS.map((_, i) => (
            <Pair key={i} i={i} shown={p >= IN(i)} answered={p >= ANSWER(i)} />
          ))}
        </div>
        {srList}
      </section>
    </div>
  );
}
