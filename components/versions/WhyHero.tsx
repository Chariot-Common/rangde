"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { EASE } from "./WhyRealStory";

/*
 * /v/why hero and "What Rang De is" (17 Nov 2026 review). The hero is one bold card: the headline on the left, one line saying
 * what Rang De is and the button on the right, then a wide photo of a business funded on Rang De (the photos change on their
 * own) with the live figures on it, each labelled. Under it, a section whose heading is a sentence made of the figures, with a
 * dotted map of India between four plain facts. The map follows India's official boundary (all of Jammu & Kashmir and
 * Ladakh), drawn coarse on purpose: it's a dot map, and the lit dots are decorative, not locations.
 */

const GREEN_DARK = "#3a6e0c";
const GREEN_DEEP = "#1F3F0B";
const LIME = "#D9E89A";
const PAPER = "#F7F3ED";


/* ── The map. Longitude/latitude outline, clockwise from the north. ─────────────────────────────────────────────── */

const INDIA: [number, number][] = [
  [74.4, 37.0], [75.8, 36.7], [77.0, 35.9], [78.0, 35.5], [79.5, 35.6], [80.3, 35.4], [80.2, 34.0], [79.5, 32.8], [78.9, 32.4], [78.8, 31.3],
  [79.8, 30.9], [80.6, 30.4], [81.1, 30.0], [80.2, 29.4], [80.1, 28.8], [81.2, 28.4], [82.5, 27.5], [83.4, 27.4], [84.1, 27.4], [85.0, 26.8],
  [86.0, 26.5], [87.2, 26.4], [88.0, 26.7], [88.1, 27.4], [88.6, 28.1], [88.9, 27.6], [88.8, 27.1], [89.6, 26.8], [90.6, 26.8], [91.6, 26.8],
  [92.1, 26.9], [91.7, 27.8], [92.6, 28.1], [93.4, 28.7], [94.3, 29.3], [95.4, 29.1], [96.2, 29.4], [96.6, 28.9], [97.3, 28.2], [97.0, 27.6],
  [96.1, 27.3], [95.3, 26.6], [95.1, 26.0], [94.6, 25.2], [94.7, 24.6], [93.9, 24.0], [93.4, 23.2], [93.2, 22.3], [92.6, 21.9], [92.3, 22.5],
  [92.2, 23.6], [91.6, 22.9], [91.2, 23.4], [91.4, 24.1], [92.0, 24.2], [92.2, 24.9], [91.0, 25.2], [89.9, 25.2], [89.8, 25.9], [89.1, 26.1],
  [88.5, 26.0], [88.3, 25.7], [88.5, 25.2], [88.1, 24.8], [88.7, 24.3], [88.8, 23.4], [89.0, 22.6], [89.0, 21.8], [88.0, 21.6], [87.3, 21.5],
  [86.9, 21.0], [86.5, 20.2], [85.4, 19.6], [84.8, 19.2], [84.1, 18.3], [83.3, 17.6], [82.3, 16.6], [81.3, 16.3], [80.9, 15.7], [80.1, 15.1],
  [80.2, 13.6], [80.3, 13.0], [79.9, 11.8], [79.8, 10.3], [79.3, 10.3], [78.9, 9.4], [78.2, 8.9], [77.5, 8.1], [76.9, 8.6], [76.3, 9.6],
  [75.8, 11.2], [75.2, 12.3], [74.7, 13.6], [74.3, 14.8], [73.8, 15.8], [73.4, 16.9], [73.1, 18.0], [72.8, 19.2], [72.8, 20.4], [72.6, 21.2],
  [72.6, 22.2], [72.2, 21.6], [71.4, 20.8], [70.4, 21.0], [69.5, 21.6], [69.0, 22.3], [69.8, 22.8], [69.1, 22.7], [68.4, 23.4], [68.3, 23.9],
  [68.8, 24.3], [70.0, 24.2], [71.0, 24.4], [70.6, 25.6], [70.2, 26.4], [69.6, 27.0], [70.5, 28.0], [71.9, 27.9], [72.9, 29.0], [73.4, 29.9],
  [74.0, 30.4], [74.6, 31.0], [74.6, 31.9], [75.3, 32.3], [74.5, 32.6], [73.6, 33.1], [73.4, 34.0], [72.5, 34.9], [71.6, 35.9], [71.4, 36.4],
  [72.5, 36.8], [73.6, 36.9],
];
// The Andaman & Nicobar Islands, as a short line of dots.
const ISLANDS: [number, number][] = [
  [92.8, 13.4], [92.8, 12.9], [92.7, 12.4], [92.7, 11.9], [92.6, 11.4], [92.8, 10.8], [93.4, 9.2], [93.8, 8.0],
];

