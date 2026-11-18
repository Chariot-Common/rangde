"use client";
import { useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type CSSProperties, type RefObject } from "react";
import { ScrollInk } from "@/components/versions/ScrollInk";

/*
 * The letter-by-letter heading fill from Version 2 (its founders, "You decide who you back" and opportunities headings),
 * reused as is from components/versions/ScrollInk. These helpers only split one fill across several lines or pieces,
 * so a heading broken into parts still fills as one sentence, left to right.
 */

type Tone = "grey" | "white" | "blue";

/** 0 → 1 as the element's top rises from the bottom of the screen to just above the middle, smoothed like ScrollInk's own. */
export function useInkDrive(ref: RefObject<HTMLElement | null>, offset: [`start ${number}`, `start ${number}`] = ["start 1", "start 0.55"]) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, { stiffness: 70, damping: 22, restDelta: 0.0005 });
}

/** One piece of a sentence, filled over its share [from, to] of the drive. */
export function InkPiece({ text, drive, from, to, tone, className }: { text: string; drive: MotionValue<number>; from: number; to: number; tone: Tone; className?: string }) {
  const part = useTransform(drive, [from, to], [0, 1], { clamp: true });
  return <ScrollInk as="span" text={text} drive={part} tone={tone} className={className} />;
}

/** Shares of a 0–1 drive for pieces of text, in proportion to their length. */
export function shares(texts: string[]) {
  const total = texts.reduce((n, t) => n + t.length, 0) || 1;
  let at = 0;
  return texts.map((t) => {
    const from = at / total;
    at += t.length;
    return [from, at / total] as const;
  });
}

/** A heading of whole lines (each on its own line), filled as one. Pass `drive` to fill from something other than the scroll. */
export function InkLines({
  lines,
  tone = "grey",
  className,
  style,
  drive,
  as: Tag = "h2",
  lineClassName = "block",
}: {
  lines: string[];
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
  drive?: MotionValue<number>;
  as?: "h2" | "p";
  lineClassName?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const own = useInkDrive(ref);
  const d = drive ?? own;
  const parts = shares(lines);
  return (
    <Tag ref={ref} className={className} style={style}>
      {lines.map((l, i) => (
        <InkPiece key={l} text={l} drive={d} from={parts[i][0]} to={parts[i][1]} tone={tone} className={lineClassName} />
      ))}
    </Tag>
  );
}
