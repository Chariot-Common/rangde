"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Label, Rise } from "./WhyRealStory";

/*
 * /v/why, 13 Nov 2026 (second pass after the review): the two set-pieces that carry the page, made the way realfood.gov
 * makes its moments, in Rang De's colours and voice rather than its dark look.
 *   WhyBlocks: one figure, said once, very big; then the three countries as solid blocks that rise from the bottom edge of
 *              the card as you scroll (the reference's red stat blocks, here India in Rang De green).
 *   WhyBuilds: Rang De's part. One huge line on deep green, and real borrowers' photos that fly in from off-screen and settle
 *              round it as you scroll, each with a sticker naming the business (the reference's food objects assembling).
 */

const GREEN = "#8CA21E";
const GREEN_DARK = "#3a6e0c";
const PAPER = "#F7F3ED";
const INK = "#292D36";

/* ── WhyBlocks ──────────────────────────────────────────────────────────────────────────────────────────────── */

// World Bank, Global Findex 2021, indicator fin22a: borrowed from a formal bank or similar financial institution (% age 15+).
const COUNTRIES = [
  { name: "India", pct: 12, fill: GREEN, text: "#fff" },
  { name: "United Kingdom", pct: 55, fill: "#e4ded3", text: INK },
  { name: "United States", pct: 66, fill: "#d6cfc2", text: INK },
];

function Block({ c, i, p, reduce }: { c: (typeof COUNTRIES)[number]; i: number; p: MotionValue<number>; reduce: boolean }) {
  // Each block rises in turn; heights are shares of the tallest (66%).
  const h = useTransform(p, [0.1 + i * 0.08, 0.55 + i * 0.08], ["0%", `${(c.pct / 66) * 100}%`]);
  return (
    <div className="flex h-full flex-1 flex-col justify-end">
      <p className="mb-3 font-display text-[13px] font-bold uppercase leading-[16px] tracking-[1.2px] text-ink/64 md:text-[14px]">{c.name}</p>
      <motion.div
        className="flex items-start rounded-t-[14px] px-4 pt-3 md:px-6 md:pt-5"
        style={{ height: reduce ? `${(c.pct / 66) * 100}%` : h, backgroundColor: c.fill, color: c.text }}
      >
        <span className="font-display text-[36px] font-extrabold leading-none tracking-[-0.03em] tabular-nums md:text-[72px]">{c.pct}%</span>
      </motion.div>
    </div>
  );
}

export function WhyBlocks() {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  return (
    <section id="ch-gap" className="mx-2 overflow-hidden rounded-[16px]" style={{ backgroundColor: PAPER }}>
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 pt-24 text-center sm:px-8 md:pt-36">
        <Rise>
          <Label className="text-green-dark">Where India stands</Label>
        </Rise>
        <Rise delay={0.05}>
          <p className="mt-6 font-display text-[112px] font-extrabold leading-[0.9] tracking-[-0.05em] text-green-dark md:text-[220px]">1 in 8</p>
        </Rise>
        <Rise delay={0.12}>
          <p className="mt-6 max-w-[760px] font-display text-[24px] font-bold leading-[32px] text-ink [text-wrap:balance] md:text-[36px] md:leading-[46px]">
            adults in India borrowed from a bank in 2021. In the UK and the US, most people do.
          </p>
        </Rise>
        <Rise delay={0.18}>
          <p className="mt-5 max-w-[560px] font-display text-p1 font-medium text-ink/64 [text-wrap:balance]">
            It isn’t that people here work less or repay less. Most of them have simply never been given the chance to show it.
          </p>
        </Rise>
      </div>
      {/* The blocks sit on the card's bottom edge. */}
      <div ref={ref} className="mx-auto mt-16 flex h-[52svh] max-w-[1200px] items-end gap-2 px-2 md:mt-24 md:h-[62svh] md:gap-3 md:px-8" role="img" aria-label="Adults who borrowed from a bank in 2021: India 12%, United Kingdom 55%, United States 66%">
        {COUNTRIES.map((c, i) => (
          <Block key={c.name} c={c} i={i} p={scrollYProgress} reduce={reduce} />
        ))}
      </div>
      <p className="bg-white/0 px-4 py-4 text-center font-display text-[12px] font-medium leading-[16px] text-ink/48">
        Adults who borrowed from a bank or similar institution, 2021 · World Bank, Global Findex Database 2021
      </p>
    </section>
  );
}

/* ── WhyBuilds ──────────────────────────────────────────────────────────────────────────────────────────────── */

