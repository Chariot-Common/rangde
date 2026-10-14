"use client";

import { createElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type WordRevealTag = "h1" | "h2" | "h3" | "p" | "div" | "span";

interface WordRevealProps {
  /** Use "\n" to force a line break; otherwise the words wrap naturally. */
  text: string;
  as?: WordRevealTag;
  className?: string;
  /** Opacity each word starts at: 0.48 for the Swabhimaan-style headline (the words are
   * there, pale, and fill in), 0 for the about-page-style body (words appear). */
  from?: number;
  /** Seconds between one word starting and the next. */
  stagger?: number;
  /** Seconds each word takes to reach full opacity. */
  duration?: number;
  /** Seconds to wait after `play` turns true. */
  delay?: number;
  play: boolean;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** How long a WordReveal of `text` runs, from its first word starting to its last finishing. */
export function wordRevealLength(text: string, stagger: number, duration: number) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(0, words - 1) * stagger + duration;
}

/**
 * Word-by-word opacity reveal, with no movement — the text effect on rangde.org's
 * programme pages (headline) and about page (body copy). Words stay inline, so the copy
 * wraps exactly as plain text would.
 */
export function WordReveal({ text, as = "p", className = "", from = 0, stagger = 0.06, duration = 0.45, delay = 0, play }: WordRevealProps) {
  const reduce = useReducedMotion();
  let index = 0;

  const lines = text.split("\n").map((line, li) => {
    const words = line.split(" ").filter(Boolean);
    const nodes: ReactNode[] = [];
    words.forEach((word, wi) => {
      const i = index++;
      if (wi > 0) nodes.push(" ");
      nodes.push(
        reduce ? (
          word
        ) : (
          <motion.span
            key={wi}
            initial={{ opacity: from }}
            animate={play ? { opacity: 1 } : { opacity: from }}
            transition={{ duration, delay: delay + i * stagger, ease: EASE_OUT }}
          >
            {word}
          </motion.span>
        ),
      );
    });
    return text.includes("\n") ? (
      // Forced line breaks only from sm up; on phones the lines wrap naturally (and the
      // heading balances them), so a long line doesn't leave an odd three-line shape.
      <span key={li} className="sm:block">
        {li > 0 && " "}
        {nodes}
      </span>
    ) : (
      nodes
    );
  });

  return createElement(as, { className, "aria-label": text.replace(/\n/g, " ") }, <span aria-hidden="true">{lines}</span>);
}
