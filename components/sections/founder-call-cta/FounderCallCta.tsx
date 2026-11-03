"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { Button } from "@/components/ui/Button";
import { VideoCallMock } from "./VideoCallMock";

const ROTATE_START = -5;
const ROTATE_END = 0;
const SCALE_START = 0.92;
const SCALE_END = 1.02;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Fractions of the viewport height, checked against the IMAGE's own vertical center
// (not the section's) — 0.62 is below true center (0.5), so as the user scrolls down
// and the image rises toward center, the transition starts slightly before it actually
// gets there; 0.35 is above center, so it finishes shortly after passing it, once the
// card has properly settled into view.
const TRIGGER_START_VH = 0.95;
const TRIGGER_END_VH = 0.4;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

// Ease-out cubic: the rotation decelerates into 0deg rather than arriving at a constant
// rate, which reads as an intentional ease rather than a raw scroll-to-rotation mapping.
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function FounderCallCta() {
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // The illustration starts tilted (-2deg, matching the Figma "small" state) and
  // straightens to upright (0deg) while scaling up 2% (1 -> 1.02) as it scrolls through
  // the trigger band — and reverses the same way scrolling back up, so it replays every
  // time the section re-enters that band rather than locking in place after the first
  // pass. The raw eased value is run through a spring (useSpring) so the visible
  // rotation/scale glide smoothly between scroll-event updates instead of snapping
  // frame-to-frame with raw scroll position — this is what gives it the smooth,
  // non-mechanical feel. Driven by a plain scroll listener computing live geometry (the
  // same pattern TopNav uses for its own scroll-position tracking) rather than Motion's
  // target-based useScroll, which wasn't picking up scroll changes reliably here.
  const rawRotate = useMotionValue(ROTATE_START);
  // Softer spring than before (it felt stiff): lower stiffness, a little more mass, so the
  // window glides and eases out into place.
  const rotate = useSpring(rawRotate, {
    stiffness: 70,
    damping: 18,
    mass: 0.9,
  });
  // Scales up alongside the straightening, in lockstep (same progress/spring), so the
  // illustration reads as settling into place rather than two independent effects.
  const rawScale = useMotionValue(SCALE_START);
  const scale = useSpring(rawScale, { stiffness: 70, damping: 18, mass: 0.9 });
  const textRef = useRef<HTMLDivElement>(null);
  const textInView =
    useInView(textRef, { once: true, amount: 0.6 }) || !!reduceMotion;

  useEffect(() => {
    const el = imageWrapperRef.current;
    if (!el) return;

    const updateRotate = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const centerY = rect.top + rect.height / 2;
      const startY = TRIGGER_START_VH * vh;
      const endY = TRIGGER_END_VH * vh;
      const rawProgress = clamp01((startY - centerY) / (startY - endY));
      const eased = easeOutCubic(rawProgress);
      rawRotate.set(ROTATE_START + eased * (ROTATE_END - ROTATE_START));
      rawScale.set(SCALE_START + eased * (SCALE_END - SCALE_START));
    };

    updateRotate();
    window.addEventListener("scroll", updateRotate, { passive: true });
    window.addEventListener("resize", updateRotate);
    return () => {
      window.removeEventListener("scroll", updateRotate);
      window.removeEventListener("resize", updateRotate);
    };
  }, [rawRotate, rawScale]);

  return (
    <section className="mx-2 rounded-[16px] bg-primary/12">
      <div className="mx-auto flex min-h-[calc(100svh-var(--navbar-bottom)-16px)] w-full max-w-[1170px] flex-col items-center justify-center gap-8 px-6 py-12 sm:gap-[40px] sm:px-10 lg:gap-[48px] lg:px-sp12">
        {/* Outer box is the plain, unanimated layout element (stable for the scroll-geometry
          ref); the motion.div inside carries the scroll-driven rotate/scale, and the
          innermost div applies a fixed per-breakpoint scale to fit VideoCallMock's native
          ~526px Figma size down to this box — the two scales compose multiplicatively. */}
        <div
          ref={imageWrapperRef}
          className="relative h-[160px] w-[280px] sm:h-[210px] sm:w-[368px] lg:h-[275px] lg:w-[481px]"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              rotate: reduceMotion ? 0 : rotate,
              scale: reduceMotion ? 1 : scale,
            }}
          >
            <div className="origin-center scale-[0.5323] sm:scale-[0.6996] lg:scale-[0.9144]">
              <VideoCallMock />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-6 sm:gap-[40px]">
          <div
            ref={textRef}
            className="flex max-w-[850px] flex-col items-center gap-1 text-center"
          >
            <motion.h2
              className="font-display text-p1 font-bold text-blue-highlight sm:text-h4 lg:text-h3"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={textInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              Q&amp;A sessions with our founders
            </motion.h2>
            {/* The day comes in first with a soft blue marker sweeping behind it, then the time. */}
            <p
              className="font-display text-[24px] font-bold leading-[28px] text-ink sm:text-h2 sm:leading-[56px]"
              aria-label="Every Saturday · 11 AM IST"
            >
              <motion.span
                aria-hidden
                className="relative mx-[0.22em] inline-block whitespace-nowrap"
                initial={reduceMotion ? false : { opacity: 0, y: "0.5em" }}
                animate={textInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.55, delay: 0.15, ease: EASE_OUT }}
              >
                <motion.span
                  className="absolute inset-x-[-0.22em] bottom-[0.02em] top-[0.06em] origin-left rounded-[6px] bg-primary/24"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={textInView ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.7, delay: 0.6, ease: EASE_OUT }}
                />
                <span className="relative">Every Saturday</span>
              </motion.span>
              {["·", "11", "AM", "IST"].map((w, i) => (
                <motion.span
                  key={w}
                  aria-hidden
                  className="inline-block"
                  initial={reduceMotion ? false : { opacity: 0, y: "0.5em" }}
                  animate={textInView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.55,
                    delay: 0.3 + i * 0.09,
                    ease: EASE_OUT,
                  }}
                >
                  &nbsp;{w}
                </motion.span>
              ))}
            </p>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={textInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.75, ease: EASE_OUT }}
          >
            <Button
              variant="primary"
              size="lg"
              style={{ backgroundColor: "var(--color-blue-highlight)" }}
            >
              Register
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
