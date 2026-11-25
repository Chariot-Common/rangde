"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui";
import { ScrollInk } from "./ScrollInk";
import { HEAD, PAPER, SUB } from "./WhyThread2";

/*
 * Version 4 (/v/v4, from /v/why3; 24 Nov 2026 review). Two sections of its own:
 *
 * V4ProblemOptions: the problem and the options in one place, so there's less to scroll. The problem's line sits in the
 * middle of the pinned dark screen (with /v/why3's clip of people at work behind it) and brightens word by word; then
 * the five options rise over it one after another, as /v/why3's option cards did. Each card leads with its point in one
 * line ("Banks rarely say yes to a first loan."), no label above it and no divider, and the number that backs it is in
 * the card's own text (the four separate stat cards and the "every option is shut" lines are gone). Government schemes
 * are in, second, as the question people ask first.
 *
 * V4Close: the closing line with a plain Invest button under it, ahead of the live opportunities.
 */

const DARK = "#1B1D22";

// 25 Nov 2026 (second review): "businesses’" (plural). The line will also say something about keeping the business
// (and the family's livelihood) going, not only growing it; that wording is still to be agreed.
const PROBLEM = "Millions in rural India find it difficult to fund their businesses’ growth.";

// 25 Nov 2026 (second review): shorter, so each card reads at a glance while it rises (the eye should be on the
// movement, not the reading): a point of two lines at most, then one short line. The 86% and 49% figures are out.
type Option = { icon: IconName | "scheme"; t: string; s: string };
const OPTIONS: Option[] = [
  { icon: "bank", t: "Banks rarely say yes to a first loan.", s: "They ask for collateral and a credit history." },
  { icon: "scheme", t: "Government help doesn’t reach all.", s: "Most schemes still lend through banks." },
  { icon: "money-bag", t: "Moneylenders charge too much.", s: "Interest can reach 120–180% a year." },
  { icon: "avatars-group", t: "Self-help groups lend only if all agree.", s: "And only when the group has money to give." },
  { icon: "house-avatar", t: "Family and friends rarely have enough.", s: "Seldom enough to grow a business." },
];

/** Where each card crosses (share of the free width) and its tilt as it enters. */
const LANES = [
  { x: 0.1, r: 6 },
  { x: 0.86, r: -5 },
  { x: 0.3, r: 4 },
  { x: 0.7, r: -4 },
  { x: 0.16, r: 5 },
];

