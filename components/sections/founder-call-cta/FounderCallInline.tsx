"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { LegacyButton as Button } from "@/components/ui/LegacyButton";
import { VideoCallMock } from "./VideoCallMock";

const ROTATE_START = -5;
const ROTATE_END = 0;
const SCALE_START = 0.92;
const SCALE_END = 1.02;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Same trigger band as the old standalone section: measured on the window's own vertical centre,
// so it starts tilted as it rises into view and settles upright a little after passing centre.
const TRIGGER_START_VH = 0.95;
const TRIGGER_END_VH = 0.4;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** The weekly founders' Q&A, folded into the bottom of the opportunities card: "Interested but unsure?" */
export function FounderCallInline() {
  const reduce = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const show = useInView(textRef, { once: true, amount: 0.6 }) || !!reduce;

  // Tilted and slightly small while it scrolls in, straightening to upright (and 2% larger) as it
  // passes the trigger band, and reversing when scrolled back, the way the old section did.
  const rawRotate = useMotionValue(ROTATE_START);
  const rotate = useSpring(rawRotate, { stiffness: 70, damping: 18, mass: 0.9 });
  const rawScale = useMotionValue(SCALE_START);
  const scale = useSpring(rawScale, { stiffness: 70, damping: 18, mass: 0.9 });

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const centerY = rect.top + rect.height / 2;
      const startY = TRIGGER_START_VH * vh;
      const endY = TRIGGER_END_VH * vh;
      const eased = easeOutCubic(clamp01((startY - centerY) / (startY - endY)));
      rawRotate.set(ROTATE_START + eased * (ROTATE_END - ROTATE_START));
      rawScale.set(SCALE_START + eased * (SCALE_END - SCALE_START));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [rawRotate, rawScale]);

  const rise = (delay: number) => ({
    initial: reduce ? (false as const) : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  });

  return (
    <div className="mx-auto flex w-[calc(100%-32px)] max-w-[1194px] flex-col items-center gap-8 border-t border-ink/16 pt-8 sm:pt-10 md:flex-row md:justify-center md:gap-12">
      <div ref={imageRef} className="relative h-[150px] w-[263px] shrink-0 sm:h-[165px] sm:w-[290px]">
        <motion.div
          className="absolute inset-0"
          style={{ rotate: reduce ? 0 : rotate, scale: reduce ? 1 : scale }}
        >
          <div className="absolute left-0 top-0 origin-top-left scale-[0.5] sm:scale-[0.55]">
            <VideoCallMock />
          </div>
        </motion.div>
      </div>
      <div ref={textRef} className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
        <div className="flex flex-col gap-1">
          <motion.h3 className="font-display text-h4 font-bold text-ink" {...rise(0)}>
            Interested but unsure?
          </motion.h3>
          <motion.p className="font-display text-p1 font-medium text-ink/80" {...rise(0.12)}>
            Talk to our founders · Every Saturday, 11 AM IST
          </motion.p>
        </div>
        <motion.div {...rise(0.24)}>
          <Button variant="primary" size="lg" style={{ backgroundColor: "var(--color-blue-highlight)" }}>
            Register
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
