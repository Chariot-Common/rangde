"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { STATS_SNAPSHOT as LIVE, roundedPlus } from "@/lib/stats";

/**
 * "Why Rang De?" — version C, told through one real entrepreneur. Every fact about Durga
 * is from her public listing (rangde.in/i/durga-294, Oct 2026); the closing numbers are
 * the same figures as the original three-card version.
 *
 * Plays as you scroll: the photo, then each beat as it reaches the screen — the problem,
 * then the rail draws down to our answer, then the impact, then the closing bar.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
/** Least time between one beat appearing and the next, even if both are already on screen. */
const BEAT_GAP_MS = 700;

const DURGA_PHOTO = "https://rangde.imgix.net/bImg/durgamanawar01-img.jpg?auto=compress,format&w=900&h=1100&fit=crop&crop=faces";
const DURGA_URL = "https://rangde.in/i/durga-294";

// Told from Rang De's side (we found the problem, we said yes), in the cadence of the
// three-step version, and kept personal: every detail is from her rangde.in listing — six
// years running her shop, breadwinner for a family of four, a tent and decoration business
// for weddings and celebrations, her first credit, up to 318 days of livelihood.
const BEATS = [
  {
    label: "What we found",
    title: "Six years behind the counter. Still no loan.",
    text: "Durga runs her shop in Dhar and supports a family of four. She had a plan to rent out tents for weddings, but with no credit history or collateral, no bank would lend to her.",
  },
  {
    label: "What we did",
    title: "Rang De made it a yes.",
    text: "With Transform Rural India Foundation, we met her on the ground, saw her shop and checked her plan, then listed her so social investors could back her. Now she can set up the new business without emptying her family's savings all at once.",
  },
  {
    label: "What changed",
    title: "Durga's first credit.",
    text: "Her first loan ever. A second business beside the shop she built. And up to 318 days of work for her and her team.",
  },
];

/** Beats arrive one at a time as you scroll to them: each waits until it's on screen and
 * the one before it has had its moment, so the problem always lands before the answer. */
function useBeats(refs: React.RefObject<HTMLLIElement | null>[], enabled: boolean) {
  const [shown, setShown] = useState(enabled ? 0 : refs.length);
  const seen = useRef<boolean[]>(refs.map(() => false));
  useEffect(() => {
    if (!enabled) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const i = refs.findIndex((r) => r.current === e.target);
        if (i >= 0 && e.isIntersecting) seen.current[i] = true;
      }),
      { rootMargin: "0px 0px -25% 0px", threshold: 0.4 },
    );
    refs.forEach((r) => r.current && io.observe(r.current));
    const tick = setInterval(() => setShown((n) => (n < refs.length && seen.current[n] ? n + 1 : n)), BEAT_GAP_MS);
    return () => {
      io.disconnect();
      clearInterval(tick);
    };
  }, [refs, enabled]);
  return shown;
}

export function WhyRangDeStory() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const r0 = useRef<HTMLLIElement>(null), r1 = useRef<HTMLLIElement>(null), r2 = useRef<HTMLLIElement>(null);
  const [beatRefs] = useState(() => [r0, r1, r2]);
  const shown = useBeats(beatRefs, !reduce);
  // With reduced motion everything is simply shown; otherwise each piece waits for `inView`.
  const show = reduce || inView;
  const t = (delay: number, duration = 0.6) => (reduce ? { duration: 0 } : { duration, delay, ease: EASE });

  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-10 lg:gap-12">
        <h2 className="text-center font-display text-h3 font-bold text-ink">Why Rang De?</h2>

        <div ref={ref} className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
          {/* Durga */}
          <motion.figure
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={t(0, 0.7)}
            className="relative mx-auto aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-[16px] bg-ink/8 shadow-[0_8px_24px_rgba(41,45,54,0.12)] lg:aspect-[4/5]"
          >
            <Image src={DURGA_PHOTO} alt="Durga Chouhan" fill unoptimized sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/72 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
              <span className="font-display text-p1 font-bold text-white">Durga Chouhan</span>
              <span className="font-display text-p4 font-medium text-white/80">
                Runs a grocery shop, 6 years · Dhar, Madhya Pradesh
              </span>
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/16 px-2.5 py-1 font-display text-[11px] font-semibold text-white backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="size-[13px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
                  <path d="M9 12l2.2 2.2L15.5 10" />
                </svg>
                Verified by Transform Rural India Foundation
              </span>
            </figcaption>
          </motion.figure>

          {/* Her story in three beats */}
          <ol className="flex flex-col">
            {BEATS.map((b, i) => {
              const on = !!reduce || i < shown;
              const nextOn = !!reduce || i + 1 < shown;
              const isLast = i === BEATS.length - 1;
              const tt = (d = 0, dur = 0.6) => (reduce ? { duration: 0 } : { duration: dur, delay: d, ease: EASE });
              return (
              <li key={b.label} ref={beatRefs[i]} className="relative flex gap-5 pb-8 last:pb-0">
                {/* rail: grey track, with a line that draws down once the next beat arrives */}
                {!isLast && (
                  <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-20px)] w-px bg-ink/12">
                    <motion.span
                      className="absolute inset-0 origin-top bg-green-dark/48"
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={{ scaleY: nextOn ? 1 : 0 }}
                      transition={tt(0, 0.5)}
                    />
                  </span>
                )}
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={tt(0, 0.4)}
                  className={`mt-1 flex size-[23px] shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold ${
                    isLast ? "bg-green-dark text-white" : "bg-white text-ink/64 shadow-[0_1px_2px_rgba(41,45,54,0.12)]"
                  }`}
                >
                  {i + 1}
                </motion.span>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={tt(0.05)}
                  className="flex flex-col gap-2"
                >
                  <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-ink/56">{b.label}</p>
                  <p className={`font-display text-h4 font-bold ${isLast ? "text-green-dark" : "text-ink"}`}>{b.title}</p>
                  <p className="font-display text-p2 font-medium text-ink/72">{b.text}</p>
                </motion.div>
              </li>
              );
            })}
          </ol>
        </div>

        {/* She's one of many */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={shown >= BEATS.length ? { opacity: 1, y: 0 } : undefined}
          transition={t(0.4)}
          className="flex w-full flex-col items-center gap-5 rounded-[16px] bg-white px-6 py-6 text-center shadow-[0_4px_16px_rgba(41,45,54,0.08)] sm:flex-row sm:justify-between sm:text-left"
        >
          <p className="font-display text-p2 font-medium text-ink/80">
            Durga is one of <b className="font-bold text-ink">{roundedPlus(LIVE.entrepreneurs)} entrepreneurs</b> across{" "}
            <b className="font-bold text-ink">{LIVE.states} states</b> Rang De has backed.
          </p>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <a
              href={DURGA_URL}
              className="inline-flex h-[44px] items-center justify-center rounded-[4px] bg-primary px-5 font-display text-p3 font-bold text-white transition-[filter] hover:brightness-95"
            >
              Support Durga
            </a>
            <a
              href="#opportunities"
              className="inline-flex h-[44px] items-center justify-center rounded-[4px] bg-primary/16 px-5 font-display text-p3 font-bold text-primary transition-colors hover:bg-primary/24"
            >
              Meet more entrepreneurs
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