// Scroll, in screen heights: the line on its own first, then the cards, overlapping so the next is coming in at the
// bottom as the one before leaves at the top.
// 25 Nov 2026: phones move through it faster (about 4 screens of scrolling instead of almost 6): the line fills sooner
// and each card crosses in less scroll, with the same overlap between cards.
const timing = (lead: number, run: number) => {
  const step = run * 0.62;
  return { LEAD: lead, RUN: run, STEP: step, SPAN: lead + step * (OPTIONS.length - 1) + run };
};
const DESKTOP = timing(0.6, 1.2);
const PHONE = timing(0.35, 0.8);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const PHONE_QUERY = "(max-width: 767px)";
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** True on phones (below Tailwind's md); false on the server, so the first paint is the tablet-and-up timing. */
function useIsPhone() {
  return useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
}

export function V4ProblemOptions({ video }: { video?: string }) {
  const reduce = useReducedMotion();
  const { LEAD, RUN, STEP, SPAN } = useIsPhone() ? PHONE : DESKTOP;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 36, restDelta: 0.0005 });
  // 25 Nov 2026 (second review): the line is white throughout: no word-by-word fill and no dimming as the cards cross
  // it, and "What are their options?" is gone. The lead is still there, so the line is read on its own first.

  if (reduce) {
    return (
      <section id="c-problem" className="mx-2 overflow-clip rounded-[24px] px-4 py-20 sm:px-6 lg:px-8" style={{ backgroundColor: DARK }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-12">
          <h2 className={`${HEAD} max-w-[1000px] text-center text-[34px] text-white md:text-[56px]`}>{PROBLEM}</h2>
          <ul className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-3">
            {OPTIONS.map((o) => (
              <li key={o.t}>
                <OptionCard o={o} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section id="c-problem" aria-label={PROBLEM} className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: DARK }}>
      {/* The height from CSS (phones / tablets up), so it's right before the page is interactive too. */}
      <div
        ref={ref}
        className="relative h-[var(--h-phone)] md:h-[var(--h-wide)]"
        style={{ "--h-phone": `${(1 + PHONE.SPAN) * 100}svh`, "--h-wide": `${(1 + DESKTOP.SPAN) * 100}svh` } as CSSProperties}
      >
        <div className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))] overflow-hidden px-4 [--cw:min(78vw,400px)] sm:px-6 md:[--cw:clamp(300px,28vw,440px)] lg:px-8">
          {video && (
            <>
              <video aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" src={video} autoPlay muted loop playsInline preload="auto" />
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-text-grey-100/96" />
            </>
          )}
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <h2 aria-hidden className={`${HEAD} max-w-[1120px] text-[34px] leading-[1.15] text-white-100 md:text-[56px] lg:text-[64px]`}>
              {PROBLEM}
            </h2>
          </div>
          <ul className="pointer-events-none absolute inset-y-0 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
            {OPTIONS.map((o, i) => (
              <RisingCard key={o.t} o={o} i={i} p={p} start={(LEAD + i * STEP) / SPAN} end={(LEAD + i * STEP + RUN) / SPAN} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** One card's run up the screen: from just below it to just above, tilted and a little smaller as it comes in. */
function RisingCard({ o, i, p, start, end }: { o: Option; i: number; p: MotionValue<number>; start: number; end: number }) {
  const lane = LANES[i % LANES.length];
  const t = useTransform(p, (v) => clamp01((v - start) / (end - start)));
  const outer = useTransform(t, (v) => `${(1 - v) * 100}%`);
  const inner = useTransform(t, (v) => `${-v * 100}%`);
  const rotate = useTransform(t, (v) => lane.r * (1 - v));
  const scale = useTransform(t, (v) => 0.88 + 0.12 * Math.min(1, v / 0.5));
  const visibility = useTransform(t, (v) => (v <= 0 || v >= 1 ? "hidden" : "visible"));
  return (
    <motion.li className="absolute inset-0" style={{ y: outer, visibility }}>
      <motion.div className="absolute top-0 w-[var(--cw)]" style={{ left: `calc((100% - var(--cw)) * ${lane.x})`, y: inner, rotate, scale }}>
        <OptionCard o={o} />
      </motion.div>
    </motion.li>
  );
}

/** A government scheme, drawn to sit with the design system's solid nav-navy icons: a document with a round seal. */
function SchemeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} aria-hidden className="block shrink-0">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#00517A" />
      <path d="M15 2v4a1 1 0 0 0 1 1h4" fill="#CBE8F6" />
      <rect x="7" y="8" width="6" height="1.6" rx="0.8" fill="#fff" />
      <rect x="7" y="11.2" width="10" height="1.6" rx="0.8" fill="#fff" />
      <circle cx="14.5" cy="17" r="2.6" fill="#fff" />
      <circle cx="14.5" cy="17" r="1.2" fill="#00517A" />
    </svg>
  );
}

/** An option: its icon, the point in one bold line, then one short line. 25 Nov 2026 (second review): all centred. */
function OptionCard({ o }: { o: Option }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-6 text-center shadow-6 lg:p-8">
      {o.icon === "scheme" ? <SchemeIcon /> : <Icon name={o.icon} size={40} />}
      <h3 className={`${HEAD} text-[28px] leading-[1.12] text-ink lg:text-[34px]`}>{o.t}</h3>
      <p className={`${SUB} text-ink/64`}>{o.s}</p>
    </div>
  );
}

