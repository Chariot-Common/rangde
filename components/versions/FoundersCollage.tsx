"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { LegacyButton as Button } from "@/components/ui/LegacyButton";
import { ScrollInk } from "./ScrollInk";
import { ASHOKA_CARD, AshokaFellowCard, SMITA_CARD, SmitaQuoteCard } from "./FounderCards";

/*
 * Version 1.1's founders section: the line, then one big photo of the two of them, behaving like Version 6's (a print
 * that drifts up against the scroll with a slight turn and growth), with smaller prints scattered around it. Sizes
 * are multiples of Version 6's print (320 × 240): centre 1.65×, the others 1×, 0.8×, 0.6× and 0.4×. The stage is laid
 * out in percentages of one 1200 × 760 design, so the whole arrangement scales down with the screen.
 *
 * Parallax is by depth: the centre print is the nearest and moves the most, the mid-sized ones (0.8× and 1×) move
 * at a middling pace, and the three small, far ones (0.4× and 0.6×) move the least.
 *
 * PLACEHOLDERS: the centre is the existing founders photo and the small ones are gallery photos, until the
 * real images are dropped in (see CENTRE and AROUND).
 */

const CENTRE = "/images/approaches/founders-oxford.png";

const W = 1200;
const H = 700;
const BASE = 320; // Version 6's print width; its height is 3/4 of that
const CENTRE_SCALE = 1.65; // the main print, in multiples of that

type Around = { src: string; scale: number; left: number; top: number; rotate: [number, number]; drift: [number, number]; z: number; card?: "smita" | "ashoka" };
// left/top: the print's top-left in design pixels; rotate: degrees at the start and end of its trip;
// drift: px offset at the start and end of its trip (the far ones barely move); z: stacking, far to near.
const AROUND: Around[] = [
  // Spread round the centre print so no corner is left empty.
  { src: "/images/collage/collage-02.webp", scale: 0.8, left: 70, top: 70, rotate: [-7, -10], drift: [120, -90], z: 3 },
  { src: "/images/founders-collage/group-entrepreneurs.webp", scale: 1, left: 876, top: 32, rotate: [-5, -8], drift: [140, -70], z: 4 },
  { src: "/images/founders-collage/social-investor-meetup.webp", scale: 0.8, left: 880, top: 470, rotate: [4, 2], drift: [70, -120], z: 3 },
  // far: 0.6×, the ones that move least
  { src: "/images/founders-collage/group-stakeholders.webp", scale: 0.6, left: 560, top: 22, rotate: [5, 8], drift: [20, -30], z: 1 },
  { src: "/images/founders-collage/group-picture-2.webp", scale: 0.6, left: 60, top: 440, rotate: [-4, -2], drift: [28, -18], z: 1 },
];

/*
 * Version 4 (`cards`): the same collage, with two prints swapped for cards from Figma (see FounderCards.tsx):
 * the top-left one becomes Ram's Ashoka Fellow card and the bottom-right one Smita's quote. They keep those
 * prints' tilt and drift; `scale` is in multiples of the card's Figma size. The quote card sits a little
 * further out than the print did so the centre photo doesn't cover it; the Ashoka card is tucked under the
 * centre photo's top-left corner. The two top photos also move
 * left, closer in (from the v4 review).
 */
const CARD_SWAPS: Record<string, Around> = {
  "/images/collage/collage-02.webp": { src: "card:ashoka", card: "ashoka", scale: 1.15, left: 110, top: 112, rotate: [-7, -10], drift: [120, -90], z: 3 },
  "/images/founders-collage/social-investor-meetup.webp": { src: "card:smita", card: "smita", scale: 0.8, left: 875, top: 470, rotate: [4, 2], drift: [70, -120], z: 3 },
  "/images/founders-collage/group-stakeholders.webp": { ...AROUND[3], left: 470 },
  "/images/founders-collage/group-entrepreneurs.webp": { ...AROUND[1], left: 830, top: 26 },
};

const pct = (n: number, of: number) => `${(n / of) * 100}%`;
const FRAME = "overflow-hidden border-solid border-white bg-white shadow-[0_16px_40px_rgba(0,0,0,0.22)]";
/** A print's border: 8 design pixels at 1×, in proportion to its scale, and (in container units) to the stage. */
const border = (scale: number) => `${((8 * scale) / W) * 100}cqw`;

