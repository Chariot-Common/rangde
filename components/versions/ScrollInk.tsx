"use client";

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring, type MotionValue } from "motion/react";
import { Fragment, useRef, useSyncExternalStore } from "react";

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

const EDGE_CLASS = "bg-clip-text";

/**
 * `rgb` (default): pale ink filling to ink behind the red-green-blue edge.
 * `plain` (Version 1.1): the same fill with no coloured edge: each letter simply darkens from pale ink to ink,
 *   softly over about a letter and a half.
 * `blue` (Version 1.1's "Every Saturday, 11 am IST"): the plain fill, from primary blue 64 to primary blue 100.
 */
type Tone = "rgb" | "plain" | "blue";
const TONES: Record<Tone, { ink: string; pale: string; inkColour: string; paleColour: string }> = {
  rgb: { ink: "text-ink", pale: "text-ink/32", inkColour: "var(--color-ink)", paleColour: "color-mix(in srgb, var(--color-ink) 32%, transparent)" },
  plain: { ink: "text-ink", pale: "text-ink/32", inkColour: "var(--color-ink)", paleColour: "color-mix(in srgb, var(--color-ink) 32%, transparent)" },
  blue: { ink: "text-primary-100", pale: "text-primary-64", inkColour: "var(--color-primary-100)", paleColour: "var(--color-primary-64)" },
};
const SOFT = 1.5; // plain/blue: how many letters the darkening takes

// Phones (<768px) have their own timing for the plain and blue fills: it starts as the text's top comes in at the
// bottom of the screen and is complete a little above the screen's vertical centre.
const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/** `offset`: when the fill starts and ends, as motion's useScroll offset for the text (default: its
 * top three quarters down the screen, then a quarter down; for the plain and blue tones, Version 1.1's, from
 * its top just entering at the bottom of the screen until it is a little above the three-quarter line). */
export function ScrollInk({
  text,
  as = "p",
  className = "",
  offset,
  drive,
  tone = "rgb",
}: {
  text: string;
  as?: "p" | "h2" | "h3" | "span";
  className?: string;
  offset?: [`start ${number}`, `start ${number}`];
  /** A 0–1 motion value to fill from instead of the scroll (the Version 6 hero runs it on a timer). */
  drive?: MotionValue<number>;
  tone?: Tone;
}) {
  const CHAR_CLASS = TONES[tone];
  const plain = tone !== "rgb";
  const reduce = useReducedMotion();
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement & HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: offset ?? (tone === "rgb" ? ["start 0.75", "start 0.25"] : phone ? ["start 1", "start 0.45"] : ["start 1", "start 0.7"]) });
  const spring = useSpring(scrollYProgress, { stiffness: 70, damping: 22, restDelta: 0.0005 });
  const smooth = drive ?? spring;
  const chars = useRef<HTMLSpanElement[]>([]);
  const painted = useRef(new Set<number>());

  useMotionValueEvent(smooth, "change", (v) => {
    const list = chars.current;
    const n = list.length;
    if (plain) {
      // No coloured edge: the letters just behind the front are part-way from pale to ink.
      const front = Math.min(1, Math.max(0, v)) * (n + SOFT);
      list.forEach((el, i) => {
        const t = Math.min(1, Math.max(0, (front - i) / SOFT));
        if (t > 0 && t < 1) {
          el.style.color = `color-mix(in srgb, ${CHAR_CLASS.inkColour} ${Math.round(t * 100)}%, ${CHAR_CLASS.paleColour})`;
          if (el.className !== "") el.className = "";
        } else {
          if (el.style.color) el.style.color = "";
          const want = t >= 1 ? CHAR_CLASS.ink : CHAR_CLASS.pale;
          if (el.className !== want) el.className = want;
        }
      });
      return;
    }
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
  if (as === "h3") return <h3 ref={ref} className={className} aria-label={text}>{letters}</h3>;
  if (as === "span") return <span ref={ref} className={className} aria-label={text}>{letters}</span>;
  return <p ref={ref} className={className} aria-label={text}>{letters}</p>;
}
