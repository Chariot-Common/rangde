"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
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

const SCENES = [
  { src: "/images/collage/collage-01.webp", alt: "A woman smiling at her sewing machine in her tailoring unit.", tag: "A tailoring unit", pos: "50% 40%" },
  { src: "/images/collage/collage-05.webp", alt: "A farmer standing in her field of yellow mustard flowers.", tag: "A mustard farm", pos: "55% 45%" },
  { src: "/images/collage/collage-16.webp", alt: "A weaver smiling at her handloom.", tag: "A handloom", pos: "60% 40%" },
  { src: "/images/collage/collage-10.webp", alt: "A shopkeeper sitting in her small general store.", tag: "A village shop", pos: "50% 50%" },
  { src: "/images/collage/collage-13.webp", alt: "A woman with her buffalo outside her home.", tag: "A dairy", pos: "50% 35%" },
  { src: "/images/collage/collage-03.webp", alt: "Men lifting a large fish out of a net at their fish farm.", tag: "A fish farm", pos: "50% 45%" },
];
const SCENE_MS = 3200;

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

/* ── The hero: headline left, what Rang De is and the button right, then one wide photo with the live figures on it. ── */

export function ClearHero() {
  const reduce = useReducedMotion();
  const s = useRangDeStats();
  const [scene, setScene] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setScene((n) => (n + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(t);
  }, [reduce]);
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 28 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section aria-label="Rang De" className="mx-2 overflow-hidden rounded-[20px] px-3 pb-3 pt-10 text-white sm:px-6 sm:pb-6 md:px-10 md:pb-10 md:pt-16" style={{ backgroundColor: GREEN_DEEP }}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-6 px-1 md:gap-8">
          <motion.h1
            initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)", y: 40 }}
            animate={{ clipPath: "inset(-5% 0% -12% 0%)", y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-[42px] font-extrabold leading-[0.98] tracking-[-0.045em] min-[400px]:text-[46px] md:text-[60px] lg:text-[76px] xl:text-[88px]">
            Lend to rural entrepreneurs.
            <span className="block" style={{ color: LIME }}>
              Get repaid with interest.
            </span>
          </motion.h1>
          <motion.div {...rise(0.12)} className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-[560px] font-display text-[16px] font-medium leading-[24px] text-white/80 md:text-[19px] md:leading-[29px]">
              Rang De is an RBI-registered lending platform. You lend to a small business in rural India, and she repays you every month.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="relative h-[56svh] min-h-[400px] overflow-hidden rounded-[16px] md:h-[62svh]"
          initial={reduce ? false : { opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
        >
          {/* All the photos stay mounted (so each is loaded before its turn); only the one in view is opaque. */}
          {SCENES.map((sc, i) => (
            <motion.div key={sc.src} className="absolute inset-0" initial={false} animate={{ opacity: i === scene ? 1 : 0 }} transition={{ duration: 1.1, ease: "easeInOut" }} aria-hidden={i !== scene}>
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ scale: i === scene ? 1 : 1.08 }}
                transition={{ duration: i === scene ? SCENE_MS / 1000 + 1.2 : 0, delay: i === scene ? 0 : 1.1, ease: "linear" }}
              >
                <Image src={sc.src} alt={i === scene ? sc.alt : ""} fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: sc.pos }} />
              </motion.div>
            </motion.div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {/* What's in the photo: always a small business. */}
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/35 px-3.5 py-2 font-display text-[12px] font-bold text-white backdrop-blur-md md:right-5 md:top-5 md:text-[14px]">
            <span className="size-[7px] rounded-full" style={{ backgroundColor: LIME }} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={scene} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                {SCENES[scene].tag}, funded on Rang De
              </motion.span>
            </AnimatePresence>
          </div>

          {/* The live figures, on the photo, each one saying what it counts. */}
          <motion.div
            {...rise(0.5)}
            className="absolute inset-x-3 bottom-3 flex flex-col gap-3 rounded-[14px] border border-white/16 bg-black/40 p-4 backdrop-blur-xl md:inset-x-auto md:bottom-5 md:left-5 md:w-[360px] md:gap-4 md:p-5"
          >
            <p className="font-display text-[13px] font-bold text-white/80 md:text-[14px]">Lent on Rang De since 2019</p>
            <p className="font-display text-[36px] font-extrabold leading-[0.95] tracking-[-0.04em] tabular-nums md:text-[44px]">₹{s.disbursedCr.toFixed(0)} Cr</p>
            <div className="h-[5px] overflow-hidden rounded-full bg-white/24">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: LIME }}
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: `${s.principalRepaidPct}%` }}
                transition={{ duration: 1.4, delay: 0.9, ease: EASE }}
              />
            </div>
            <div className="flex items-center justify-between font-display text-[13px] font-bold md:text-[14px]">
              <span>{s.investors.toLocaleString("en-IN")} people lending</span>
              <span style={{ color: LIME }}>{s.principalRepaidPct.toFixed(1)}% principal repaid</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
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