function insidePoly(poly: [number, number][], x: number, y: number) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const inside = (x: number, y: number) => insidePoly(INDIA, x, y);

const STEP = 0.6;
const KX = 0.92; // cos(23°): keeps the country's proportions.
const MAP_W = (98 - 67.6) * KX;
const MAP_H = 37.6 - 7.4;

type Dot = { x: number; y: number; at: number; lit: boolean };

function makeDots(): Dot[] {
  // A fixed sequence, so the server and the browser draw the same dots.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: Dot[] = [];
  const add = (lon: number, lat: number) => {
    const r = rnd();
    out.push({ x: (lon - 67.6) * KX, y: 37.6 - lat, at: rnd(), lit: r < 0.62 });
  };
  let row = 0;
  for (let lat = 37.2; lat > 7.5; lat -= STEP * 0.87, row++) {
    for (let lon = 68 + (row % 2 ? STEP / 2 : 0); lon < 97.6; lon += STEP) if (inside(lon, lat)) add(lon, lat);
  }
  ISLANDS.forEach(([lon, lat]) => add(lon, lat));
  return out;
}

const DOTS = makeDots();

/* ── The hero (21 Nov 2026, after dwell.au and sereinwealth.com). A field at dawn fills the card; the first half of the
      headline sits around a small photo in the middle, as scattered words (Dwell). Real businesses cycle in that photo.
      Scrolling grows the photo until it fills the card (Serein), the words drift out, and the second half of the headline
      comes in from a blur with the line on what Rang De does. Pinned for about one extra screen. ───────────────────── */

const CYCLE = [
  { src: "/images/collage/collage-01.webp", tag: "Tailoring", pos: "45% 40%" },
  { src: "/images/collage/collage-13.webp", tag: "Dairy", pos: "40% 40%" },
  { src: "/images/collage/collage-10.webp", tag: "Village shop", pos: "50% 55%" },
  { src: "/images/collage/collage-16.webp", tag: "Handloom", pos: "55% 40%" },
  { src: "/images/collage/collage-03.webp", tag: "Fish farm", pos: "50% 40%" },
  { src: "/images/collage/collage-06.webp", tag: "Nursery", pos: "72% 40%" },
];
const CYCLE_MS = 2600;
const LINE_2 = "But affordable loans are hard to get.";

function HeroChar({ ch, p, at }: { ch: string; p: MotionValue<number>; at: number }) {
  const t = useTransform(p, (v) => Math.min(1, Math.max(0, (v - at) / 0.08)));
  const filter = useTransform(t, (v) => `blur(${(1 - v) * 14}px)`);
  return (
    <motion.span className="inline-block whitespace-pre" style={{ filter, opacity: t }}>
      {ch}
    </motion.span>
  );
}

