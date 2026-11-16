"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRangDeStats } from "@/components/providers/StatsProvider";
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

/* ── WhyBlocks: "1 in 8", then the three countries as solid blocks rising from the card's edge (bolder, 17 Nov 2026:
      full-strength colour and very large figures, after realfood.gov's stat blocks). ───────────────────────────── */

// World Bank, Global Findex Database 2021: fin22a (borrowed from a bank or similar institution) and fin22b (borrowed from
// family or friends), adults 15+.
const COUNTRIES = [
  { name: "India", pct: 12, fill: GREEN, text: "#fff", note: "about 1 in 8" },
  { name: "United Kingdom", pct: 55, fill: INK, text: "#fbf8ef", note: "more than half" },
  { name: "United States", pct: 66, fill: INK, text: "#fbf8ef", note: "two in three" },
];

function Block({ c, i, p, reduce }: { c: (typeof COUNTRIES)[number]; i: number; p: MotionValue<number>; reduce: boolean }) {
  // Each block rises in turn; heights are shares of the tallest (66%).
  const h = useTransform(p, (v) => `${Math.min(1, Math.max(0, (v - (0.1 + i * 0.08)) / 0.45)) * (c.pct / 66) * 100}%`);
  return (
    <div className="flex h-full flex-1 flex-col justify-end">
      <motion.div
        className="flex min-h-[104px] flex-col justify-between overflow-hidden rounded-t-[16px] px-3 pb-4 pt-3 md:min-h-[216px] md:px-7 md:pb-7 md:pt-6"
        style={{ height: reduce ? `${(c.pct / 66) * 100}%` : h, backgroundColor: c.fill, color: c.text }}
      >
        <span className="font-display text-[36px] font-extrabold leading-[0.9] tracking-[-0.05em] tabular-nums md:text-[128px]">{c.pct}%</span>
        <span className="font-display text-[12px] font-bold leading-[16px] md:text-[20px] md:leading-[26px]">
          {c.name}
          <span className="block font-medium opacity-70 max-md:hidden">{c.note}</span>
        </span>
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
      <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 pt-24 text-center sm:px-8 md:pt-32">
        <Rise>
          <Label className="text-green-dark">Who gets a bank loan</Label>
        </Rise>
        <Rise delay={0.05}>
          <p className="mt-6 font-display text-[112px] font-extrabold leading-[0.9] tracking-[-0.05em] text-green-dark md:text-[220px]">1 in 8</p>
        </Rise>
        <Rise delay={0.12}>
          <p className="mt-6 max-w-[1080px] font-display text-[24px] font-bold leading-[32px] text-ink [text-wrap:balance] md:text-[40px] md:leading-[50px]">
            adults in India get a loan from a bank. In the UK it’s more than half, and in the US two in three.
          </p>
        </Rise>
        <Rise delay={0.18}>
          <p className="mt-5 max-w-[760px] font-display text-p1 font-medium text-ink/64 [text-wrap:balance] md:text-[20px] md:leading-[30px]">
            It isn’t for lack of need. Indians borrow anyway: 31% of adults turned to family or friends that year. What most of them can’t get is a loan
            from a bank.
          </p>
        </Rise>
      </div>
      {/* The blocks sit on the card's bottom edge. */}
      <div
        ref={ref}
        className="mx-auto mt-14 flex h-[56svh] max-w-[1240px] items-end gap-2 px-2 md:mt-20 md:h-[68svh] md:gap-3 md:px-8"
        role="img"
        aria-label="Adults who got a loan from a bank or similar lender in 2021: India 12%, United Kingdom 55%, United States 66%"
      >
        {COUNTRIES.map((c, i) => (
          <Block key={c.name} c={c} i={i} p={scrollYProgress} reduce={reduce} />
        ))}
      </div>
      <p className="px-4 py-4 text-center font-display text-[12px] font-medium leading-[16px] text-ink/48">
        Adults (15+) who got a loan from a bank or similar lender in 2021 · World Bank, Global Findex Database 2021
      </p>
    </section>
  );
}

/* ── WhyProof: Rang De's own live figures, said big (the figures row of Versions 1 to 3, as a band of its own). ── */

function CountUp({ to, decimals = 0, run }: { to: number; decimals?: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  const shown = run ? v : 0;
  return <span className="tabular-nums">{decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString("en-IN")}</span>;
}

export function WhyProof() {
  const stats = useRangDeStats();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const run = !!reduce || seen;
  const figures = [
    { to: stats.states, label: "states with Rang De entrepreneurs" },
    { to: stats.disbursedCr, decimals: 2, prefix: "₹", suffix: " Cr", label: "lent to them, in loans" },
    { to: stats.investors, label: "people investing, in India and abroad" },
    { to: stats.principalRepaidPct, decimals: 2, suffix: "%", label: "of the money lent has been repaid" },
  ];
  return (
    <section className="mx-2 rounded-[16px] px-4 py-20 sm:px-8 md:py-28" style={{ backgroundColor: GREEN_DARK }}>
      <div ref={ref} className="mx-auto flex max-w-[1240px] flex-col gap-12 md:gap-16">
        <Rise className="flex flex-col gap-4">
          <Label className="text-[#c6e87a]">It’s already working</Label>
          <h2 className="max-w-[900px] font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] text-white [text-wrap:balance] md:text-[64px]">
            Since 2019, this loop has been completed {stats.entrepreneurs.toLocaleString("en-IN")} times.
          </h2>
        </Rise>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-x-10 lg:grid-cols-4 lg:gap-x-12">
          {figures.slice(1).concat(figures.slice(0, 1)).map((f) => (
            <div key={f.label} className="flex min-w-0 flex-col gap-3 border-t border-white/24 pt-5">
              {/* The unit (₹, Cr, %) is set smaller than the digits, so the widest figure still fits its column. */}
              <p className="whitespace-nowrap font-display text-[30px] font-extrabold leading-none tracking-[-0.035em] text-white md:text-[48px] lg:text-[42px] xl:text-[60px]">
                {f.prefix && <span className="mr-[0.04em] text-[0.62em] align-[0.28em]">{f.prefix}</span>}
                <CountUp to={f.to} decimals={f.decimals} run={run} />
                {f.suffix && <span className="ml-[0.06em] text-[0.5em] font-bold tracking-[-0.01em]">{f.suffix.trim()}</span>}
              </p>
              <p className="font-display text-[13px] font-medium leading-[18px] text-white/72 md:text-[16px] md:leading-[22px]">{f.label}</p>
            </div>
          ))}
        </div>
        <p className="font-display text-[12px] font-medium leading-[16px] text-white/48">Live figures from rangde.in. Rang De is an RBI-registered NBFC-P2P.</p>
      </div>
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
      <Label className="text-[#c6e87a]">Where your money goes</Label>
      <h2 className="mt-5 font-display text-[56px] font-extrabold leading-[0.95] tracking-[-0.045em] text-white [text-wrap:balance] md:text-[104px] lg:text-[120px]">
        A small loan
        <br />
        goes a long way.
      </h2>
    </>
  );
  const Sub = (
    <p className="mt-6 max-w-[520px] font-display text-[18px] font-bold leading-[26px] text-white/72 [text-wrap:balance] md:text-[20px] md:leading-[30px]">
      A sewing machine, a loom, a buffalo, a stocked shelf. Every loan has a signed agreement behind it, and every repayment goes on her credit record.
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
