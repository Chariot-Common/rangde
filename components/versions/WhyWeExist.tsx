"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RangDeStats } from "@/lib/stats";
import { heroIntroStories, testimonialsRow1 } from "@/lib/content";
import { usePageReady } from "@/lib/use-page-ready";
import { LinkButton, SIGNUP_URL } from "./ui";

/*
 * Version 4, "Why we exist" (app/v/why) (review call, 11 Nov 2026). Ram: the homepage is for someone discovering the category, not
 * just Rang De, with zero context. It should read like a full-page print ad: here is the problem (stated with authority,
 * with sources), here is why Rang De exists, and you can be part of the solution. How it works, escrow and returns are
 * supporting detail further down or on their own pages; a featured entrepreneur and a featured social investor are only
 * links onward.
 *
 * DRAFT: figures Ram's team has to supply are shown in <Tbc>, a dashed yellow chip, so this can't ship with a guess in it:
 * the other countries' formal-credit figures, and the share government schemes reach (Ram said "about 15%" on the call).
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const GREEN = "#62af1d";

/** A figure still to be confirmed and sourced by Rang De. Visible on purpose. */
function Tbc({
  children,
  note = "Figure to confirm",
}: {
  children: ReactNode;
  note?: string;
}) {
  return (
    <span
      title={note}
      className="rounded-[6px] border border-dashed border-[#c99a00] bg-[#fff3c4] px-1.5 text-[#5c4700]"
    >
      {children}
    </span>
  );
}

