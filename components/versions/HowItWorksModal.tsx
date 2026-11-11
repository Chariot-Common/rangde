"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HowItWorksTabs } from "./approaches";

const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * Version 3: "How it works", next to "Explore all opportunities". It opens Version 2's "You decide who you back" as a
 * pop-up: only the animation frame and the four steps under it (Choose, Understand, Lend, Get repaid), with a close
 * button at the top right. Closes on the button, a click outside or Escape. Rendered into <body> so no section's
 * overflow or stacking can clip it.
 */
export function HowItWorksModalButton() {
  const [open, setOpen] = useState(false);
  // The portal mounts on the first click (never during hydration), then stays so the pop-up can animate out.
  const [used, setUsed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-white px-8 font-display text-p3 font-bold text-primary transition-colors hover:bg-white/80"
      >
        How it works
      </button>

      {used &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label="How it works"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
              >
                <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-text-grey-100/48 backdrop-blur-sm" />
                <motion.div
                  className="relative max-h-[calc(100svh-32px)] w-full max-w-[1040px] overflow-y-auto rounded-[16px] bg-white px-4 pb-6 pt-16 shadow-[0_24px_64px_rgba(41,45,54,0.24)] sm:px-8 sm:pb-8"
                  initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                >
                  <button
                    type="button"
                    aria-label="Close how it works"
                    autoFocus
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 z-10 flex size-[40px] items-center justify-center rounded-full bg-text-grey-64 text-white transition-colors hover:bg-text-grey-80"
                  >
                    <svg viewBox="0 0 24 24" className="size-[18px] rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  {/* Exactly as Version 2 sets it ("You decide who you back"), minus the heading. */}
                  <HowItWorksTabs refined bare visual="journey" modal />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
