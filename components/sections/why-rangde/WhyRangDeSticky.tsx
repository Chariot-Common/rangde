"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DURGA, STORY, TONE } from "./durgaStory";
import { StoryClosing } from "./StoryClosing";

/**
 * "Why Rang De?" — sticky-photo story. Durga's photo stays pinned while the three stages
 * scroll past; the stage in the middle of the screen is "active", and the photo's label and
 * tags change to match it. Motion is driven by the reader's own scrolling — nothing plays
 * on its own or loops. On phones the photo becomes a slim strip pinned under the navbar.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function WhyRangDeSticky() {
  const [active, setActive] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = useReducedMotion();
  const stage = STORY[active];

  // A stage becomes active when it crosses a thin band through the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stageRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const swap = reduce ? { duration: 0 } : { duration: 0.35, ease: EASE };

  const tags = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={swap}
        className="flex flex-wrap gap-1.5"
      >
        {stage.tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-display text-[11px] font-bold text-ink">
            {stage.tone !== "problem" && (
              <svg viewBox="0 0 12 12" className="size-[10px] text-green-dark" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2.5 6.2l2.3 2.3L9.5 3.8" />
              </svg>
            )}
            {t}
          </span>
        ))}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-8 lg:gap-12">
        <h2 className="text-center font-display text-h3 font-bold text-ink">Why Rang De?</h2>

        {/* Phones/tablets: slim strip pinned under the navbar. */}
        <div className="sticky top-[calc(var(--navbar-bottom,74px)+8px)] z-10 flex w-full items-center gap-3 rounded-[16px] bg-ink p-2.5 pr-3 shadow-[0_8px_24px_rgba(41,45,54,0.18)] lg:hidden">
          <div className="relative size-[52px] shrink-0 overflow-hidden rounded-[12px]">
            <Image src={DURGA.thumb} alt={DURGA.name} fill unoptimized sizes="52px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="truncate font-display text-p4 font-bold text-white">
              {DURGA.name} <span className="font-medium text-white/56">· {DURGA.place}</span>
            </p>
            {tags}
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
          {/* Desktop: the photo stays pinned while the stages scroll. */}
          <div className="hidden lg:block">
            <figure className="sticky top-[calc(var(--navbar-bottom,74px)+32px)] aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-ink/8 shadow-[0_8px_24px_rgba(41,45,54,0.12)]">
              <Image src={DURGA.photo} alt={DURGA.name} fill unoptimized sizes="440px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/76 to-transparent" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={swap}
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] bg-white/90 text-ink backdrop-blur-sm`}
                >
                  {active + 1} / {STORY.length} · {stage.label}
                </motion.span>
              </AnimatePresence>
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
                <span className="font-display text-p1 font-bold text-white">{DURGA.name}</span>
                <span className="font-display text-p4 font-medium text-white/80">
                  {DURGA.role} · {DURGA.place}
                </span>
                <div className="mt-1">{tags}</div>
              </figcaption>
            </figure>
          </div>

          {/* The three stages — each tall enough to hold the screen for a moment. */}
          <div className="flex flex-col">
            {STORY.map((s, i) => (
              <div
                key={s.tone}
                ref={(el) => {
                  stageRefs.current[i] = el;
                }}
                data-index={i}
                className={`flex min-h-[46vh] flex-col justify-center gap-3 py-6 transition-opacity duration-500 lg:min-h-[62vh] ${
                  i === active ? "opacity-100" : "opacity-32"
                }`}
              >
                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] ${TONE[s.tone].chip}`}>
                  <span className={`size-[6px] rounded-full ${TONE[s.tone].dot}`} />
                  {s.label}
                </span>
                <p className="font-display text-h4 font-bold text-ink">{s.title}</p>
                <p className="font-display text-p2 font-medium text-ink/72">{s.text}</p>
                {s.aside && <p className="font-display text-p3 font-medium text-ink/56">{s.aside}</p>}
              </div>
            ))}
          </div>
        </div>

        <StoryClosing />
      </div>
    </section>
  );
}
