"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Version 4, "Why we exist" (app/v/why), reworked 12 Nov 2026 with realfood.gov as the reference: told like a public-interest
 * campaign page, not a product page. One blunt headline on near-black; a real borrower's photo that grows as you scroll and
 * turns from grey to colour (the "rang" coming back); the problem as three giant sourced numbers; one piece of evidence (the
 * answer a first-time borrower hears); the turning line read word by word; then the fix in three tabs. A pill at the top
 * names the chapter you're in.
 *
 * Borrowed from the reference: structure and pacing only. Colours, type and tone stay Rang De's.
 * Figures Rang De still has to source show in <Tbc>, a dashed yellow chip, so the draft can't ship with a guess in it.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;
export const NIGHT = "#15130f"; // warm near-black
export const CREAM = "#fbf8ef";

export function Tbc({ children, note = "Figure to confirm" }: { children: ReactNode; note?: string }) {
  return (
    <span title={note} className="rounded-[6px] border border-dashed border-[#c99a00] bg-[#fff3c4] px-1.5 text-[#5c4700]">
      {children}
    </span>
  );
}

export const Label = ({ children, className = "text-[#fbf8ef]/56" }: { children: ReactNode; className?: string }) => (
  <p className={`font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.44px] ${className}`}>{children}</p>
);

export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={reduce || inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Scroll-read words: each word lights up as the line passes through the screen. ───────────────────────────── */

function Word({ word, i, n, progress, dim }: { word: string; i: number; n: number; progress: MotionValue<number>; dim: number }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [dim, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export function ScrollWords({ text, lead = 0, className, dim = 0.18 }: { text: string; lead?: number; className?: string; dim?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) =>
        reduce || i < lead ? (
          <span key={i}>{w} </span>
        ) : (
          <Word key={i} word={w} i={i - lead} n={words.length - lead} progress={scrollYProgress} dim={dim} />
        ),
      )}
    </p>
  );
}

/* ── Chapter pill: sticks under the nav and names the chapter in view. ──────────────────────────────────────── */

export const CHAPTERS = [
  { id: "ch-problem", label: "The problem" },
  { id: "ch-bank", label: "Why banks say no" },
  { id: "ch-where", label: "Where they go" },
  { id: "ch-trap", label: "The trap" },
  { id: "ch-fix", label: "The fix" },
  { id: "ch-you", label: "Your part" },
] as const;