export function ClearHeroGrow() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useTransform(scrollYProgress, () => 1);
  const p = reduce ? still : scrollYProgress;
  const [scene, setScene] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setScene((n) => (n + 1) % CYCLE.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce]);

  const grow = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.04) / 0.5)));
  const eased = useTransform(grow, (g) => 1 - Math.pow(1 - g, 3));
  // The photo is the full card, clipped to a small window that opens up. Laptops: 34% × 50%; phones: 84% × 40%.
  const clipLg = useTransform(eased, (g) => `inset(${25 * (1 - g)}% ${33 * (1 - g)}% ${25 * (1 - g)}% ${33 * (1 - g)}% round ${16 + 4 * g}px)`);
  const clipSm = useTransform(eased, (g) => `inset(${34 * (1 - g)}% ${8 * (1 - g)}% ${26 * (1 - g)}% ${8 * (1 - g)}% round ${16 + 4 * g}px)`);
  const words = useTransform(p, (v) => 1 - Math.min(1, Math.max(0, (v - 0.08) / 0.24)));
  const spread = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.04) / 0.4)) * 120);
  const spreadL = useTransform(spread, (v) => -v);
  const shade = useTransform(p, (v) => 0.2 + 0.4 * Math.min(1, Math.max(0, (v - 0.4) / 0.2)));
  const subOpacity = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.8) / 0.1)));
  const subY = useTransform(p, (v) => 24 * (1 - Math.min(1, Math.max(0, (v - 0.8) / 0.1))));
  const WORD = "absolute font-display font-medium leading-[0.95] tracking-[-0.035em] text-white text-[44px] md:text-[80px] lg:text-[104px] xl:text-[120px]";

  return (
    <section aria-label="Rang De" className="mx-2">
      <div ref={ref} className={reduce ? "" : "relative h-[190svh]"}>
        <div
          className={`${reduce ? "relative h-[calc(100svh-var(--navbar-bottom,0px)-8px)]" : "sticky top-[calc(var(--navbar-bottom,0px)+0px)] h-[calc(100svh-var(--navbar-bottom,0px)-8px)]"} min-h-[560px] overflow-hidden rounded-[20px]`}
          style={{ backgroundColor: GREEN_DEEP }}
        >
          {/* The field behind everything. */}
          <Image src="/images/collage/collage-05.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-60" style={{ objectPosition: "50% 70%" }} />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,63,11,0.55)" }} />

          {/* The photo window that grows to fill the card. Every business stays mounted; only the current one shows. */}
          {[clipLg, clipSm].map((clip, k) => (
            <motion.div key={k} className={`absolute inset-0 ${k === 0 ? "hidden md:block" : "md:hidden"}`} style={{ clipPath: clip }}>
              {CYCLE.map((sc, i) => (
                <motion.div key={sc.src} className="absolute inset-0" initial={false} animate={{ opacity: i === scene ? 1 : 0, scale: i === scene ? 1 : 1.06 }} transition={{ opacity: { duration: 0.9 }, scale: { duration: CYCLE_MS / 1000 + 0.9, ease: "linear" } }}>
                  <Image src={sc.src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: sc.pos }} />
                </motion.div>
              ))}
              <motion.div className="absolute inset-0 bg-black" style={{ opacity: shade }} />
            </motion.div>
          ))}

          <h1 aria-label="Rural businesses need loans to grow. But affordable loans are hard to get. Rang De lets you lend to them yourself." className="absolute inset-0">
            {/* The first half, scattered around the photo. */}
            <motion.span aria-hidden className={`${WORD} left-[5%] top-[7%] md:top-[10%]`} style={{ opacity: words, x: spreadL }}>
              Rural businesses
            </motion.span>
            <motion.span aria-hidden className={`${WORD} right-[5%] top-[46%] max-md:hidden`} style={{ opacity: words, x: spread }}>
              need loans
            </motion.span>
            <motion.span aria-hidden className={`${WORD} bottom-[8%] left-[5%] md:bottom-[10%] md:left-[18%]`} style={{ opacity: words, x: spreadL }}>
              <span className="md:hidden">need loans </span>to grow.
            </motion.span>

            {/* The second half, over the full photo: two lines at one size, together in the middle. The first comes in
                letter by letter from a blur; the second, about Rang De, rises in once the first is complete. */}
            <span aria-hidden className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-[0.12em] text-center font-display text-[30px] font-medium leading-[1.05] tracking-[-0.03em] min-[400px]:text-[34px] md:text-[52px] lg:text-[52px] xl:text-[64px] 2xl:text-[68px]">
              <span className="text-white lg:whitespace-nowrap">
                {(() => {
                  let n = 0;
                  return LINE_2.split(" ").map((word, w, all) => (
                    <span key={w} className="inline-block whitespace-nowrap">
                      {word.split("").map((ch) => {
                        const i = n++;
                        return <HeroChar key={i} ch={ch} p={p} at={0.58 + i * 0.006} />;
                      })}
                      {w < all.length - 1 && <HeroChar ch=" " p={p} at={0.58 + n++ * 0.006} />}
                    </span>
                  ));
                })()}
              </span>
              <motion.span className="lg:whitespace-nowrap" style={{ opacity: subOpacity, y: subY, color: LIME }}>
                Rang De lets you lend to them yourself.
              </motion.span>
            </span>
          </h1>

          {/* What's in the photo. */}
          <motion.span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1.5 font-display text-[12px] font-bold text-white backdrop-blur-md md:right-6 md:top-6 md:text-[13px]" style={{ opacity: words }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={scene} className="inline-block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {CYCLE[scene].tag}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </div>
      </div>
    </section>
  );
}

