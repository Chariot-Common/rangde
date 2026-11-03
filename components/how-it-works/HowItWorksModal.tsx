"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useHowItWorks } from "./HowItWorksContext";
import { HOW_IT_WORKS_STEPS } from "./steps";
import { HowItWorksStage } from "./HowItWorksStage";
import { AnimatedText } from "@/components/ui/AnimatedText";

// The button-to-modal morph: how long the card takes to grow out of the button that opened it.
const MORPH_DURATION = 0.72;
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;

function HowItWorksModalContent({ close, initialStep, origin }: { close: () => void; initialStep: number; origin: DOMRect | null }) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const morph = !!origin && !reduceMotion;

  // Opened from a button: the card starts clipped to that button's exact rect (in the button's
  // blue, via the veil) and the clip opens out to the card's full size, so the button appears to
  // travel to the centre and grow into the modal (into the whole screen on phones). Clipping
  // rather than scaling keeps the text inside from stretching on the way.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const veil = veilRef.current;
    if (!morph || !origin || !card || !veil) return;
    const r = card.getBoundingClientRect();
    const t = Math.max(0, origin.top - r.top);
    const l = Math.max(0, origin.left - r.left);
    const b = Math.max(0, r.bottom - origin.bottom);
    const rt = Math.max(0, r.right - origin.right);
    const endRadius = window.matchMedia("(min-width: 640px)").matches ? 16 : 0;
    const from = `inset(${t}px ${rt}px ${b}px ${l}px round 8px)`;
    const to = `inset(0px 0px 0px 0px round ${endRadius}px)`;
    card.style.clipPath = from;
    // Drop the clip once it has opened fully, so it no longer cuts off the card's drop shadow.
    const grow = animate(card, { clipPath: [from, to] }, {
      duration: MORPH_DURATION,
      ease: MORPH_EASE,
      onComplete: () => {
        card.style.clipPath = "none";
      },
    });
    const fade = animate(veil, { opacity: [1, 0] }, { duration: 0.32, delay: MORPH_DURATION * 0.6, ease: "easeOut" });
    return () => {
      grow.stop();
      fade.stop();
    };
  }, [morph, origin]);
  const isLastStep = stepIndex === HOW_IT_WORKS_STEPS.length - 1;
  const step = HOW_IT_WORKS_STEPS[stepIndex];
  const last = HOW_IT_WORKS_STEPS.length - 1;

  // ← / → step through, as well as the buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(last, i + 1));
      if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [last]);

  // Last step's CTA takes people straight to the live opportunities on the page.
  const goToOpportunities = () => {
    close();
    setTimeout(() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" }), 250);
  };

  return (
    <motion.div
      ref={cardRef}
      // Three layouts: a full-screen sheet on phones (illustration ~58% of the height, per
      // the 816px mobile frame), a centred 480px card on tablets, and from lg up a wide desktop card
      // (up to 1200px): the illustration takes the left half at the stage's own 374:342
      // proportions, so it fills its panel with no dead space above or below, and the card is
      // only as tall as that illustration.
      className="relative flex h-full w-full flex-col overflow-hidden bg-white p-2 sm:h-[min(816px,92vh)] sm:w-[480px] sm:rounded-[16px] sm:shadow-[0px_24px_48px_rgba(3,21,56,0.24)] lg:h-auto lg:w-[min(1200px,calc(100vw-48px))] lg:flex-row lg:gap-2"
      initial={reduceMotion || morph ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* The button's blue, covering the card while it grows and fading once it has nearly landed. */}
      {morph && <div ref={veilRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-primary" />}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute right-4 top-4 z-10 flex size-[32px] items-center justify-center rounded-full bg-white/80 text-ink/64 backdrop-blur-sm transition-colors hover:bg-white"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[16px]">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="h-[58%] w-full shrink-0 overflow-hidden rounded-[8px] [@media(max-height:700px)]:h-[52%] lg:h-auto lg:[@media(max-height:700px)]:h-auto lg:aspect-[374/342] lg:w-[calc(50%-4px)]">
        <HowItWorksStage stepIndex={stepIndex} label={step.illustrationLabel} />
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col justify-between gap-5 overflow-y-auto rounded-[8px] p-5 sm:p-6 lg:min-w-0 lg:flex-1 lg:gap-6 lg:p-10">
        <div className="flex w-full items-start gap-1">
          {HOW_IT_WORKS_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setStepIndex(i)}
              className="relative h-[4px] flex-1 overflow-hidden rounded-[8px] bg-ink/16 after:absolute after:-inset-y-4 after:inset-x-0 after:content-['']"
            >
              <span
                className="absolute inset-0 origin-left rounded-[8px] bg-[#62af1d] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `scaleX(${i <= stepIndex ? 1 : 0})` }}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2" aria-live="polite">
          <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-ink/64">{step.eyebrow}</p>
          <AnimatedText
            key={stepIndex}
            as="h2"
            segments={step.headingParts}
            wordDuration={0.6}
            stagger={0.05}
            className="font-display text-h4 font-bold text-primary"
          />
          <p className="font-display text-p3 font-medium text-ink/64 lg:text-p2">{step.description}</p>
          {step.note && (
            <p className="mt-1 flex items-center gap-2 rounded-[8px] bg-green/8 px-3 py-2 font-display text-p4 font-semibold text-green-dark">
              <svg viewBox="0 0 24 24" className="size-[16px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
                <path d="M9 12l2.2 2.2L15.5 10" />
              </svg>
              {step.note}
            </p>
          )}
        </div>

        <div className="flex w-full gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => setStepIndex((i) => i - 1)}
              className="flex min-h-[48px] w-[56px] shrink-0 items-center justify-center rounded-[8px] bg-primary/16 text-primary transition-colors hover:bg-primary/24"
            >
              <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
          )}
          {isLastStep ? (
            <button
              type="button"
              onClick={goToOpportunities}
              className="min-h-[48px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-display text-p3 font-bold text-white transition-[filter] hover:brightness-95"
            >
              Invest
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="min-h-[48px] flex-1 rounded-[8px] bg-primary px-4 py-3 font-display text-p3 font-bold text-white transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorksModal() {
  const { isOpen, sessionId, initialStep, origin, close } = useHowItWorks();
  const reduceMotion = useReducedMotion();

  // Full-screen takeover: lock page scroll while it's up (same pattern as PageLoader),
  // and let Escape close it.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="How Rang De works"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/48 p-0 sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          {/* Keyed by sessionId (bumped on every open()) so reopening always restarts at
              step 1 via a fresh mount, rather than resetting state in an effect. */}
          <HowItWorksModalContent key={sessionId} close={close} initialStep={initialStep} origin={origin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