export function ChapterPill() {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id));
    const onScroll = () => {
      const mid = window.innerHeight * 0.4;
      let cur = -1;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < mid) cur = i;
      });
      // Past the last chapter's end: hide.
      const last = els[els.length - 1];
      if (last && last.getBoundingClientRect().bottom < mid) cur = -1;
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none sticky top-[calc(var(--navbar-bottom,0px)+12px)] z-30 flex h-0 justify-center">
      <AnimatePresence>
        {active >= 0 && (
          <motion.nav
            aria-label="Chapters"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto mt-3 flex h-[40px] items-center gap-2 rounded-full bg-[#2a2620]/88 px-4 text-[#fbf8ef] shadow-[0_6px_24px_rgba(0,0,0,0.25)] backdrop-blur-md"
          >
            {CHAPTERS.map((c, i) =>
              i === active ? (
                <motion.a
                  key={c.id}
                  layout
                  href={`#${c.id}`}
                  className="whitespace-nowrap px-1 font-display text-[13px] font-bold leading-[16px]"
                >
                  {c.label}
                </motion.a>
              ) : (
                <motion.a
                  key={c.id}
                  layout
                  href={`#${c.id}`}
                  aria-label={c.label}
                  className="grid size-[16px] place-items-center"
                >
                  <span className="size-[6px] rounded-full bg-[#fbf8ef]/50" />
                </motion.a>
              ),
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 1. The opening. ───────────────────────────────────────────────────────────────────────────────────────── */

export function WhyOpening() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start end", "end end"] });
  // The photo grows to fill the frame, then the colour comes back and the line comes up.
  const scale = useTransform(p, [0.1, 0.6], [0.72, 1]);
  const radius = useTransform(p, [0.1, 0.6], [28, 12]);
  const grey = useTransform(p, [0.5, 0.72], [1, 0]);
  const filter = useTransform(grey, (g) => `grayscale(${g}) contrast(${1 + g * 0.12})`);
  // The line comes up once the colour is back.
  const [said, setSaid] = useState(false);
  useMotionValueEvent(p, "change", (v) => setSaid(v > 0.7));
  const showCaption = reduce || said;

  return (
    <section style={{ backgroundColor: NIGHT, color: CREAM }} className="mx-2 rounded-[16px]">
      <div className="flex flex-col items-center px-4 pb-10 pt-20 text-center sm:px-8 md:pt-28">
        <Rise>
          <Label className="text-[#c6e87a]">Why Rang De exists</Label>
        </Rise>
        <Rise delay={0.08}>
          <h1 className="mt-6 max-w-[1100px] font-display text-[52px] font-extrabold leading-[0.95] tracking-[-0.045em] [text-wrap:balance] sm:text-[80px] md:text-[112px] lg:text-[128px]">
            Most of India can’t borrow from a bank.
          </h1>
        </Rise>
        <Rise delay={0.18}>
          <p className="mt-8 max-w-[620px] font-display text-[18px] font-bold leading-[26px] text-[#fbf8ef]/72 [text-wrap:balance] md:text-[21px] md:leading-[30px]">
            India runs on millions of small businesses. Most of the people who run them have never been given a loan. The fix is simple: let
            people lend to people.
          </p>
        </Rise>
      </div>

      {/* The photo stage: tall, so the picture has room to grow while it's held on screen. */}
      <div ref={stage} className="relative h-[180svh]">
        <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] items-center justify-center px-2 pb-2">
          <motion.div
            style={reduce ? { borderRadius: 12 } : { scale, borderRadius: radius }}
            className="relative h-full max-h-[880px] w-full max-w-[1400px] overflow-hidden"
          >
            <motion.div className="absolute inset-0" style={reduce ? undefined : { filter }}>
              <Image
                src="/images/collage/collage-01.webp"
                alt="A Rang De borrower at her sewing machine, smiling, in her tailoring shop."
                fill
                priority
                sizes="100vw"
                className="object-cover object-[22%_40%]"
              />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
            <motion.div
              initial={false}
              animate={{ opacity: showCaption ? 1 : 0, y: showCaption ? 0 : 12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-x-0 bottom-6 flex justify-center px-4 md:bottom-10"
            >
              <p className="max-w-[560px] rounded-full bg-black/45 px-5 py-3 text-center font-display text-[15px] font-bold leading-[20px] text-white backdrop-blur-md md:text-[18px] md:leading-[24px]">
                A bank said no. People across India said yes.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 4. The turn. What follows (V4Cycle, the cost) is the fix; the live figures are once, in "Be part of it". ── */

export function TheFix() {
  return (
    <section
      id="ch-fix"
      className="mx-2 flex scroll-mt-[var(--navbar-bottom,0px)] flex-col items-center rounded-[16px] bg-[#fbf8ef] px-4 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-40"
    >
      <ScrollWords
        text="Rang De exists to change that."
        dim={0.12}
        className="max-w-[1100px] text-center font-display text-[56px] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink [text-wrap:balance] md:text-[112px] lg:text-[128px]"
      />
      <Rise className="mt-8 max-w-[640px] text-center">
        <p className="font-display text-[18px] font-bold leading-[26px] text-ink/64 [text-wrap:balance] md:text-[21px] md:leading-[30px]">
          You lend directly to an entrepreneur a local partner has met and vetted in person, inside India’s regulated P2P lending framework. The
          money reaches them through an escrow account and comes back to you with interest. It’s a loan, not a donation.
        </p>
      </Rise>
    </section>
  );
}
