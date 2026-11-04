"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

export interface FillSegment {
  text: string;
  /** Already solid from the start (the lead phrase); the rest fill in as the reader scrolls. */
  solid?: boolean;
  /** Force a line break before this segment (from sm up). */
  breakBefore?: boolean;
}

const PALE = "rgba(41, 45, 54, 0.32)";
const INK = "rgba(41, 45, 54, 1)";

function Word({ children, progress, at, span }: { children: ReactNode; progress: MotionValue<number>; at: number; span: number }) {
  const color = useTransform(progress, [at, at + span], [PALE, INK]);
  return <motion.span style={{ color }}>{children}</motion.span>;
}

/**
 * Scroll-linked word fill: the pale words turn ink one by one as the text scrolls up the screen,
 * so by the time it has passed the middle the whole line is solid. The same word-by-word idea as
 * WordReveal on the other versions, but tied to scroll instead of a timer.
 * `offset` is motion's useScroll offset for the element (default: from entering the lower part of
 * the screen to reaching its upper third).
 */
export function ScrollFill({
  segments,
  as = "p",
  className = "",
  offset = ["start 0.85", "end 0.4"],
}: {
  segments: FillSegment[];
  as?: Tag;
  className?: string;
  offset?: [string, string];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // motion's offset type is a template-literal union; plain strings are fine at runtime.
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as never });

  const filling = segments.flatMap((s) => (s.solid ? [] : s.text.split(/\s+/).filter(Boolean))).length;
  const span = 1 / Math.max(1, filling);
  let n = 0;

  const body = segments.map((seg, si) => {
    const words = seg.text.split(/(\s+)/);
    return (
      <span key={si}>
        {seg.breakBefore && <span className="hidden sm:block" />}
        {words.map((w, wi) => {
          if (!w.trim() || seg.solid || reduce) return <span key={wi} style={seg.solid || reduce ? { color: INK } : undefined}>{w}</span>;
          const at = n++ * span * 0.9;
          return (
            <Word key={wi} progress={scrollYProgress} at={at} span={span * 1.6}>
              {w}
            </Word>
          );
        })}
      </span>
    );
  });

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} aria-label={segments.map((s) => s.text).join("")}>
      <span aria-hidden="true">{body}</span>
    </Tag>
  );
}