/* ── The hero (22 Nov 2026): the whole headline in one glance, at a calmer size, saying both the need and what Rang De
      does. A real business fills the card and changes every few seconds (slow push-in, crossfade); a strip of the
      other businesses sits at the bottom right and marks which one you're looking at (after sereinwealth.com's
      full-bleed hero and cruise.money's centred line). Archived at /v/archive/why-hero-glance;
      /v/why uses ClearHeroGrow. ──────────────────────────────────────────────────────────────────────────────── */

export function ClearHero() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setScene((n) => (n + 1) % CYCLE.length), CYCLE_MS + 1400);
    return () => clearInterval(t);
  }, [reduce]);
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section aria-label="Rang De" className="relative mx-2 h-[calc(100svh-var(--navbar-bottom,0px)-8px)] min-h-[560px] overflow-hidden rounded-[20px] text-white" style={{ backgroundColor: GREEN_DEEP }}>
      {CYCLE.map((sc, i) => (
        <motion.div key={sc.src} className="absolute inset-0" initial={false} animate={{ opacity: i === scene ? 1 : 0, scale: i === scene ? 1.06 : 1 }} transition={{ opacity: { duration: 1.2 }, scale: { duration: (CYCLE_MS + 2600) / 1000, ease: "linear" } }} aria-hidden={i !== scene}>
          <Image src={sc.src} alt={i === scene ? `${sc.tag}, a rural business.` : ""} fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: sc.pos }} />
        </motion.div>
      ))}
      {/* Darker at the bottom left, where the words sit. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:gap-10 md:p-10 lg:p-12">
        <div className="flex max-w-[760px] flex-col gap-4 md:gap-5">
          <motion.h1 {...rise(0.1)} className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.025em] [text-wrap:balance] md:text-[48px] lg:text-[60px]">
            Rural businesses need loans to grow.
            <span className="block" style={{ color: LIME }}>
              Rang De connects them with people who lend.
            </span>
          </motion.h1>
          <motion.p {...rise(0.25)} className="max-w-[520px] font-display text-[16px] font-medium leading-[24px] text-white/80 md:text-[18px] md:leading-[27px]">
            Choose a small business in rural India and lend to it directly.
          </motion.p>
        </div>

        {/* The other businesses, in a strip; the one on screen is outlined. */}
        <motion.ul {...rise(0.4)} className="flex shrink-0 gap-2" aria-label="Businesses shown">
          {CYCLE.map((sc, i) => (
            <li key={sc.src}>
              <button
                type="button"
                onClick={() => setScene(i)}
                aria-label={sc.tag}
                aria-pressed={i === scene}
                className="relative block h-[52px] w-[40px] overflow-hidden rounded-[8px] outline-offset-2 transition-[transform,opacity] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:h-[72px] md:w-[56px]"
                style={{ opacity: i === scene ? 1 : 0.55, transform: i === scene ? "translateY(-6px)" : "none", boxShadow: i === scene ? `0 0 0 2px ${LIME}` : "none" }}
              >
                <Image src={sc.src} alt="" fill sizes="56px" className="object-cover" style={{ objectPosition: sc.pos }} />
              </button>
            </li>
          ))}
        </motion.ul>
      </div>

      <span className="absolute left-5 top-5 rounded-full bg-black/40 px-3 py-1.5 font-display text-[12px] font-bold backdrop-blur-md md:left-10 md:top-8 md:text-[13px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={scene} className="inline-block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            {CYCLE[scene].tag}
          </motion.span>
        </AnimatePresence>
      </span>
    </section>
  );
}

/* ── What Rang De is, as a scroll story on a map of India, all of it real data (18 Nov 2026):
      1 every loan and how many states; 2 the four states rangde.in publishes figures for, lit on the map with what was lent
      in each; 3 seven in ten borrowers are women (seven in ten dots); 4 how much has been repaid (the unpaid 0.3% in red). ── */

