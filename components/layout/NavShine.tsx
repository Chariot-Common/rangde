"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A one-off light sweep across a button, left to right: a blurred diagonal square with a thin
 * reflection running beside it at the same pace, clipped to the button so it never spills onto the
 * button beside it. Place it inside a `relative` button.
 */
export function NavShine({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  if (!play || reduce) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <motion.span
        className="absolute top-1/2 flex -translate-y-1/2 items-center gap-[10px]"
        initial={{ left: "-45%", opacity: 0 }}
        animate={{ left: "115%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.45, 0, 0.2, 1], opacity: { duration: 1.1, delay: 0.2, times: [0, 0.15, 0.8, 1] } }}
      >
        <span className="block size-[34px] rotate-[25deg] bg-white/75 blur-[8px]" />
        <span className="block h-[52px] w-[6px] rotate-[25deg] bg-white/60 blur-[3px]" />
      </motion.span>
    </span>
  );
}