/** The founders as a section break (25 Nov 2026, in place of the close): one horizontal grey card, after the "quote
 * card" on Threads' case studies. Left: "Ram and Smita left Oxford to build Rang De." at the page's section heading size,
 * and an underlined "Read more" under it. Right: Ram and Smita cut out, standing on the card's bottom edge. Phones: the
 * words first, the two of them under them at the right.
 * `tone` (25 Nov 2026): "navy" is the card in the nav's dark blue, the heading in white, one line on how Rang De began
 * (white 64) between the heading and "Read more" (white 48, over a dotted line), and Ram and Smita cropped just above
 * Ram's belt with a 6px white outline (as thick as the photo frames in "This is why Rang De exists"), baked into
 * ram-smita-outlined.webp (342×283). "grey" is the first version (background grey, the heading in text grey 100, "Read
 * more" underlined in text grey 64, the full-length cut-out, no line). Corners 8px, as the sections around it. */

// The dotted line under "Read more": round dots 1.6px across, 1.6px apart (a 3.2px tile with one dot in it).
const DOTTED = "bg-[radial-gradient(circle_at_0.8px_0.8px,currentColor_0.55px,transparent_0.85px)] bg-[length:3.2px_1.6px] bg-[position:0_100%] bg-repeat-x pb-[5px]";

export function V4FoundersCard({ href = "#", tone = "grey" }: { href?: string; tone?: "grey" | "navy" }) {
  const navy = tone === "navy";
  return (
    <section aria-label="Rang De's founders" className="mx-2 bg-white px-2 py-10 sm:px-4 md:py-16 lg:px-6">
      <div className={`relative mx-auto flex w-full max-w-[1200px] flex-col overflow-hidden rounded-4 ${navy ? "bg-nav-navy md:min-h-[300px] md:flex-row md:items-center xl:min-h-[330px]" : "bg-bg-grey md:min-h-[320px] md:flex-row md:items-center lg:min-h-[360px]"}`}>
        <div className={`relative z-[1] flex flex-col items-start gap-4 p-6 sm:p-8 md:py-12 md:pl-12 lg:pl-16 ${navy ? "md:w-[56%] xl:w-[62%]" : "md:w-[62%]"}`}>
          <h2 className={`${HEAD} text-[32px] md:text-[48px] [text-wrap:balance] ${navy ? "text-white-100 xl:text-[56px]" : "text-text-grey-100 lg:text-[56px]"}`}>Ram and Smita left Oxford to build Rang De.</h2>
          {navy && (
            <p className={`${SUB} max-w-[560px] text-white-64`}>
              They started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow.
            </p>
          )}
          {navy ? (
            <a href={href} className="font-display text-p3 font-medium text-white-48 transition-colors hover:text-white-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white-100">
              <span className={DOTTED}>Read more</span>
            </a>
          ) : (
            <a href={href} className="font-display text-p3 font-medium text-text-grey-64 underline decoration-from-font underline-offset-4 transition-colors hover:text-text-grey-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-grey-100">
              Read more
            </a>
          )}
        </div>
        {/* It stands on the bottom edge: under the words on phones, at the right from tablets up. */}
        {navy ? (
          <div className="relative mr-6 h-[190px] w-[230px] self-end sm:mr-10 md:absolute md:bottom-0 md:right-10 md:mr-0 md:h-[230px] md:w-[278px] lg:right-16 xl:h-[290px] xl:w-[350px]">
            <Image src="/images/founders/ram-smita-outlined.webp" alt="Ram and Smita, Rang De’s founders" fill sizes="(min-width: 1280px) 350px, (min-width: 768px) 278px, 230px" className="object-contain object-bottom" />
          </div>
        ) : (
          <div className="relative mr-6 h-[220px] w-[174px] self-end sm:mr-10 md:absolute md:bottom-0 md:right-10 md:mr-0 md:h-[290px] md:w-[229px] lg:right-16 lg:h-[330px] lg:w-[261px]">
            <Image src="/images/founders/ram-smita-cutout.webp" alt="Ram and Smita, Rang De’s founders" fill sizes="(min-width: 1024px) 261px, (min-width: 768px) 229px, 174px" className="object-contain object-bottom" />
          </div>
        )}
      </div>
    </section>
  );
}

