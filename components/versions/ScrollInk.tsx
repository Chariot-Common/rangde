"use client";

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Fragment, useRef } from "react";

/*
 * Scroll-linked letter fill (v3: the founders' paragraph and section headings). The text starts
 * pale and fills in letter by letter, left to right, at the reader's pace: from when its top is
 * three quarters of the way down the screen until it is a quarter of the way down, smoothed so a
 * flick of the wheel doesn't jump it along. The edge of the fill is a soft red-green-blue band
 * about two letters wide that bleeds into the ink on its left and the pale text on its right.
 */

// The edge, in letters, measured back from the front of the fill: the colour band is BAND letters
// wide, with BLEED of a letter blending into the ink behind it and the pale text ahead of it.
const BAND = 2;
const BLEED = 0.5;
type RGB = [number, number, number];
const INK: RGB = [41, 45, 54];
const PALE: RGB = [187, 188, 191]; // ink at 32% on white
const RED: RGB = [234, 111, 128];
const GREEN: RGB = [157, 203, 134];
const BLUE: RGB = [132, 196, 223];

const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * t)) as RGB;
const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

/** The colour at `d` letters behind the front of the fill (negative = ahead of it, still pale). */
function colourAt(d: number): RGB {
  if (d <= 0) return d > -BLEED ? mix(BLUE, PALE, -d / BLEED) : PALE;
  if (d < BAND) {
    const t = d / BAND; // 0 at the front (blue) → 1 at the back of the band (red)
    return t < 0.5 ? mix(BLUE, GREEN, t * 2) : mix(GREEN, RED, (t - 0.5) * 2);
  }
  if (d < BAND + BLEED) return mix(RED, INK, (d - BAND) / BLEED);
  return INK;
}

const CHAR_CLASS = { ink: "text-ink", pale: "text-ink/32" } as const;
const EDGE_CLASS = "bg-clip-text";

/** `offset`: when the fill starts and ends, as motion's useScroll offset for the text (default: its
 * top three quarters down the screen, then a quarter down). */
export function ScrollInk({
  text,
  as = "p",
  className = "",
  offset = ["start 0.75", "start 0.25"],
}: {
  text: string;
  as?: "p" | "h2" | "span";
  className?: string;
  offset?: [`start ${number}`, `start ${number}`];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement & HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22, restDelta: 0.0005 });
  const chars = useRef<HTMLSpanElement[]>([]);
  const painted = useRef(new Set<number>());

  useMotionValueEvent(smooth, "change", (v) => {
    const list = chars.current;
    const n = list.length;
    // The front of the fill, in letters; it runs past the end so the last letters finish as ink.
    const front = Math.min(1, Math.max(0, v)) * (n + BAND + BLEED);
    const from = Math.max(0, Math.floor(front - BAND - BLEED));
    const to = Math.min(n - 1, Math.floor(front + BLEED));
    const next = new Set<number>();
    for (let i = from; i <= to; i++) {
      // Each letter in the edge gets its own slice of the colour, left edge to right edge.
      const stops = [0, 0.25, 0.5, 0.75, 1].map((s) => `${css(colourAt(front - (i + s)))} ${s * 100}%`);
      const el = list[i];
      el.style.backgroundImage = `linear-gradient(to right, ${stops.join(", ")})`;
      el.style.color = "transparent";
      el.className = EDGE_CLASS;
      next.add(i);
    }
    // Letters that have left the edge settle to plain ink or pale, as does anything a fast scroll
    // skipped past in one go.
    list.forEach((el, i) => {
      if (next.has(i)) return;
      if (painted.current.has(i)) {
        el.style.backgroundImage = "";
        el.style.color = "";
      }
      const want = i < front ? CHAR_CLASS.ink : CHAR_CLASS.pale;
      if (el.className !== want) el.className = want;
    });
    painted.current = next;
  });

  let index = 0;
  const register = (el: HTMLSpanElement | null) => {
    if (el) chars.current[Number(el.dataset.i)] = el;
  };

  const letters = (
    <span aria-hidden>
      {text.split(" ").map((word, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          {/* Words stay whole when the line wraps. */}
          <span className="whitespace-nowrap">
            {word.split("").map((ch) => {
              const i = index++;
              return (
                <span key={i} ref={register} data-i={i} className={reduce ? CHAR_CLASS.ink : CHAR_CLASS.pale}>
                  {ch}
                </span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </span>
  );
  if (as === "h2") return <h2 ref={ref} className={className} aria-label={text}>{letters}</h2>;
  if (as === "span") return <span ref={ref} className={className} aria-label={text}>{letters}</span>;
  return <p ref={ref} className={className} aria-label={text}>{letters}</p>;
}
