"use client";

import { motion, useReducedMotion } from "motion/react";

interface MenuToggleIconProps {
  open: boolean;
  /** Morph duration in milliseconds. */
  duration?: number;
  className?: string;
  /** Bar color — defaults to the design system's ink color. */
  color?: string;
}

/**
 * NOTE: the prompt referenced an exact "MenuToggleIcon" implementation to reuse
 * verbatim, but no component code actually accompanied the prompt (only a bracketed
 * placeholder). This is a from-scratch implementation matching the described behavior:
 * three states (closed / open / hover), a smooth hamburger→X morph, and a
 * `duration` prop (ms). Swap this file's internals for the real component if/when
 * its source is provided — the external API (`open`, `duration`) is kept generic
 * enough that callers shouldn't need to change.
 */
export function MenuToggleIcon({ open, duration = 500, className = "", color = "var(--color-ink)" }: MenuToggleIconProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: duration / 1000, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <span className={`relative block h-[10px] w-[16px] ${className}`} aria-hidden>
      <motion.span
        className="absolute left-0 top-0 h-[1.5px] w-full origin-center"
        style={{ backgroundColor: color }}
        animate={open ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2"
        style={{ backgroundColor: color }}
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: duration / 1000 / 2 }}
      />
      <motion.span
        className="absolute bottom-0 left-0 h-[1.5px] w-full origin-center"
        style={{ backgroundColor: color }}
        animate={open ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
    </span>
  );
}
