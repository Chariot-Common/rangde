"use client";

import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PointText, type Point } from "./approaches";
import { Eyebrow } from "./ui";
import type { SceneDef } from "./story-scenes";

/*
 * ROUGH CUT of Version 1.1's problem and solution, as two stacked sections (use inside StackedSections, so
 * the green solution slides up over the grey problem). Each is the same shape: the heading centred at the
 * top (the solution with its eyebrow), then the three steps on the left, joined by a progress bar, and the
 * scene for the active step, large, on the right. Scene art is in story-scenes.tsx.
 *
 * It plays by itself: once the section's middle reaches the middle of the screen the first step starts, and each
 * step runs for STEP_SECONDS (the scene plays in the first ANIMATION_SECONDS, then holds while the copy is read) before the next slides in; after the last it goes back to the first, as if it had been
 * clicked, and loops. It pauses while the section is off screen. Clicking a step jumps to it and carries on from there.
 */

const STEP_SECONDS = 6; // how long each step (and its progress bar) lasts
const ANIMATION_SECONDS = 2.5; // the scene plays in the first part of that, then holds its last frame while the copy is read

export function StoryCard({ tone, eyebrow, heading, points, scenes }: { tone: "problem" | "solution"; eyebrow?: string; heading: ReactNode; points: Point[]; scenes: SceneDef[] }) {
  const n = Math.min(points.length, scenes.length);
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0); // 0–1 across all the steps
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  // In view once the section crosses the middle line of the screen.
  const inView = useInView(sectionRef, { margin: "-50% 0px -50% 0px" });
  const playing = useRef<AnimationPlaybackControls | null>(null);

  useMotionValueEvent(progress, "change", (p) => setActive(Math.min(n - 1, Math.floor(p * n))));

  // Run on from wherever it is to the end, then back to the start, for ever.
  const play = useCallback(() => {
    playing.current?.stop();
    const run = () => {
      const from = progress.get();
      playing.current = animate(progress, 1, {
        duration: Math.max(0.01, (1 - from) * n * STEP_SECONDS),
        ease: "linear",
        onComplete: () => {
          progress.set(0);
          run();
        },
      });
    };
    run();
  }, [n, progress]);

  useEffect(() => {
    if (!inView || reduce) {
      playing.current?.stop();
      return;
    }
    play();
    return () => playing.current?.stop();
  }, [inView, reduce, play]);

  // Clicking a step jumps to it (with reduced motion, to its finished state) and carries on from there.
  const goTo = (i: number) => {
    if (reduce) {
      progress.set((i + 0.9) / n);
      return;
    }
    progress.set(i / n);
    if (inView) play();
  };

  return (
    <>
      {/* Design-system tokens throughout: h3 heading, p1 titles, p2 body, step spacing, grey/primary/text-grey colours.
          Proportions after the reference frame: heading 64px from the top, centred; under it a block 2/3 of the
          width, steps on the left (about 45% of it) and the scene on the right (about 55%). */}
      <section
        ref={sectionRef}
        className={`mx-2 flex h-[calc(100svh-var(--navbar-bottom,0px)-16px)] flex-col items-center gap-ds-6 rounded-[16px] px-r3 pb-r4 pt-ds-9 ${
          tone === "solution" ? "bg-[#cbe0b8]" : "bg-bg-grey"
        }`}
      >
        <div className="flex max-w-full flex-col items-center gap-2 text-center md:max-w-[90%] lg:max-w-[min(70%,1000px)]">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance]">{heading}</h2>
        </div>

        {/* Scene above the steps on phones. */}
        <div className="flex min-h-0 w-full justify-center">
          <div className="flex w-full flex-col-reverse items-center gap-r3 md:grid md:w-[67%] md:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] md:items-center md:gap-[5%]">
            <ol className="flex w-full flex-col">
              {points.slice(0, n).map((p, i) => (
                <StepRow key={p.title} point={p} index={i} n={n} active={i === active} reached={i <= active} progress={progress} onSelect={() => goTo(i)} />
              ))}
            </ol>
            {/* A 1.2px outside stroke round the frame: text grey 8 on the problem; text grey 8 with green 16 laid over it on the solution. */}
            <div className={`relative aspect-[400/280] w-full max-w-[min(100%,calc((100svh-var(--navbar-bottom,0px)-380px)*1.4286))] justify-self-end overflow-hidden rounded-4 bg-white-100 md:max-w-[min(100%,calc((100svh-var(--navbar-bottom,0px)-260px)*1.4286))] ${tone === "problem" ? "shadow-[0_0_0_1.2px_var(--color-text-grey-8)]" : "shadow-[0_0_0_1.2px_var(--color-green-16),0_0_0_1.2px_var(--color-text-grey-8)]"}`}>
              {scenes.slice(0, n).map((s, i) => (
                <Layer key={s.name} scene={s} index={i} n={n} rel={i - active} progress={progress} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** One step: a circle (blue once reached, grey before), a line below it to the next step that fills through the step's
 * stretch of the scroll (the rows touch, so the line runs on unbroken), the title, and the body, which folds open
 * only while the step is active. */
function StepRow({ point, index, n, active, reached, progress, onSelect }: { point: Point; index: number; n: number; active: boolean; reached: boolean; progress: MotionValue<number>; onSelect: () => void }) {
  const fill = useTransform(progress, [index / n, (index + 1) / n], [0, 1], { clamp: true });
  const last = index === n - 1;
  // The body clips while it opens and closes; once open it must not, or the source tooltips are cut off.
  const [settled, setSettled] = useState(active);
  useEffect(() => {
    if (!active) {
      setSettled(false);
      return;
    }
    const id = setTimeout(() => setSettled(true), 520);
    return () => clearTimeout(id);
  }, [active]);
  return (
    <li className="relative flex gap-r3">
      {/* The line runs from this dot's centre to the next dot's centre, so nothing is left between them. */}
      <div aria-hidden className="relative w-3 shrink-0">
        {!last && (
          <span className="absolute left-1/2 top-[22px] -bottom-[10px] w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-text-grey-16">
            <motion.span className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-text-grey-64" style={{ scaleY: fill }} />
          </span>
        )}
        <span className={`absolute left-0 top-[10px] size-3 rounded-full transition-colors duration-300 ${reached ? "bg-text-grey-100" : "bg-text-grey-16"}`} />
      </div>
      <div className={`flex min-w-0 flex-col ${last ? "" : "pb-r4"}`}>
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "step" : undefined}
          className={`text-left font-display text-p1 font-bold transition-colors duration-300 ${active ? "text-text-grey-100" : "text-text-grey-40 hover:text-text-grey-64"}`}
        >
          {point.title}
        </button>
        {/* Opens and closes by its own height (grid rows 0fr ↔ 1fr). */}
        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <p className={`font-display text-p2 font-medium text-text-grey-64 ${active && settled ? "overflow-visible" : "overflow-hidden"}`}>
            <span className="block pt-2">
              <PointText parts={point.text} plain />
            </span>
          </p>
        </div>
      </div>
    </li>
  );
}

/** One scene, given its own 0–1 stretch of the scroll. It sits in the frame when it is the active step, waits below it before
 * that, and has gone off the top after: moving on slides the old scene up and out while the next rises in from the bottom. */
function Layer({ scene, index, n, rel, progress }: { scene: SceneDef; index: number; n: number; rel: number; progress: MotionValue<number> }) {
  const t = useTransform(progress, [index / n, (index + ANIMATION_SECONDS / STEP_SECONDS) / n], [0, 1], { clamp: true });
  const { Scene } = scene;
  return (
    <div aria-hidden className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none" style={{ transform: `translateY(${rel * 100}%)` }}>
      <Scene t={t} />
    </div>
  );
}