function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={reduce || inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const Label = ({
  children,
  className = "text-ink/56",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p
    className={`font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.44px] ${className}`}
  >
    {children}
  </p>
);

/* 1. The opening: the 86% shown with real people. Seven of Rang De's borrowers come in in colour; six of them fade to grey
 * (six in every seven can't get a bank loan, about 86%); then "Rang De exists to change that" comes up and the six colour
 * back in one by one, each marked green. Reduced motion: the last state, at once. */
const PEOPLE = ["01", "05", "13", "10", "16", "07", "15"].map(
  (n) => `/images/collage/collage-${n}.webp`,
);
const BANKED = 3; // the one in seven a bank says yes to: the middle tile

export function WhyHero() {
  const reduce = useReducedMotion();
  // 0: all in colour; 1: six fade to grey; 2: Rang De's line, and they colour back in.
  // Timed from when the page loader has gone, so the first beat isn't played behind it.
  const ready = usePageReady();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduce || !ready) return;
    const a = setTimeout(() => setPhase(1), 1800);
    const b = setTimeout(() => setPhase(2), 4400);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduce, ready]);
  const p = reduce ? 2 : phase;
  let back = 0; // the order the grey tiles colour back in

  return (
    <section className="mx-2 flex min-h-[calc(100svh-var(--navbar-bottom,0px)-16px)] flex-col items-center justify-center gap-8 overflow-hidden rounded-[16px] bg-white px-4 py-16 text-center sm:px-8 md:gap-10">
      <div className="flex flex-col items-center gap-5">
        <Rise>
          <Label className="text-green-dark">Why Rang De exists</Label>
        </Rise>
        <Rise delay={0.1}>
          <h1 className="max-w-[1000px] font-display text-[40px] font-bold leading-[44px] tracking-[-0.8px] text-ink [text-wrap:balance] md:text-[64px] md:leading-[68px] md:tracking-[-1.6px]">
            Most of India still can’t borrow from a bank.
          </h1>
        </Rise>
      </div>

      {/* Seven people. */}
      <div className="flex w-full max-w-[1080px] flex-col items-center gap-4">
        <ul className="grid w-full grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
          {PEOPLE.map((src, i) => {
            const banked = i === BANKED;
            const order = banked ? 0 : back++;
            const grey = !banked && p === 1;
            const funded = !banked && p === 2;
            return (
              <motion.li
                key={src}
                className="relative aspect-[9/16] overflow-hidden rounded-[8px] sm:aspect-[3/4] md:rounded-[12px]"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.07,
                  ease: EASE,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 150px, 14vw"
                  className="object-cover transition-[filter,opacity] duration-700"
                  style={{
                    filter: grey ? "grayscale(1)" : "grayscale(0)",
                    opacity: grey ? 0.45 : 1,
                    transitionDelay: funded
                      ? `${0.3 + order * 0.22}s`
                      : `${order * 0.08}s`,
                  }}
                />
                {/* The green edge: funded through Rang De. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] transition-[box-shadow] duration-500"
                  style={{
                    boxShadow: funded
                      ? `inset 0 0 0 3px ${GREEN}`
                      : "inset 0 0 0 0 transparent",
                    transitionDelay: `${0.3 + order * 0.22}s`,
                  }}
                />
              </motion.li>
            );
          })}
        </ul>
        {/* The caption changes with the picture. */}
        <div className="relative h-[24px] w-full font-display text-[14px] font-bold leading-[24px] md:text-[16px]">
          <AnimatePresence mode="wait" initial={false}>
            {p > 0 && (
              <motion.p
                key={p === 2 ? "after" : "before"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={p === 2 ? "text-green-dark" : "text-ink/64"}
              >
                {p === 2
                  ? "Rang De lends to the other six."
                  : "Six in every seven can’t get a loan from a bank."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="flex flex-col items-center gap-6"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={p === 2 ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
      >
        <p className="max-w-[640px] font-display text-p1 font-medium text-ink/72 [text-wrap:balance] md:text-[22px] md:leading-[32px]">
          <strong className="font-bold text-ink">
            Rang De exists to change that.
          </strong>{" "}
          You lend directly to the rural entrepreneurs banks leave out, and
          you’re repaid with interest.
        </p>
        <LinkButton href="#how-it-works" variant="secondary">
          Meet Rekha ↓
        </LinkButton>
      </motion.div>
    </section>
  );
}

/* 3. After the story, the bigger picture: where India stands against other countries. */
const COUNTRIES: { name: string; pct?: number }[] = [
  { name: "India", pct: 14 },
  { name: "United Kingdom" },
  { name: "United States" },
  { name: "China" },
];

export function TheProblem() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <section
      id="the-problem"
      className="mx-2 flex scroll-mt-[var(--navbar-bottom,0px)] flex-col items-center gap-14 rounded-[16px] bg-ink px-4 py-20 text-white sm:px-8 md:py-28 lg:py-[120px]"
    >
      {/* After the story: Rekha isn't one person. The comparison Ram asked for, with authority and sources. */}
      <Rise className="flex max-w-[860px] flex-col items-center gap-4 text-center">
        <Label className="text-white/56">The bigger picture</Label>
        <h2 className="font-display text-[32px] font-bold leading-[38px] [text-wrap:balance] md:text-[48px] md:leading-[56px]">
          Rekha isn’t one person.{" "}
          <span className="text-[#c6e87a]">She’s most of India.</span>
        </h2>
      </Rise>

      {/* Where India stands. India's bar from the same source as the 86%; the others are placeholders until sourced. */}
      <div
        ref={ref}
        className="w-full max-w-[860px] rounded-[16px] bg-white/6 p-6 sm:p-10"
      >
        <Label className="text-white/56">
          Where India stands · adults with a loan from a bank or formal lender
        </Label>
        <ul className="mt-6 flex flex-col gap-4">
          {COUNTRIES.map((c, i) => {
            const india = c.pct !== undefined;
            return (
              <li
                key={c.name}
                className="grid grid-cols-[110px_1fr] items-center gap-4 sm:grid-cols-[150px_1fr]"
              >
                <span
                  className={`font-display text-p3 font-bold ${india ? "text-[#c6e87a]" : "text-white/80"}`}
                >
                  {c.name}
                </span>
                <div className="relative flex h-[36px] items-center overflow-hidden rounded-[6px] bg-white/8">
                  {india ? (
                    <>
                      <motion.div
                        className="h-full rounded-[6px]"
                        style={{ backgroundColor: GREEN }}
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: reduce || inView ? `${c.pct}%` : 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: EASE }}
                      />
                      <span className="pl-3 font-display text-p3 font-bold text-[#c6e87a]">
                        {c.pct}%
                      </span>
                    </>
                  ) : (
                    <motion.div
                      className="flex h-full items-center pl-3"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: reduce || inView ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                    >
                      <span className="font-display text-p3 font-bold">
                        <Tbc>XX%</Tbc>
                      </span>
                    </motion.div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 font-display text-[13px] font-medium leading-[20px] text-white/56">
          It isn’t a small gap at the edges. It’s most of the country, and most
          of the people building its small businesses.
        </p>
      </div>
    </section>
  );
}

/* 4. Be part of the solution: one featured entrepreneur, one featured social investor, both as links onward. */
export function BePartOfIt({ stats }: { stats: RangDeStats }) {
  const borrower = heroIntroStories[0];
  const investor = testimonialsRow1[1];
  const quote =
    investor.quote.find((q) => q.emphasized)?.text ??
    investor.quote.map((q) => q.text).join("");
  return (
    <section
      id="opportunities"
      className="mx-2 flex scroll-mt-[var(--navbar-bottom,0px)] flex-col items-center gap-12 rounded-[16px] bg-[#F7F3ED] px-4 py-20 sm:px-8 md:py-28 lg:py-[120px]"
    >
      <Rise className="flex max-w-[820px] flex-col items-center gap-4 text-center">
        <Label className="text-green-dark">The solution needs people</Label>
        <h2 className="font-display text-[32px] font-bold leading-[38px] text-ink [text-wrap:balance] md:text-[48px] md:leading-[56px]">
          You can be part of the solution.
        </h2>
        <p className="font-display text-p1 font-medium text-ink/72 [text-wrap:balance] md:text-[20px] md:leading-[30px]">
          {stats.investors.toLocaleString("en-IN")} people already are. Together
          they’ve funded {stats.entrepreneurs.toLocaleString("en-IN")}{" "}
          entrepreneurs, and {stats.principalRepaidPct.toFixed(1)}% of what they
          lent has been repaid.
        </p>
      </Rise>
      <div className="grid w-full max-w-[1000px] gap-2 md:grid-cols-2">
        <Rise className="h-full">
          <a
            href="https://rangde.in/invest/individuals"
            className="group flex h-full flex-col gap-5 rounded-[16px] bg-white p-6 transition-shadow hover:shadow-[0_8px_28px_rgba(41,45,54,0.10)] sm:p-8"
          >
            <Label>Meet an entrepreneur</Label>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- local photo, shown as a small round avatar */}
              <img
                src={borrower.avatar}
                alt=""
                className="size-[64px] rounded-full object-cover"
              />
              <p className="font-display text-[20px] font-bold leading-[26px] text-ink">
                {borrower.name}
              </p>
            </div>
            <p className="font-display text-[17px] font-medium leading-[26px] text-ink/72">
              {borrower.purpose}
            </p>
            <span className="mt-auto font-display text-p3 font-bold text-green-dark group-hover:underline">
              See who’s raising a loan now →
            </span>
          </a>
        </Rise>
        <Rise delay={0.1} className="h-full">
          <a
            href="https://rangde.in/wall-of-love"
            className="group flex h-full flex-col gap-5 rounded-[16px] bg-white p-6 transition-shadow hover:shadow-[0_8px_28px_rgba(41,45,54,0.10)] sm:p-8"
          >
            <Label>Meet a social investor</Label>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- local photo, shown as a small round avatar */}
              <img
                src={investor.avatar}
                alt=""
                className="size-[64px] rounded-full object-cover"
              />
              <div>
                <p className="font-display text-[20px] font-bold leading-[26px] text-ink">
                  {investor.name}
                </p>
                <p className="font-display text-[14px] font-medium leading-[20px] text-ink/56">
                  {investor.role}
                </p>
              </div>
            </div>
            <p className="font-display text-[17px] font-medium leading-[26px] text-ink/72">
              “{quote.trim()}”
            </p>
            <span className="mt-auto font-display text-p3 font-bold text-green-dark group-hover:underline">
              Hear from more investors →
            </span>
          </a>
        </Rise>
      </div>
      <LinkButton href={SIGNUP_URL}>Get started</LinkButton>
    </section>
  );
}

/* Sources, at the foot of the argument. */
export function Sources() {
  return (
    <section className="mx-2 rounded-[16px] bg-white px-4 py-10 sm:px-8">
      <ol className="mx-auto flex max-w-[1100px] flex-col gap-1 font-display text-[13px] font-medium leading-[20px] text-ink/56">
        <li>86% of India’s eligible adults without a bank loan; 12% who borrowed from a bank or formal lender and 31% from family or friends in 2021: World Bank, Global Findex Database 2021.</li>
        <li>Nearly half of rural households relying on informal lenders, and informal loans averaging 17.77% a year: NABARD Rural Economic Conditions &amp; Sentiments Survey, July 2026.</li>
        <li>Self-help groups’ group liability and savings-linked loans: RBI, SHG–bank linkage circular.</li>
        <li>Rang De’s interest of up to 8.5% a year, the live figures and the repayment rate: rangde.in.</li>
        <li>
          <Tbc>
            Source for the share of people government schemes reach (about 15%, from the 11 Nov call): to come from Rang De.
          </Tbc>
        </li>
      </ol>
    </section>
  );
}