const STATES: { name: string; cr: number; people: string; sectors: string; label: [number, number]; poly: [number, number][] }[] = [
  { name: "Rajasthan", cr: 20.56, people: "4.7K", sectors: "Farming, animal husbandry, retail", label: [73.6, 26.6],
    poly: [[69.5, 27.0], [70.2, 25.7], [71.0, 24.6], [73.0, 24.3], [74.3, 23.2], [74.8, 24.6], [76.0, 24.1], [77.0, 25.5], [78.2, 26.8], [77.0, 27.8], [76.0, 28.2], [75.0, 29.3], [73.9, 30.1], [73.0, 29.2], [72.0, 28.0], [70.5, 28.0]] },
  { name: "Assam", cr: 16.52, people: "5.1K", sectors: "Farming, animal husbandry, fisheries", label: [92.6, 26.3],
    poly: [[89.7, 26.0], [89.9, 26.9], [92.0, 27.0], [93.5, 27.3], [95.0, 27.9], [96.1, 27.9], [95.6, 27.1], [94.5, 26.5], [93.6, 25.8], [93.3, 25.0], [92.8, 24.3], [92.2, 24.6], [92.5, 25.6], [91.5, 25.9], [90.5, 25.9]] },
  { name: "Madhya Pradesh", cr: 14.46, people: "3.3K", sectors: "Animal husbandry, retail, farming", label: [78.4, 23.4],
    poly: [[74.1, 22.0], [74.8, 24.6], [76.0, 24.1], [77.0, 25.5], [78.3, 26.8], [79.0, 25.3], [80.5, 25.0], [82.3, 24.6], [82.8, 23.5], [81.5, 22.3], [80.5, 21.5], [79.0, 21.6], [77.5, 21.4], [76.2, 21.2], [75.0, 21.5]] },
  { name: "Maharashtra", cr: 7.63, people: "1.9K", sectors: "Farming, animal husbandry, others", label: [76.3, 19.3],
    poly: [[72.7, 20.1], [73.9, 20.8], [74.3, 21.9], [75.0, 21.5], [76.2, 21.2], [77.5, 21.4], [79.0, 21.6], [80.5, 21.5], [80.8, 19.5], [79.8, 18.8], [78.0, 18.5], [77.5, 18.3], [76.9, 17.6], [75.8, 16.6], [74.5, 16.0], [73.7, 15.8], [73.2, 17.5], [72.8, 19.2]] },
];
const FOUR_CR = STATES.reduce((a, b) => a + b.cr, 0);
const RED = "#E32642";
const GREEN = "#8CA21E";
const DIM = "rgba(41,45,54,0.13)";
// Which of the four states each dot falls in (or -1).
const DOT_STATE = DOTS.map((d) => {
  const lon = d.x / KX + 67.6;
  const lat = 37.6 - d.y;
  return STATES.findIndex((s) => insidePoly(s.poly, lon, lat));
});

function StoryMap({ step, womenPct, repaidPct }: { step: number; womenPct: number; repaidPct: number }) {
  return (
    <svg viewBox={`-0.4 -0.4 ${MAP_W + 0.8} ${MAP_H + 0.8}`} className="h-full w-full" role="img" aria-label="A dotted map of India that changes with each step of the story.">
      {DOTS.map((d, i) => {
        const inFour = DOT_STATE[i] >= 0;
        const fill =
          step === 0 ? GREEN : step === 1 ? (inFour ? GREEN_DARK : DIM) : step === 2 ? (d.at < womenPct / 100 ? GREEN_DARK : "#C9D69A") : d.at < repaidPct / 100 ? GREEN_DARK : RED;
        const big = (step === 1 && inFour) || (step === 3 && d.at >= repaidPct / 100);
        return <circle key={i} cx={d.x} cy={d.y} r={big ? 0.25 : 0.19} fill={fill} style={{ transition: `fill 500ms ${Math.round(d.at * 300)}ms, r 300ms` }} />;
      })}
      {STATES.map((s) => (
        <text
          key={s.name}
          x={(s.label[0] - 67.6) * KX}
          y={37.6 - s.label[1]}
          textAnchor="middle"
          fontSize="0.95"
          fontWeight="800"
          fill="#292D36"
          stroke="#fff"
          strokeWidth="0.32"
          paintOrder="stroke"
          style={{ opacity: step === 1 ? 1 : 0, transition: "opacity 400ms", fontFamily: "inherit" }}
        >
          {s.name}
        </text>
      ))}
    </svg>
  );
}

