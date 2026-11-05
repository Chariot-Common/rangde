"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrollInk } from "./ScrollInk";

/*
 * Version 3's founders section (between the press row and How it works), all scroll-linked:
 * - The photo drifts gently against the scroll, like the floating photos on rangde.org's home page:
 *   a steady 160px rise across its whole trip up the screen (about a sixth of the scroll), with only a
 *   slight turn (−2° to −5°) and growth (100% to 104%), so it reads as a print lifting off the page
 *   rather than a dramatic move.
 * - The paragraph fills in letter by letter as it is read (ScrollInk).
 */

const TEXT = "Ram and Smita came back from Oxford to build Rang De, with a simple belief: where you live or how much you earn shouldn’t determine your opportunities to grow.";

export function FounderScroll() {
  const reduce = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);

  // The photo's trip up the screen: 0 as it enters at the bottom, 0.5 in the middle, 1 at the top.
  const { scrollYProgress: photo } = useScroll({ target: photoRef, offset: ["center end", "center start"] });
  // A steady, gentle drift: 80px low as it enters, at rest in the middle, 80px high at the top.
  const y = useTransform(photo, [0, 1], [80, -80]);
  const rotate = useTransform(photo, [0, 1], [-2, -5]);
  const scale = useTransform(photo, [0, 1], [1, 1.04]);
  // The shadow deepens from 48% to its full strength (0 16px 40px at 22% black) by the middle.
  const boxShadow = useTransform(photo, (t) => {
    const k = Math.min(1, Math.max(0, t * 2));
    return `0 ${6 + 10 * k}px ${24 + 16 * k}px rgba(0, 0, 0, ${(0.48 + 0.52 * k) * 0.22})`;
  });

  return (
    <section className="mx-2 flex flex-col items-center rounded-[16px] bg-white px-4 py-20 sm:px-8 md:py-24 lg:py-[120px]">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-12 text-center">
        <motion.div
          ref={photoRef}
          style={reduce ? { rotate: -4 } : { y, rotate, scale, boxShadow }}
          className="relative z-10 h-[180px] w-[240px] overflow-hidden rounded-[10px] border-[8px] border-white bg-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:h-[240px] sm:w-[320px]"
        >
          <Image src="/images/approaches/founders-oxford.png" alt="Ram and Smita, Rang De’s founders" fill sizes="352px" className="rounded-[4px] object-cover" />
        </motion.div>

        {/* Same size as the section headings that follow (H3). */}
        <ScrollInk text={TEXT} className="max-w-[820px] font-display text-h3 font-bold [text-wrap:pretty]" />
      </div>
    </section>
  );
}
