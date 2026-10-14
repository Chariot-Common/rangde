"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { DURGA, STORY, TONE } from "./durgaStory";
import { StoryClosing } from "./StoryClosing";

/**
 * "Why Rang De?" — one card that changes as you scroll. The section is tall; the card stays
 * pinned in view and turns from the problem (warm grey) into our answer (blue) into the
 * impact (green) as the reader scrolls through it. One idea on screen at a time; the
 * reader's scroll drives every change, nothing plays on its own.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function WhyRangDeMorph() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STORY.length - 1, Math.floor(p * STORY.length));
    setActive((cur) => (cur === next ? cur : next));
  });

  const stage = STORY[active];
  const swap = reduce ? { duration: 0 } : { duration: 0.4, ease: EASE };

  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 pb-12 sm:px-8">
      {/* Scroll track: ~70vh of scrolling per stage. The heading and the card are pinned
          together as one block while the card changes, then release at the end. */}
      <div ref={trackRef} className="relative" style={{ height: `calc(100vh + ${(STORY.length - 1) * 70}vh)` }}>
        <div className="sticky top-[var(--navbar-bottom,74px)] flex h-[calc(100vh-var(--navbar-bottom,74px))] flex-col items-center justify-center gap-8 lg:gap-12">
          <h2 className="text-center font-display text-h3 font-bold text-ink">Why Rang De?</h2>
          <motion.div
            animate={{ backgroundColor: TONE[stage.tone].card }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
            className="relative flex w-full max-w-[760px] flex-col gap-6 overflow-hidden rounded-[24px] p-6 shadow-[0_8px_24px_rgba(41,45,54,0.10)] sm:p-10"
          >
            {/* Who this is about — constant across stages. */}
            <div className="flex items-center gap-3">
              <div className="relative size-[48px] shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                <Image src={DURGA.thumb} alt={DURGA.name} fill unoptimized sizes="48px" className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-p3 font-bold text-ink">{DURGA.name}</span>
                <span className="font-display text-p4 font-medium text-ink/64">
                  {DURGA.role} · {DURGA.place}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={swap}
                className="flex min-h-[220px] flex-col gap-3 sm:min-h-[200px]"
              >
                <span className={`inline-flex w-fit items-center gap-2 rounded-full bg-white/72 px-3 py-1 font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] ${TONE[stage.tone].chip}`}>
                  <span className={`size-[6px] rounded-full ${TONE[stage.tone].dot}`} />
                  {stage.label}
                </span>
                <p className="font-display text-h4 font-bold text-ink">{stage.title}</p>
                <p className="font-display text-p2 font-medium text-ink/72">{stage.text}</p>
                {stage.aside && <p className="font-display text-p3 font-medium text-ink/56">{stage.aside}</p>}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {stage.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/80 px-2.5 py-1 font-display text-[11px] font-bold text-ink">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Where you are in the story. */}
            <div className="flex items-center gap-2" aria-hidden>
              {STORY.map((s, i) => (
                <span key={s.tone} className="h-[4px] flex-1 overflow-hidden rounded-full bg-ink/10">
                  <motion.span
                    className={`block h-full rounded-full ${TONE[s.tone].dot}`}
                    initial={false}
                    animate={{ width: i <= active ? "100%" : "0%" }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
                  />
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1120px]">
        <StoryClosing />
      </div>
    </section>
  );
}