export function ClearReach() {
  const reduce = useReducedMotion();
  const s = useRangDeStats();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.floor(v * 4))));

  const n = (t: string) => (
    <span className="whitespace-nowrap" style={{ color: GREEN_DARK }}>
      {t}
    </span>
  );
  const H2 = "font-display text-[32px] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink [text-wrap:balance] md:text-[52px] lg:text-[64px]";
  const SUB = "max-w-[460px] font-display text-[15px] font-medium leading-[22px] text-ink/64 md:text-[18px] md:leading-[28px]";
  const fact = (big: string, small: string) => (
    <div className="flex flex-col gap-1 border-t border-ink/12 pt-3">
      <p className="font-display text-[26px] font-extrabold leading-[1] tracking-[-0.035em] text-ink tabular-nums md:text-[40px]">{big}</p>
      <p className="font-display text-[13px] font-medium leading-[18px] text-ink/64 md:text-[15px] md:leading-[21px]">{small}</p>
    </div>
  );
  const panels = [
    <>
      <h2 className={H2}>
        {n(s.entrepreneurs.toLocaleString("en-IN"))} loans, across {n(`${s.states} states`)}.
      </h2>
      <p className={SUB}>
        Each one to a small business in rural India. ₹{s.disbursedCr.toFixed(0)} Cr lent since 2019, by {s.investors.toLocaleString("en-IN")} people.
      </p>
    </>,
    <>
      <h2 className={H2}>{n(`₹${FOUR_CR.toFixed(0)} Cr`)} of it went to four states.</h2>
      <ul className="flex flex-col gap-3 md:gap-4">
        {STATES.map((st) => (
          <li key={st.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 font-display text-[14px] font-bold text-ink md:text-[17px]">
              <span>{st.name}</span>
              <span className="tabular-nums">
                ₹{st.cr.toFixed(2)} Cr <span className="font-medium text-ink/48">· {st.people} entrepreneurs</span>
              </span>
            </div>
            <div className="h-[8px] overflow-hidden rounded-full bg-ink/8">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: GREEN_DARK }} initial={{ width: "0%" }} animate={{ width: `${(st.cr / STATES[0].cr) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
            </div>
            <span className="font-display text-[12px] font-medium text-ink/48 max-md:hidden">{st.sectors}</span>
          </li>
        ))}
      </ul>
    </>,
    <>
      <h2 className={H2}>{n("7 in 10")} borrowers are women.</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fact(s.partners.toLocaleString("en-IN"), "local partners, who meet borrowers in person")}
        {fact(s.jobs.toLocaleString("en-IN"), "jobs created by these businesses")}
      </div>
    </>,
    <>
      <h2 className={H2}>Only {n(`${(100 - s.principalRepaidPct).toFixed(1)}%`)} of the money lent has been lost.</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fact(`₹${s.repaidCr.toFixed(0)} Cr`, "already repaid to the people who lent it")}
        {fact("RBI", "registered, as an NBFC-P2P lending platform")}
      </div>
    </>,
  ];
  const note = <p className="font-display text-[11px] font-medium leading-[15px] text-ink/40 md:text-[12px]">Live figures from rangde.in. State figures: rangde.in/invest/state, October 2026.</p>;

  if (reduce) {
    return (
      <section id="c-reach" className="mx-2 flex flex-col gap-12 rounded-[16px] px-4 py-20 sm:px-8" style={{ backgroundColor: PAPER }}>
        {panels.map((p, i) => (
          <div key={i} className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
            {p}
          </div>
        ))}
        {note}
      </section>
    );
  }

  return (
    <section id="c-reach" className="mx-2 overflow-clip rounded-[16px]" style={{ backgroundColor: PAPER }}>
      <div ref={stage} className="relative h-[250svh]">
        <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col justify-center px-4 pb-24 pt-4 sm:px-8 md:pb-8 md:pt-8">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
            <div className="mx-auto aspect-[28/30] h-[36svh] md:order-2 md:h-[min(78svh,720px)]">
              <StoryMap step={step} womenPct={s.womenPct} repaidPct={s.principalRepaidPct} />
            </div>
            <div className="flex min-h-[300px] flex-col gap-5 md:order-1 md:min-h-[440px] md:justify-center md:gap-8">
              <div className="flex items-center gap-1.5" aria-hidden>
                {panels.map((_, i) => (
                  <span key={i} className="h-[4px] rounded-full transition-all duration-300" style={{ width: i === step ? 32 : 14, backgroundColor: i <= step ? GREEN_DARK : "rgba(41,45,54,0.14)" }} />
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} className="flex flex-col gap-5 md:gap-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>
                  {panels[step]}
                </motion.div>
              </AnimatePresence>
              <div className="max-md:hidden">{note}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The photo-row hero (19 Nov 2026, layout from Figma "Rang De Master Design III", node 3132:3; the copy is ours).
      A centred sentence in three sizes over two rows of real photos that drift slowly in opposite directions. The hero
      stays put while the next section slides up over it, and it settles back a little as it's covered. ─────────────── */

const ROW_A = [
  { src: "/images/why-hero/borrower-11.webp", alt: "A woman standing in her pineapple field." },
  { src: "/images/collage/collage-02.webp", alt: "Three women smiling together at an event." },
  { src: "/images/why-hero/field-visit-3.webp", alt: "A group photo taken on a field visit." },
  { src: "/images/collage/collage-03.webp", alt: "Fish farmers holding up a large fish from their pond." },
  { src: "/images/collage/collage-05.webp", alt: "A woman standing in a mustard field." },
  { src: "/images/collage/collage-06.webp", alt: "A woman in her plant nursery holding seedlings." },
  { src: "/images/collage/collage-07.webp", alt: "A woman walking along a village path." },
];
const ROW_B = [
  { src: "/images/why-hero/borrower-12.webp", alt: "A shopkeeper smiling in the doorway of his shop." },
  { src: "/images/collage/collage-08.webp", alt: "A woman in her poultry shed." },
  { src: "/images/why-hero/field-visit-4.webp", alt: "People talking at a roadside food stall on a field visit." },
  { src: "/images/collage/collage-09.webp", alt: "Visitors in a small shop selling packaged food." },
  { src: "/images/collage/collage-11.webp", alt: "A woman standing in her field." },
  { src: "/images/collage/collage-12.webp", alt: "A man at work at his desk." },
  { src: "/images/collage/collage-14.webp", alt: "A woman harvesting in a green field." },
];

/** One row of photos, drawn twice so the loop is seamless; the copy is hidden from screen readers. */
function DriftRow({ photos, reverse, seconds }: { photos: { src: string; alt: string }[]; reverse?: boolean; seconds: number }) {
  return (
    <div className="h-[clamp(120px,20svh,230px)] overflow-hidden">
      <ul className={`flex h-full w-max gap-2 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`} style={{ animationDuration: `${seconds}s` }}>
        {[...photos, ...photos].map((ph, i) => (
          <li key={i} aria-hidden={i >= photos.length || undefined} className="relative h-full w-[clamp(170px,26svh,320px)] shrink-0 overflow-hidden rounded-4">
            <Image src={ph.src} alt={i >= photos.length ? "" : ph.alt} fill priority={i < 4} loading={i < 4 ? undefined : "eager"} sizes="320px" className="object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PhotoRowHero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const set = () => setVh(window.innerHeight);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  const scale = useTransform(scrollY, (y) => (reduce ? 1 : 1 - 0.06 * Math.min(1, Math.max(0, y / vh))));
  const fade = useTransform(scrollY, (y) => (reduce ? 1 : 1 - 0.5 * Math.min(1, Math.max(0, y / vh))));

  return (
    <section aria-labelledby="hero-heading" className="sticky top-[var(--navbar-bottom,0px)] z-0 mx-2 h-[calc(100svh-var(--navbar-bottom,0px)-8px)] min-h-[560px]">
      <motion.div className="flex size-full origin-top flex-col justify-center gap-ds-8 overflow-hidden rounded-4 bg-white py-r6" style={{ scale, opacity: fade }}>
        <h1 id="hero-heading" className="mx-auto flex w-full max-w-page flex-col items-center gap-3 px-4 text-center font-display text-text-grey-100">
          <span className="text-[44px] font-black leading-[1.02] [text-wrap:balance] md:text-[64px] lg:text-[80px] xl:text-[92px]">
            {/* Always two lines from tablets up: "Rural businesses / need loans to grow." */}
            <span className="md:block md:whitespace-nowrap">Rural businesses </span>
            <span className="md:block md:whitespace-nowrap">need loans to grow.</span>
          </span>
          <span className="text-p1 font-bold [text-wrap:balance]">Rang De lets you lend to them yourself, and get repaid with interest.</span>
        </h1>
        {/* "Get repaid with interest" is Rang De's own wording (their LinkedIn posts): it answers "is this a donation?" on
            the first screen. The risk is spelled out further down. No button here: the header already has two. */}
        <div className="flex w-full flex-col gap-2">
          <DriftRow photos={ROW_A} seconds={110} />
          <DriftRow photos={ROW_B} seconds={130} reverse />
        </div>
      </motion.div>
    </section>
  );
}
