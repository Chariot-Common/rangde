"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useHowItWorks } from "@/components/how-it-works/HowItWorksContext";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { EASE } from "./WhyRealStory";

/*
 * /v/why, "Up close" (16 Nov 2026, after genomines.com's "The tech": one full-bleed photo held on screen that moves closer each
 * time you scroll, field → plant → roots, with the same layout every time). Here: rural India at scale → one entrepreneur at
 * her loom → the threads she weaves, which stand for her credit history being built one repayment at a time.
 * Each photo pushes in slowly towards its subject while it's on screen, then gives way to the next, closer one.
 * Layout on every screen: a small "■ LABEL" and a big title bottom left; two lines and one link bottom right.
 */

const GREEN = "#8CA21E";
const INK = "#292D36";

type Shot = {
  src: string;
  alt: string;
  label: string;
  title: string;
  text: (s: ReturnType<typeof useRangDeStats>) => string;
  // A link, or (href null) the shared "How it works" overlay.
  cta: { label: string; href: string | null };
  // Where the camera pushes in to (transform-origin), and how close it starts and ends.
  focus: string;
  from: number;
  to: number;
  // How the photo is cropped (object-position).
  crop: string;
};

const SHOTS: Shot[] = [
  {
    src: "/images/collage/collage-04.webp",
    alt: "Women harvesting a field of ripe rice.",
    label: "At scale",
    title: "Across India.",
    text: (s) => `Weavers, farmers, tailors and shopkeepers, running small businesses in ${s.states} states.`,
    cta: { label: "Explore opportunities", href: "https://rangde.in/invest/individuals" },
    focus: "52% 48%",
    from: 1,
    to: 1.16,
    crop: "50% 55%",
  },
  {
    src: "/images/collage/collage-16.webp",
    alt: "A weaver smiling at her loom.",
    label: "One person",
    title: "One loan, one person.",
    text: () => "Every loan goes to one entrepreneur, met in person by a local partner who knows her and her business.",
    cta: { label: "Meet the entrepreneurs", href: "https://rangde.in/invest/individuals" },
    focus: "70% 45%",
    from: 1.04,
    to: 1.2,
    crop: "60% 40%",
  },
  {
    src: "/images/collage/collage-18.webp",
    alt: "Close-up of brightly coloured cloth taking shape on a handloom.",
    label: "Up close",
    title: "Every thread counts.",
    text: () => "Each repayment is reported to the credit bureaus. Month by month, thread by thread, she builds a credit history.",
    cta: { label: "See how it works", href: null },
    focus: "50% 82%",
    // The source is 1200px wide, so the push-in stays modest to keep the threads sharp.
    from: 1.3,
    to: 1.5,
    crop: "50% 85%",
  },
];
const N = SHOTS.length;
const CTA = "flex h-[46px] w-full items-center justify-center rounded-[10px] font-display text-[14px] font-bold transition-opacity hover:opacity-90";

function Layer({ shot, i, p }: { shot: Shot; i: number; p: MotionValue<number> }) {
  // Each photo owns a third of the scroll; it fades in over the end of the one before.
  const a = i / N;
  const b = (i + 1) / N;
  // A function, not keyframes: keyframed opacity gets handed to the browser's scroll timeline, which misreads this page.
  const opacity = useTransform(p, (v) => (i === 0 ? 1 : Math.min(1, Math.max(0, (v - (a - 0.08)) / 0.1))));
  const scale = useTransform(p, [Math.max(0, a - 0.08), b], [shot.from, shot.to]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="absolute inset-0" style={{ scale, transformOrigin: shot.focus }}>
        <Image src={shot.src} alt={shot.alt} fill sizes="100vw" priority={i === 0} className="object-cover" style={{ objectPosition: shot.crop }} />
      </motion.div>
    </motion.div>
  );
}

export function WhyZoom() {
  const reduce = useReducedMotion();
  const stats = useRangDeStats();
  const howItWorks = useHowItWorks();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [at, setAt] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setAt(Math.min(N - 1, Math.floor(v * N))));
  const s = SHOTS[at];

  if (reduce) {
    return (
      <section id="ch-close" className="mx-2 flex flex-col gap-2">
        {SHOTS.map((sh) => (
          <div key={sh.src} className="relative h-[70svh] overflow-hidden rounded-[16px]">
            <Image src={sh.src} alt={sh.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: sh.crop }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-white md:p-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em]">■ {sh.label}</p>
              <p className="font-display text-[40px] font-semibold leading-[1] tracking-[-0.03em] md:text-[72px]">{sh.title}</p>
              <p className="max-w-[420px] font-display text-[15px] leading-[22px] text-white/80">{sh.text(stats)}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="ch-close" className="mx-2 overflow-clip rounded-[16px] bg-[#1d1f1a]">
      <div ref={stage} className="relative" style={{ height: `${N * 110 + 60}svh` }}>
        <div className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))] overflow-hidden">
          {SHOTS.map((sh, i) => (
            <Layer key={sh.src} shot={sh} i={i} p={scrollYProgress} />
          ))}
          {/* Legibility: darker at the foot, where the words sit. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

          {/* Bottom left: the label and the big title. Bottom right: two lines and one link. */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 px-5 pb-28 text-white sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-12">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`t${at}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex flex-col gap-3 md:gap-4"
              >
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase leading-[14px] tracking-[0.14em] text-white/80 md:text-[13px]">
                  <span className="inline-block size-[8px]" style={{ backgroundColor: GREEN }} />
                  {s.label}
                </p>
                <p className="font-display text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] [text-wrap:balance] md:text-[96px] lg:text-[120px]">{s.title}</p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`d${at}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}
                className="flex w-full max-w-[340px] flex-col gap-4 md:mb-3"
              >
                <p className="font-display text-[15px] font-medium leading-[22px] text-white/88 md:text-[16px] md:leading-[24px]">{s.text(stats)}</p>
                {s.cta.href ? (
                  <a href={s.cta.href} className={CTA} style={{ backgroundColor: GREEN, color: INK }}>
                    {s.cta.label}
                  </a>
                ) : (
                  <button type="button" onClick={(e) => howItWorks.open(0, e.currentTarget.getBoundingClientRect())} className={CTA} style={{ backgroundColor: GREEN, color: INK }}>
                    {s.cta.label}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* How close we are: three ticks, top right. */}
          <div className="absolute right-5 top-5 flex items-center gap-1.5 md:right-12 md:top-8" aria-hidden>
            {SHOTS.map((_, i) => (
              <span key={i} className="h-[3px] rounded-full transition-all duration-300" style={{ width: i === at ? 28 : 12, backgroundColor: i <= at ? "#fff" : "rgba(255,255,255,0.35)" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