// Phones (<768px): the stage is only about 360px wide, so the prints drift a quarter as far (the desktop's
// fixed pixel offsets threw them over the lines below), and the stage gets room above and below.
const PHONE = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function FoundersCollage({ cards = false }: { cards?: boolean } = {}) {
  const around = cards ? AROUND.map((a) => CARD_SWAPS[a.src] ?? a) : AROUND;
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const k = phone ? 0.25 : 1;
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // 0 as the stage enters at the bottom of the screen, 1 as it leaves at the top.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], [150 * k, -150 * k]); // the nearest print: the biggest drift
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, -5]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  return (
    <section className="mx-2 flex flex-col items-center gap-4 overflow-hidden rounded-[16px] bg-white px-4 pb-r5 pt-7 sm:px-8 sm:pt-r4 md:pb-ds-6 lg:pt-2">
      {/* Two levels only: the short line (Oxford is the word that has to land, so nothing else sits beside it)
          and Ram's own one-sentence why, from the version he shared. */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Fills in as it is read, like the page's other H3s (plain: no coloured edge). */}
        <ScrollInk as="h2" tone="plain" text="Ram and Smita left Oxford to build Rang De." className="max-w-[820px] font-display text-h3 font-bold [text-wrap:balance]" />
        <p className="max-w-[640px] font-display text-[18px] font-medium leading-[28px] text-text-grey-64 md:text-[22px] md:leading-[32px] [text-wrap:pretty]">
          With a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow.
        </p>
      </div>

      <div ref={stageRef} className="relative my-6 w-full max-w-[1200px] [container-type:inline-size] md:my-0 md:max-w-[66vw]" style={{ aspectRatio: `${W} / ${H}` }}>
        {around.map((a) => (
          <Print key={a.src} item={a} progress={scrollYProgress} reduce={!!reduce} k={k} />
        ))}
        {/* The big one: 1.5× Version 6's print, centred, in front of the rest. */}
        <motion.div
          style={{
            left: pct((W - BASE * CENTRE_SCALE) / 2, W),
            top: pct((H - BASE * CENTRE_SCALE * 0.75) / 2, H),
            width: pct(BASE * CENTRE_SCALE, W),
            borderWidth: border(CENTRE_SCALE),
            ...(reduce ? { rotate: -3 } : { y, rotate, scale }),
          }}
          className={`absolute z-10 aspect-[4/3] rounded-[10px] ${FRAME}`}
        >
          <Image src={CENTRE} alt="Ram and Smita, Rang De’s founders" fill sizes="(min-width: 1200px) 480px, 42vw" className="rounded-[4px] object-cover" />
        </motion.div>
      </div>

      {/* The call, kept small so it doesn't compete with the line above: one sentence, when, and the button. */}
      <div className="flex max-w-[560px] flex-col items-center gap-5 text-center">
        <p className="font-display text-p1 font-bold text-text-grey-100 [text-wrap:balance]">
          Talk directly with Ram and Smita about Rang De and the story behind it.
          <span className="mt-1 block font-medium text-text-grey-64">Every Saturday, 11 am IST</span>
        </p>
        <Button variant="primary" size="lg" className="px-10" style={{ backgroundColor: "var(--color-blue-highlight)" }}>
          Register
        </Button>
      </div>
    </section>
  );
}

/** One of the smaller prints: its own drift and tilt across the stage's trip up the screen. */
function Print({ item, progress, reduce, k }: { item: Around; progress: MotionValue<number>; reduce: boolean; k: number }) {
  const y = useTransform(progress, [0, 1], [item.drift[0] * k, item.drift[1] * k]);
  const rotate = useTransform(progress, [0, 1], item.rotate);
  if (item.card) {
    const size = item.card === "smita" ? SMITA_CARD : ASHOKA_CARD;
    return (
      <motion.div
        style={{ left: pct(item.left, W), top: pct(item.top, H), width: pct(size.w * item.scale, W), aspectRatio: `${size.w} / ${size.h}`, zIndex: item.z, ...(reduce ? { rotate: item.rotate[0] } : { y, rotate }) }}
        className="absolute"
      >
        {item.card === "smita" ? <SmitaQuoteCard scale={item.scale} /> : <AshokaFellowCard scale={item.scale} />}
      </motion.div>
    );
  }
  const w = BASE * item.scale;
  return (
    <motion.div
      style={{ left: pct(item.left, W), top: pct(item.top, H), width: pct(w, W), zIndex: item.z, borderWidth: border(item.scale), ...(reduce ? { rotate: item.rotate[0] } : { y, rotate }) }}
      className={`absolute aspect-[4/3] rounded-[6px] ${FRAME}`}
    >
      <Image src={item.src} alt="" fill sizes={`${Math.round(w)}px`} className="rounded-[2px] object-cover" />
    </motion.div>
  );
}

/** The call to action under the founders: the line, "Meet our founders", and when. Shared by Version 1.1's
 * collage and the section that closes Version 6's trust graph. */
export function FoundersCta({ navy = false }: { navy?: boolean }) {
  return (
    <div className="flex max-w-[860px] flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <Button variant="primary" size="lg" className="px-10" style={{ backgroundColor: navy ? "var(--color-nav-navy)" : "var(--color-blue-highlight)" }}>
          Meet Ram and Smita
        </Button>
        <p className="font-display text-h6 font-medium text-text-grey-64">Every Saturday, 11 am IST via Zoom.</p>
      </div>
    </div>
  );
}

export function FoundersCtaSection({ navy = false }: { navy?: boolean }) {
  return (
    <section className="mx-2 flex flex-col items-center rounded-[16px] bg-white px-4 py-20 sm:px-8 md:py-24 lg:py-[120px]">
      <FoundersCta navy={navy} />
    </section>
  );
}
