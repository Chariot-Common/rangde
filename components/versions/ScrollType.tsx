"use client";

import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Fragment, useRef } from "react";

/*
 * Scroll-linked typing (Version 1.1's section headings): the text sits in pale grey (ink at 48%) and
 * is typed over in full ink, letter by letter, left to right, as it is scrolled into view: from when
 * its top comes up from the bottom of the screen until it is three quarters of the way down, so it
 * is done soon after the reader arrives. Nothing moves or reflows; only the colour fills in.
 */

const PALE = "rgba(41, 45, 54, 0.48)"; // ink at 48%: the text before it is typed over

export function ScrollType({
  text,
  as = "h2",
  className = "",
  offset = ["start 1", "start 0.75"],
}: {
  text: string;
  as?: "h2" | "p" | "span" | "blockquote";
  className?: string;
  offset?: [`start ${number}`, `start ${number}`];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement & HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 });
  const chars = useRef<HTMLSpanElement[]>([]);
  const shown = useRef(-1);

  useMotionValueEvent(smooth, "change", (v) => {
    const list = chars.current;
    const typed = Math.round(Math.min(1, Math.max(0, v)) * list.length);
    if (typed === shown.current) return;
    shown.current = typed;
    list.forEach((el, i) => {
      const want = i < typed ? "" : PALE;
      if (el.style.color !== want) el.style.color = want;
    });
  });

  const label = text.replace(/\n/g, " ");
  let index = 0;
  const register = (el: HTMLSpanElement | null) => {
    if (el) chars.current[Number(el.dataset.i)] = el;
  };
  const letters = (
    <span aria-hidden>
      {/* "\n" forces a line break; the words of each line wrap as usual. */}
      {text.split("\n").flatMap((line, li) => [
        li > 0 ? <br key={`br${li}`} /> : null,
        ...line.split(" ").map((word, wi) => (
        <Fragment key={`${li}-${wi}`}>
          {wi > 0 && " "}
          {/* Words stay whole when the line wraps. */}
          <span className="whitespace-nowrap">
            {word.split("").map((ch) => {
              const i = index++;
              return (
                <span key={i} ref={register} data-i={i} style={{ color: reduce ? undefined : PALE }}>
                  {ch}
                </span>
              );
            })}
          </span>
        </Fragment>
        )),
      ])}
    </span>
  );

  if (as === "p") return <p ref={ref} className={className} aria-label={label}>{letters}</p>;
  if (as === "span") return <span ref={ref} className={className} aria-label={label}>{letters}</span>;
  if (as === "blockquote") return <blockquote ref={ref} className={className} aria-label={label}>{letters}</blockquote>;
  return <h2 ref={ref} className={className} aria-label={label}>{letters}</h2>;
}