/** The close: the line, then the Invest button under it (not inside the sentence), leading into the live opportunities. */
const INVEST_URL = "https://rangde.in/invest/individuals";
const ARROW = (
  <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** `bento` (25 Nov 2026): the close and the founders in one grid, instead of Version 1's full founders section before it.
 * Laptops: the closing line and the Invest button in the big tile on the left; on the right, Ram's and Smita's photos in
 * tiles of their own, then their line ("Ram and Smita left Oxford to build Rang De.") and the Saturday call with them.
 * Phones: the close, then the two photos side by side, then the line and the call. */
export function V4Close({ after, bento = false }: { after?: ReactNode; bento?: boolean }) {
  const heading = (
    <h2 className="font-display text-[40px] font-bold leading-[1.1] tracking-[-0.02em] md:text-[56px] lg:text-[64px]" aria-label="The businesses are ready. Now you can invest in them.">
      <ScrollInk as="span" tone="grey80" text="The businesses are ready." className="block" />
      <ScrollInk as="span" tone="grey" text="Now you can invest in them." className="block" />
    </h2>
  );
  const invest = (
    <a
      href={INVEST_URL}
      className="inline-flex h-[56px] w-fit items-center gap-2 rounded-[4px] bg-nav-navy px-8 font-display text-[18px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-dark"
    >
      Invest
      {ARROW}
    </a>
  );

  if (bento) {
    return (
      <section id="c-close" className="mx-2 rounded-[24px] px-2 py-2 md:px-3 md:py-3" style={{ backgroundColor: PAPER }}>
        {/* 25 Nov 2026: the four-column grid from laptops up; tablets as phones (the close across the top, the photos side
            by side under it), with the line and the call side by side, since four columns at 768px squeezed the close to
            eight lines and the founders' line into a narrow strip. */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
          {/* The close. */}
          <div className="col-span-2 flex flex-col justify-between gap-10 rounded-[20px] bg-white p-8 md:p-12 lg:row-span-2 lg:p-14">
            {heading}
            {invest}
          </div>
          {/* Ram and Smita, each in a tile of their own. */}
          {[
            { src: "/images/founders/ram-v3.webp", alt: "Ram, co-founder of Rang De, speaking at an event", name: "Ram" },
            { src: "/images/founders/smita-v3.webp", alt: "Smita, co-founder of Rang De, speaking at an event", name: "Smita" },
          ].map((f) => (
            <figure key={f.src} className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-[20px] bg-ink/8 md:aspect-[5/4] lg:aspect-auto lg:min-h-[260px]">
              <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 font-display text-[13px] font-bold text-ink">{f.name}, co-founder</figcaption>
            </figure>
          ))}
          {/* Their line, at the call tile's padding. */}
          <div className="col-span-2 flex flex-col justify-between gap-4 rounded-[20px] bg-white p-6 md:col-span-1 lg:p-8">
            <p className="font-display text-h5 font-bold uppercase tracking-[0.08em] text-green-dark">Why Rang De exists</p>
            <p className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.01em] text-ink lg:text-[30px]">Ram and Smita left Oxford to build Rang De.</p>
          </div>
          {/* The Saturday call. */}
          <div className="col-span-2 flex flex-col justify-between gap-5 rounded-[20px] p-6 text-white md:col-span-1 lg:p-8" style={{ backgroundColor: "#00517A" }}>
            <div className="flex flex-col gap-1">
              <p className="font-display text-[18px] font-bold leading-[1.3]">Talk to Ram and Smita</p>
              <p className="font-display text-[14px] font-medium leading-[20px] text-white/72">Live, every Saturday, 11 am IST</p>
            </div>
            {/* No sign-up link yet, as with the site's other founders' call buttons. */}
            <button type="button" className="inline-flex h-[44px] w-fit items-center rounded-[4px] bg-white px-5 font-display text-[15px] font-bold text-nav-navy transition-[filter] hover:brightness-95">
              Register
            </button>
          </div>
        </div>
        {after}
      </section>
    );
  }

  return (
    <section id="c-close" className="mx-2 flex flex-col items-center gap-8 rounded-[24px] px-4 py-20 text-center md:gap-10 md:py-28" style={{ backgroundColor: PAPER }}>
      {heading}
      {invest}
      {after}
    </section>
  );
}