// Where each photo comes from (x, y in vw / vh, off-screen) and where it settles (left / top in % of the stage).
const PHOTOS = [
  { src: "/images/collage/collage-01.webp", alt: "A tailor at her sewing machine in her shop.", tag: "Tailoring", at: [15, 24], from: [-60, -30], rot: -6, w: 250 },
  { src: "/images/collage/collage-16.webp", alt: "A weaver at her loom.", tag: "Weaving", at: [21, 84], from: [-50, 50], rot: 4, w: 230 },
  { src: "/images/collage/collage-10.webp", alt: "A woman outside her village shop, its shelves stocked.", tag: "A village shop", at: [85, 22], from: [60, -40], rot: 5, w: 260 },
  { src: "/images/collage/collage-13.webp", alt: "A dairy farmer with her buffalo.", tag: "Dairy", at: [80, 83], from: [55, 50], rot: -4, w: 240 },
  { src: "/images/collage/collage-05.webp", alt: "A farmer in a field of yellow mustard.", tag: "Farming", at: [9, 60], from: [-70, 10], rot: 3, w: 190 },
  { src: "/images/collage/collage-12.webp", alt: "A young man at a machine in his print shop.", tag: "A print shop", at: [92, 55], from: [70, 10], rot: -3, w: 190 },
] as const;

function FlyingPhoto({ ph, i, p }: { ph: (typeof PHOTOS)[number]; i: number; p: MotionValue<number> }) {
  const start = 0.05 + i * 0.05;
  const end = start + 0.35;
  const x = useTransform(p, [start, end], [`${ph.from[0]}vw`, "0vw"]);
  const y = useTransform(p, [start, end], [`${ph.from[1]}vh`, "0vh"]);
  const rotate = useTransform(p, [start, end], [ph.rot * 4, ph.rot]);
  const scale = useTransform(p, [start, end], [0.7, 1]);
  return (
    <motion.figure
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${ph.at[0]}%`, top: `${ph.at[1]}%`, width: ph.w, x, y, rotate, scale }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] border-[6px] border-white shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <Image src={ph.src} alt={ph.alt} fill sizes="260px" className="object-cover" />
      </div>
      <figcaption
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-display text-[13px] font-bold leading-[16px]"
        style={{ backgroundColor: "#FFCA3E", color: INK, rotate: `${-ph.rot}deg` }}
      >
        {ph.tag}
      </figcaption>
    </motion.figure>
  );
}

export function WhyBuilds() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  // The line under the headline comes in once most of the photos have landed.
  const [said, setSaid] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setSaid(v > 0.5));

  const Headline = (
    <>
      <Label className="text-[#c6e87a]">What your money does</Label>
      <h2 className="mt-5 font-display text-[56px] font-extrabold leading-[0.95] tracking-[-0.045em] text-white [text-wrap:balance] md:text-[104px] lg:text-[120px]">
        Lend to people,
        <br />
        not paperwork.
      </h2>
    </>
  );
  const Sub = (
    <p className="mt-6 max-w-[520px] font-display text-[18px] font-bold leading-[26px] text-white/72 [text-wrap:balance] md:text-[20px] md:leading-[30px]">
      A sewing machine, a loom, a buffalo, a stocked shelf. Your loan buys what keeps a small business growing, and every repayment builds her record.
    </p>
  );

  return (
    // overflow-clip, not overflow-hidden: hidden would make the section a scroll container and stop the canvas pinning.
    <section id="ch-builds" className="mx-2 overflow-clip rounded-[16px]" style={{ backgroundColor: GREEN_DARK }}>
      {/* Laptops: the pinned canvas. */}
      {!reduce && (
        <div ref={stage} className="relative hidden h-[260svh] lg:block">
          <div className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))]">
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              {Headline}
              <motion.div initial={false} animate={{ opacity: said ? 1 : 0, y: said ? 0 : 16 }} transition={{ duration: 0.5 }}>{Sub}</motion.div>
            </div>
            {PHOTOS.map((ph, i) => (
              <FlyingPhoto key={ph.src} ph={ph} i={i} p={scrollYProgress} />
            ))}
          </div>
        </div>
      )}
      {/* Phones, tablets and reduced motion: the line, then the photos in a grid. */}
      <div className={`flex flex-col items-center px-4 py-20 text-center sm:px-8 ${reduce ? "" : "lg:hidden"}`}>
        <Rise className="flex flex-col items-center">
          {Headline}
          {Sub}
        </Rise>
        <div className="mt-12 grid w-full max-w-[720px] grid-cols-2 gap-x-3 gap-y-6">
          {PHOTOS.map((ph, i) => (
            <Rise key={ph.src} delay={(i % 2) * 0.06} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] border-4 border-white" style={{ rotate: `${ph.rot / 2}deg` }}>
                <Image src={ph.src} alt={ph.alt} fill sizes="50vw" className="object-cover" />
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-display text-[12px] font-bold leading-[16px]" style={{ backgroundColor: "#FFCA3E", color: INK }}>
                {ph.tag}
              </span>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
