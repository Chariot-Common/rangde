"use client";

import { createElement, useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

type AnimatedTextTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

interface AnimatedTextSegment {
  text: string;
  /** Applied to each word in this segment — e.g. a different color. */
  className?: string;
}

interface AnimatedTextProps {
  /**
   * Full text. Use "\n" to force a line break — line breaks are taken literally rather
   * than relying on natural wrapping, so the caller's exact line structure is preserved.
   * Mutually exclusive with `segments`.
   */
  text?: string;
  /**
   * Differently-styled runs of text (e.g. two colors) that read as one continuous,
   * naturally-wrapping passage — used instead of `text` when the copy needs per-run
   * styling. Reflows at any width rather than preserving fixed line breaks.
   */
  segments?: AnimatedTextSegment[];
  as?: AnimatedTextTag;
  className?: string;
  /** Per-word tween duration, in seconds. Spec range: 0.5–0.7. */
  wordDuration?: number;
  /** Delay added per subsequent word, in seconds. Spec range: 0.05–0.09. */
  stagger?: number;
  /** Fraction of the element that must be visible before the reveal starts. */
  amount?: number;
  /** Animate once (the natural behavior for a page-entrance reveal). */
  once?: boolean;
}

// Smooth, controlled ease-out — no overshoot, no bounce.
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Kinetic word-reveal text: each word is masked (overflow-hidden) and rises from
 * translateY(110%)/opacity 0 into place, staggered word-by-word. Purely typographic —
 * no fades on the containing section, no scale/rotation. Reusable across any heading.
 */
export function AnimatedText({
  text,
  segments,
  as = "div",
  className = "",
  wordDuration = 0.6,
  stagger = 0.07,
  amount = 0.25,
  once = true,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduceMotion = useReducedMotion();

  let wordIndex = 0;
  const renderWord = (word: string, key: string, wordClassName?: string) => {
    const index = wordIndex++;
    if (reduceMotion) {
      return (
        <span key={key} className={wordClassName}>
          {word}
        </span>
      );
    }
    return (
      // The mask is stretched 0.2em below the line (and pulled back with a negative margin, so
      // layout is unchanged); with tight line-heights it otherwise clipped descenders like "g".
      <span key={key} className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] align-top">
        <motion.span
          className={`inline-block ${wordClassName ?? ""}`}
          initial={{ y: "110%", opacity: 0 }}
          animate={inView ? { y: "0%", opacity: 1 } : undefined}
          transition={{ duration: wordDuration, delay: index * stagger, ease: EASE_OUT }}
        >
          {word}
        </motion.span>
      </span>
    );
  };

  let content: ReactNode;
  let plainText: string;

  if (segments) {
    // One continuous, naturally-wrapping flow across all segments — no forced lines,
    // so it reflows correctly at any viewport width.
    const nodes: ReactNode[] = [];
    segments.forEach((segment, si) => {
      const words = segment.text.split(" ").filter(Boolean);
      words.forEach((word, wi) => {
        if (nodes.length > 0) nodes.push(" ");
        nodes.push(renderWord(word, `${si}-${wi}`, segment.className));
      });
    });
    content = nodes;
    plainText = segments.map((s) => s.text).join(" ");
  } else {
    const lines = (text ?? "").split("\n");
    content = lines.map((line, lineIdx) => {
      const words = line.split(" ").filter(Boolean);
      const wordNodes: ReactNode[] = [];
      words.forEach((word, wIdx) => {
        if (wIdx > 0) wordNodes.push(" ");
        wordNodes.push(renderWord(word, `${lineIdx}-${wIdx}`));
      });
      return (
        <span key={lineIdx} className="block">
          {wordNodes}
        </span>
      );
    });
    plainText = (text ?? "").replace(/\n/g, " ");
  }

  // `ref` here is only ever forwarded to createElement as a prop, never read — a false
  // positive from the polymorphic-element pattern. (The JSX `<Tag ref={...}>` form
  // triggers a real runtime bug in this project's SWC/React-DOM combination with a
  // dynamic tag + ref, so createElement is used deliberately instead.)
  return createElement(
    as,
    // eslint-disable-next-line react-hooks/refs
    { ref, className, "aria-label": plainText },
    <span aria-hidden="true">{content}</span>,
  );
}
