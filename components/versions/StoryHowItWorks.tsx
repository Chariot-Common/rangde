"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { STATS_SNAPSHOT as LIVE, roundedPlus } from "@/lib/stats";
import { AVATARS, COIN_FLY, GIFT_MACHINE, OFFICER, OFFICER_WALK, REKHA, REKHA_FACE, REKHA_WALK, Sprite, StatTip, type Info, type Spr } from "./CharacterHowItWorks";

/**
 * Version B's "How it works", second take (Figma 2548:14750, "Laptop 2 · Meet"), after the review
 * of the first draft (CharacterHowItWorks, kept as is on /v/idea):
 * - one plain stage instead of two drawn worlds: Rekha on the left, Arjun on the right, always in
 *   the same place, with only one or two props beside them;
 * - the line sits in the middle with any card under it, so the eye doesn't travel;
 * - whoever the line is about is full size, the other one steps back (0.75×, faded);
 * - growth framing (she wants a second machine, ₹25,000), "credit is hard to get" instead of
 *   "the bank says no", a step-by-step check that ends in an APPROVED stamp;
 * - progress as four pills (one per part of the story) that fill on scroll, no text and no skip button;
 * - after the second review (Figma 2583:5782): Arjun met at the start, the reasons a loan is hard as a
 *   sourced list, Rang De as the solution with its verification check, "invest" rather than "lend".
 */

/** Who a step is about: Rekha, Arjun, or both of them (the outcome). */
export type Side = "R" | "A" | "B";

// Each step: an id, who it's about, its line (and any subtext under it), which of the four parts of the
// story it belongs to, and how much scrolling (in screens) it takes. Arjun is met right after Rekha, then
// steps back until he finds her loan.
type StepId = "meet" | "arjun" | "need" | "credit" | "options" | "rangde" | "choose" | "invest" | "money" | "repay" | "outcome";
export const STEPS: { id: StepId; side: Side; part: number; text: string; sub?: string; w: number }[] = [
  { id: "meet", side: "R", part: 0, text: "Meet Rekha. She runs a tailoring business from home, in a village in Rajasthan.", w: 0.9 },
  { id: "arjun", side: "A", part: 0, text: "Arjun is an Indian citizen, just like you. Eager to make a change and help a fellow Indian in need.", w: 0.9 },
  { id: "need", side: "R", part: 0, text: "Rekha wants to grow her business. She needs ₹25,000 for a second machine.", w: 0.9 },
  {
    id: "credit",
    side: "R",
    part: 1,
    text: "Like 86% of India's eligible population, Rekha has no access to formal credit.",
    sub: "With no land to pledge and no credit record, a bank rarely says yes to a first-time borrower.",
    w: 1.1,
  },
  // Split out of "credit" so neither screen carries too much: the line first, then why the other ways fall short.
  { id: "options", side: "R", part: 1, text: "The other ways to borrow cost her more, or don't go far enough.", w: 1.7 },
  {
    id: "rangde",
    side: "R",
    part: 2,
    text: "Rang De offers Rekha a fair, lower-interest loan, so growing her business finally adds up.",
    sub: "A Rang De field partner identifies, visits, assesses and vets Rekha before her profile is listed.",
    w: 2,
  },
  { id: "choose", side: "A", part: 3, text: "Arjun scrolls through the businesses on Rang De and finds Rekha's.", w: 1.3 },
  { id: "invest", side: "A", part: 3, text: "Arjun invests ₹5,000. Together with others, he fully funds Rekha's goal.", w: 1.4 },
  { id: "money", side: "R", part: 3, text: "The money is transferred securely to Rekha. She buys the second machine and takes on more orders.", w: 1 },
  { id: "repay", side: "A", part: 3, text: "Every month she repays, and Arjun's money comes back with interest.", w: 1.4 },
  {
    id: "outcome",
    side: "B",
    part: 3,
    text: "Rekha's business grew. So did Arjun's money.",
    sub: "Rekha reached her goal and now has a credit history she can build on. Arjun got his money back with interest, and he can invest it again in the next Rekha.",
    w: 1.2,
  },
];
/** Each step's index by its id. */
const I = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<StepId, number>;
const STOPS = STEPS.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s.w], [0]);
const TRAVEL = STOPS[STEPS.length];
// The progress bar's four parts, each spanning its steps' scrolling.
const PARTS = Array.from({ length: 4 }, (_, p) => {
  const steps = STEPS.map((s, i) => [s, i] as const).filter(([s]) => s.part === p);
  return { from: STOPS[steps[0][1]], w: steps.reduce((sum, [s]) => sum + s.w, 0) };
});
// Screens of scrolling per unit of `w`.
const PACE = 0.6;

const PLATFORM = "Source: Rang De platform data (rangde.in/stats), as of 14 Oct 2026.";
// `box`: the number is shown on the card under the line (in a tinted box) instead of in a tooltip on it.
type StoryInfo = Info & { box?: { value: string; label: string; source: string } };
const NABARD_SHORT = "Source: NABARD, July 2026";
const PLATFORM_SHORT = "Source: Rang De platform data, Oct 2026";
export const INFO: Record<number, StoryInfo> = {
  // The step's subtext says why; the underlined figure opens just its source.
  [I.credit]: {
    phrase: "86% of India's eligible population",
    stat: "",
    source: "Source: Rang De (rangde.in), also reported by India Today, Sept 2025. Formal credit: loans from banks and other regulated lenders.",
  },
  [I.invest]: {
    phrase: "Together with others",
    stat: `${roundedPlus(LIVE.investors)} people invest on Rang De.`,
    source: PLATFORM,
    box: { value: roundedPlus(LIVE.investors), label: `people invest on Rang De, ${roundedPlus(LIVE.investorsAbroad)} of them from abroad`, source: PLATFORM_SHORT },
  },
  [I.money]: {
    phrase: "transferred securely",
    stat: `₹${LIVE.disbursedCr.toLocaleString("en-IN")} crore invested in entrepreneurs so far.`,
    source: PLATFORM,
    box: { value: `₹${LIVE.disbursedCr.toLocaleString("en-IN")} Cr`, label: "invested in entrepreneurs on Rang De so far", source: PLATFORM_SHORT },
  },
  [I.repay]: {
    phrase: "she repays",
    stat: `${LIVE.principalRepaidPct}% of the money invested has been repaid.`,
    source: `${PLATFORM} Principal repaid = 100% minus principal written off.`,
    box: { value: `${LIVE.principalRepaidPct}%`, label: "of the money invested has been repaid", source: PLATFORM_SHORT },
  },
};

// Why the other ways to borrow don't work for Rekha, listed under the credit line with a portrait each.
const FINDEX = "World Bank Global Findex, 2021";
const OPTIONS: { label: string; fact: string; source: string }[] = [
  { label: "Bank approvals are strict", fact: "Only about 12% of Indian adults borrowed from a bank or other formal lender in 2021.", source: FINDEX },
  { label: "Moneylenders charge steep interest", fact: "Informal loans in rural India average 17.77% a year.", source: NABARD_SHORT },
  { label: "Self-help groups lend in the group's name", fact: "Every member answers for every repayment, and new loans depend on the group's savings.", source: "RBI, SHG–bank linkage circular" },
  { label: "Family borrowing isn't always an option", fact: "31% of Indian adults borrowed from family or friends in 2021, but a whole village often has the same lean months.", source: FINDEX },
];

// Rang De's check before Rekha's loan is listed, short from the borrower page's verification process.
const VERIFY = [
  { icon: "apply", title: "Loan application", time: "3 weeks", line: "Found in her community, her business and credit assessed." },
  { icon: "identity", title: "Identity & documents", time: "1 day", line: "ID, address and bank account checked against government documents." },
  { icon: "review", title: "Profile review", time: "1 day", line: "Rang De's team approves her profile, then it goes live." },
];

const GOAL = 25000;
const INVESTED = 5000;
const EMI = 436; // Arjun's share of each monthly repayment, 12 months at about 8.5%

// The plain machine from the objects sheet, the same drawing as the gift one without its bow.
const MACHINE: Spr = ["objects", 123, 69, 685, 631];
// Arjun at home on his sofa (public/hiw-story/arjun-sofa.png), drawn facing right: scrolling, tapping
// to lend, cheering. A standing Arjun would be about 650 of the sheet's px tall.
const SOFA = {
  relax: ["sofa", 33, 32, 627, 592],
  tap: ["sofa", 697, 57, 628, 575],
  cheer: ["sofa", 1364, 42, 618, 582],
} satisfies Record<string, Spr>;
const SOFA_REF = 650;
// Rekha with her new machine (rekha-new-machine.png): leaning on it, then between her two machines.
// She is about 590 px tall on this sheet; `dx` is how far right of her the crop's centre is.
export const WITH_MACHINE = {
  lean: { s: ["newMachine", 234, 33, 509, 597] as Spr, dx: 124 },
  two: { s: ["newMachine", 865, 38, 1022, 592] as Spr, dx: 126 },
};
export const WITH_MACHINE_REF = 590;
// The orders piling up (rekha-orders.png): the folded stack, behind her on laptops and past her machines on
// phones, where she stands near the left edge.
const ORDERS: Spr = ["orders", 151, 236, 471, 353];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Plays 0 → 1 over `ms` each time `key` changes to a number (and stays at 1 for null, or with reduced
 * motion). Runs on time, not on scroll, so a walk finishes even if the reader stops scrolling mid-way. */
function usePlay(key: number | null, ms: number) {
  const reduce = useReducedMotion();
  const [u, setU] = useState(1);
  useEffect(() => {
    if (key === null || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      // A frame's timestamp can be a little before t0.
      const v = Math.min(1, Math.max(0, (now - t0) / ms));
      setU(v);
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, ms, reduce]);
  return key === null || reduce ? 1 : u;
}

const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const WALK_MS = 1200;
const FRAME_MS = 100;

/** A sprite standing on the bottom of its box, centred on `x` (px from the box's centre). */
function Fig({ s, k, x = 0, dim, flip }: { s: Spr; k: number; x?: number; dim?: boolean; flip?: boolean }) {
  const line = useContext(LookContext) === "line";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute bottom-0"
      style={{ left: `calc(50% + ${x}px)`, width: s[3] * k, height: s[4] * k, transform: "translateX(-50%)" }}
    >
      <Sprite s={s} k={k} line={line} style={{ left: 0, top: 0, ...(dim && { opacity: 0.3, filter: "grayscale(1)" }), ...(flip && { transform: "scaleX(-1)" }) }} />
    </motion.div>
  );
}

export function Line({ step, hideSub }: { step: number; hideSub?: boolean }) {
  const { text } = STEPS[step];
  const info = INFO[step];
  // A number shown in a box under the line gets no tooltip on it as well. Otherwise the fact (or the
  // step's own subtext) is said right under the line, and the underlined words open just its source.
  const cut = info && !info.box ? text.indexOf(info.phrase) : -1;
  const sub = STEPS[step].sub ?? (info && cut >= 0 ? info.stat : "");
  const after = info ? text.slice(cut + info.phrase.length) : "";
  const stick = after.match(/^[.,:;]/)?.[0] ?? "";
  return (
    <div aria-hidden>
      <p className="font-display text-[18px] font-bold leading-[26px] text-ink [text-wrap:balance] sm:text-[26px] sm:leading-[34px]">
        {info && cut >= 0 ? (
          <>
            {text.slice(0, cut)}
            {/* The phrase keeps the punctuation right after it on its line. */}
            <span className="whitespace-nowrap">
              <StatTip info={{ ...info, stat: "" }} />
              {stick}
            </span>
            {after.slice(stick.length)}
          </>
        ) : (
          text
        )}
      </p>
      {sub && !hideSub && <p className="mt-2 font-display text-[14px] font-medium leading-[20px] text-ink/64 [text-wrap:balance] sm:text-[17px] sm:leading-[24px]">{sub}</p>}
    </div>
  );
}

/* ── The line-art look (/v/idea-3) ─────────────────────────────────────────────────────────── */

// A third take on the same story in a Lemonade-like style: every drawing swapped for its line-art copy
// (public/hiw-story/line: one dark grey line, white and two flat greys, made from the colour sheets), a
// grey floor line under each of them, and colour only on what moves the story (Rang De blue).
type Look = "color" | "line";
const LookContext = createContext<Look>("color");
const INK_GREY = "#4A4A4A";

function Card({ children }: { children: ReactNode }) {
  return <div className="w-full rounded-[12px] bg-white p-3 text-left sm:p-4 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_8px_24px_rgba(41,45,54,0.08)]">{children}</div>;
}

/** The bank from the first draft's village, small and on its own: its shutter rolls down a moment
 * after it appears. Drawn on the bottom of its box like Fig. */
function Bank({ w, x }: { w: number; x: number }) {
  const k = w / 891;
  const line = useContext(LookContext) === "line";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute bottom-0"
      style={{ left: `calc(50% + ${x}px)`, width: w, height: 575 * k, transform: "translateX(-50%)" }}
    >
      <div className={`absolute inset-0 bg-[length:100%_100%] ${line ? "bg-[url(/hiw-story/line/bank-open.png)]" : "bg-[url(/hiw-story/bank-open.webp)]"}`} />
      <div className="absolute overflow-hidden" style={{ left: 140 * k, top: 225 * k, width: 442 * k, height: 191 * k }}>
        <motion.div
          className={`absolute inset-0 bg-[length:100%_100%] ${line ? "bg-[url(/hiw-story/line/bank-shutter.png)]" : "bg-[url(/hiw-story/bank-shutter.webp)]"}`}
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/** A slow, slight rise and fall, so whoever's standing there never looks frozen; off while walking. */
export function Breathe({ children, still, delay = 0 }: { children: ReactNode; still?: boolean; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 origin-bottom"
      animate={reduce || still ? { scaleY: 1, y: 0 } : { scaleY: [1, 1.012, 1], y: [0, -1.5, 0] }}
      transition={reduce || still ? { duration: 0.2 } : { duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Faint clouds, the first draft's, drifting slowly. Kept away from the line in the middle.
const CLOUDS = {
  desktop: [
    { n: 1, left: "6%", top: "26%", w: 150 },
    { n: 3, left: "27%", top: "11%", w: 90 },
    { n: 2, left: "75%", top: "20%", w: 190 },
  ],
  mobile: [
    { n: 2, left: "64%", top: "7%", w: 110 },
    { n: 3, left: "6%", top: "64%", w: 80 },
  ],
};

function Clouds({ mobile }: { mobile: boolean }) {
  const reduce = useReducedMotion();
  return CLOUDS[mobile ? "mobile" : "desktop"].map((c, i) => (
    <motion.div
      key={c.n}
      aria-hidden
      className="pointer-events-none absolute bg-contain bg-no-repeat opacity-35"
      style={{ left: c.left, top: c.top, width: c.w, aspectRatio: "2 / 1", backgroundImage: `url(/hiw-story/cloud-${c.n}.webp)` }}
      animate={reduce ? undefined : { x: [0, i % 2 ? -14 : 14, 0] }}
      transition={{ duration: 16 + i * 4, repeat: Infinity, ease: "easeInOut" }}
    />
  ));
}

// Arjun's phone feed (the "choose" step): businesses raising money on Rang De scroll past until Rekha's
// is in the middle; past CHOSEN of the step her row lights up.
const CHOSEN = 0.62;
const FEED_ROW = 44;
const FEED: { name: string; what: string; amount: number; tint?: string }[] = [
  { name: "Sunita", what: "Dairy · Odisha", amount: 40000, tint: "#E7F1DF" },
  { name: "Kamal", what: "Kirana store · Assam", amount: 30000, tint: "#FCE8CF" },
  { name: "Meera", what: "Papad making · Gujarat", amount: 15000, tint: "#F6E1E1" },
  { name: "Rekha", what: "Tailoring · Rajasthan", amount: GOAL },
  { name: "Lakshmi", what: "Goat rearing · Karnataka", amount: 20000, tint: "#E1ECF6" },
  { name: "Ravi", what: "Bicycle repair · Bihar", amount: 18000, tint: "#EDE6F5" },
];
const FEED_REKHA = FEED.findIndex((e) => !e.tint);

function Feed({ f }: { f: number }) {
  const line = useContext(LookContext) === "line";
  const e = easeOut(clamp01(f / 0.5));
  const chosen = f > CHOSEN;
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-eyebrow text-[11px] font-semibold uppercase tracking-[1.2px] text-ink/56">Raising now on Rang De</p>
        <span className="size-[6px] rounded-full bg-primary" />
      </div>
      {/* The window shows about three rows (two and a half on phones); the list moves up until Rekha's row is in its middle. */}
      <div className="relative mt-2 h-[var(--win)] overflow-hidden [--win:110px] sm:[--win:132px]">
        <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(calc((var(--win) / 2 - ${(FEED_REKHA + 0.5) * FEED_ROW}px) * ${e}))` }}>
          {FEED.map((row, i) => {
            const rekha = i === FEED_REKHA;
            return (
              <div
                key={row.name}
                className={`flex items-center gap-3 rounded-[8px] px-2 transition-[background-color,box-shadow] duration-300 ${rekha && chosen ? "bg-primary/8 shadow-[inset_0_0_0_2px_var(--color-primary)]" : ""}`}
                style={{ height: FEED_ROW }}
              >
                <div className="relative size-[30px] shrink-0 overflow-hidden rounded-full" style={{ background: row.tint ?? "#F1F2F5" }}>
                  {rekha ? (
                    <Sprite s={REKHA_FACE} k={30 / 135} line={line} style={{ left: 0, top: 0 }} />
                  ) : (
                    <span className="flex size-full items-center justify-center font-display text-[13px] font-bold text-ink/64">{row.name[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] font-bold leading-[18px] text-ink">{row.name}</p>
                  <p className="truncate font-display text-[12px] font-medium leading-[16px] text-ink/56">{row.what}</p>
                </div>
                <span className={`font-display text-[13px] font-bold ${rekha && chosen ? "text-primary" : "text-ink/72"}`}>{inr(row.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// A line icon beside each of OPTIONS, in its order: bank, moneylender's interest, group, family. Drawn
// on a tinted tile (red for the costly options, grey for the ones that fall short) so the list scans as
// four reasons rather than four faces.
const OPTION_ICONS: { tint: string; ink: string; path: ReactNode }[] = [
  { tint: "#FDE7E4", ink: "#C8372D", path: <path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3l9 5H3l9-5z" /> },
  { tint: "#FDE7E4", ink: "#C8372D", path: <><path d="M19 5L5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></> },
  { tint: "#EEF0F3", ink: "#292D36", path: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.2c.6-.1 1.3-.2 2-.2 2.8 0 5 2.2 5 5" /></> },
  { tint: "#EEF0F3", ink: "#292D36", path: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M12 17.5s-3-1.8-3-3.6c0-1 .8-1.7 1.7-1.7.6 0 1 .3 1.3.7.3-.4.7-.7 1.3-.7.9 0 1.7.7 1.7 1.7 0 1.8-3 3.6-3 3.6z" /></> },
];
// On phones there's no room for the subtext and the card together: the card takes the subtext's place
// from here on in the credit and Rang De steps.
const CARD_AT = 0.22;

/** Why the other ways to borrow don't work: one row each, a portrait the height of the label's line on
 * the left, divided by thin rules. The rows come in one by one as the step goes on; on phones (`one`) only
 * the latest row shows, with a dot for each. */
function Options({ f, one }: { f: number; one?: boolean }) {
  const at = Math.min(OPTIONS.length - 1, Math.floor(clamp01(f / 0.9) * OPTIONS.length));
  return (
    <div className="w-full">
      <ul className="flex w-full flex-col text-left">
        {OPTIONS.map((o, i) => {
          if (one && i !== at) return null;
          const shown = one ? 1 : clamp01((f - 0.1 - i * 0.12) / 0.1);
          const icon = OPTION_ICONS[i];
          return (
            <li
              key={o.label}
              className={`flex gap-2.5 border-ink/10 sm:gap-3 ${i && !one ? "border-t pt-2 sm:pt-4" : ""} ${i < OPTIONS.length - 1 && !one ? "pb-2 sm:pb-4" : ""}`}
              style={{ opacity: shown, transform: `translateY(${(1 - shown) * 6}px)` }}
            >
              <div className="flex size-[24px] shrink-0 items-center justify-center rounded-[6px] sm:size-[28px] sm:rounded-[8px]" style={{ backgroundColor: icon.tint }}>
                <svg viewBox="0 0 24 24" className="size-[14px] sm:size-[16px]" fill="none" stroke={icon.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {icon.path}
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display text-[13px] font-bold leading-[18px] text-ink sm:text-[15px] sm:leading-[22px]">{o.label}</p>
                <p className="font-display text-[12px] font-medium leading-[16px] text-ink/64 sm:text-[13px] sm:leading-[18px]">
                  {o.fact} <span className="whitespace-nowrap text-[10px] text-ink/40 sm:text-[11px]">{o.source}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {one && (
        <div className="mt-3 flex justify-center gap-1.5">
          {OPTIONS.map((o, i) => (
            <span key={o.label} className={`size-[6px] rounded-full transition-colors duration-300 ${i <= at ? "bg-ink/64" : "bg-ink/16"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Rang De's check before the loan is listed: an icon, the stage, how long it takes and one line each.
 * The stages light up in turn, then the APPROVED stamp comes down. */
function Verify({ f, mobile }: { f: number; mobile: boolean }) {
  const look = useContext(LookContext);
  const done = Math.floor(clamp01((f - 0.1) / 0.6) * VERIFY.length + 0.001);
  const approved = f > 0.78;
  return (
    <div className="relative w-full">
      <Card>
        <p className="font-eyebrow text-[11px] font-semibold uppercase tracking-[1.2px] text-ink/56">Rekha&rsquo;s verification</p>
        <ol className="relative mt-3 flex flex-col gap-2.5 sm:gap-3">
          {/* The thread between the icons. */}
          <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-[2px] bg-[#C9D6A6] sm:left-[13px]" />
          {VERIFY.map((v, i) => (
            <li key={v.title} className={`relative flex gap-2.5 transition-opacity duration-300 ${i < done ? "opacity-100" : "opacity-40"}`}>
              <div className="size-[24px] shrink-0 overflow-hidden rounded-[6px] bg-cover sm:size-[28px]" style={{ backgroundImage: `url(/hiw-story/verify-${v.icon}.png)` }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-[13px] font-bold leading-[18px] text-ink sm:text-[14px]">{v.title}</p>
                  <span className="rounded-[4px] bg-ink/6 px-1.5 py-px font-eyebrow text-[9px] font-semibold uppercase tracking-[0.8px] text-ink/56">{v.time}</span>
                </div>
                {!mobile && <p className="font-display text-[12px] font-medium leading-[16px] text-ink/56">{v.line}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>
      <AnimatePresence>
        {approved && (
          <motion.div
            initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className={`absolute -bottom-4 -right-3 rounded-[6px] border-[3px] bg-white/80 px-2.5 py-1 font-display text-[18px] font-extrabold uppercase tracking-[2px] ${look === "line" ? "border-primary text-primary" : "border-green-dark text-green-dark"}`}
          >
            Approved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A number shown directly, in a tinted box: the value, what it means and where it's from. */
function Stat({ step, first }: { step: number; first?: boolean }) {
  const box = INFO[step]?.box;
  if (!box) return null;
  return (
    <div className={`flex items-center gap-3 rounded-[8px] bg-primary/8 px-3 py-2 text-left ${first ? "" : "mt-3"}`}>
      <p className="shrink-0 font-display text-[20px] font-bold leading-[26px] text-ink">{box.value}</p>
      <div className="min-w-0">
        <p className="font-display text-[12px] font-semibold leading-[16px] text-ink/72">{box.label}</p>
        <p className="font-display text-[10px] font-medium leading-[14px] text-ink/48">{box.source}</p>
      </div>
    </div>
  );
}

/** The card under the line, if the step has one. `f` is how far through the step the reader is. */
function StepCard({ step, f, mobile }: { step: number; f: number; mobile: boolean }) {
  const look = useContext(LookContext);
  if (step === I.options) return <Options f={f} one={mobile} />;
  if (step === I.rangde) return mobile && f < CARD_AT ? null : <Verify f={mobile ? (f - CARD_AT) / (1 - CARD_AT) : f} mobile={mobile} />;
  if (step === I.choose) return <Feed f={f} />;
  if (step === I.invest) {
    const raised = clamp01(f / 0.85) * GOAL;
    const arjunIn = f > 0.12;
    const full = raised >= GOAL;
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="relative size-[40px] shrink-0 overflow-hidden rounded-full bg-bg-grey">
            <Sprite s={REKHA_FACE} k={40 / 135} line={look === "line"} style={{ left: 0, top: 0 }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold leading-[20px] text-ink">Rekha · Tailoring</p>
            <p className="font-display text-[13px] font-medium leading-[18px] text-ink/56">Rajasthan · 12 months</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 font-display text-[12px] font-bold ${full ? "bg-green-dark/12 text-green-dark" : "bg-primary/12 text-ink"}`}>{full ? "Funded" : "Live"}</span>
        </div>
        <div className="mt-4 flex items-baseline justify-between font-display text-[13px] font-medium text-ink/56">
          <span>
            <span className="text-[15px] font-bold text-ink">{inr(raised)}</span> raised
          </span>
          <span>of {inr(GOAL)}</span>
        </div>
        <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-ink/8">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(raised / GOAL) * 100}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`font-display text-[13px] font-bold transition-colors ${arjunIn ? "text-ink" : "text-ink/40"}`}>Arjun · {inr(INVESTED)}</span>
          <div className="flex -space-x-2">
            {AVATARS.slice(0, Math.max(0, Math.min(AVATARS.length, Math.round((raised / GOAL) * AVATARS.length)))).map((a, i) => (
              <div key={i} className="relative size-[24px] overflow-hidden rounded-full border-2 border-white bg-bg-grey">
                <Sprite s={a} k={22 / Math.max(a[3], a[4])} style={{ left: 0, top: 0, filter: look === "line" ? "grayscale(1)" : undefined }} />
              </div>
            ))}
          </div>
        </div>
        <Stat step={step} />
      </Card>
    );
  }
  if (step === I.money)
    return (
      <Card>
        <Stat step={step} first />
      </Card>
    );
  if (step === I.repay) {
    const months = Math.min(12, Math.floor(clamp01(f / 0.85) * 12 + 0.001));
    return (
      <Card>
        <div className="flex items-baseline justify-between font-display">
          <p className="text-[15px] font-bold text-ink">Back to Arjun</p>
          <p className="text-[13px] font-medium text-ink/56">Month {Math.max(1, months)} of 12</p>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={`h-[6px] rounded-full transition-colors duration-300 ${i < months ? "bg-primary" : "bg-ink/8"}`} />
          ))}
        </div>
        <p className="mt-3 font-display text-[22px] font-bold text-ink">
          {inr(months * EMI)} <span className="text-[13px] font-medium text-ink/56">of {inr(12 * EMI)}</span>
        </p>
        <Stat step={step} />
      </Card>
    );
  }
  if (step === I.outcome)
    return (
      <div className="flex flex-col items-center gap-4">
        <a
          href="#opportunities"
          className="pointer-events-auto inline-flex items-center justify-center rounded-[4px] bg-primary px-8 py-3.5 font-display text-p2 font-bold text-white transition-[filter] hover:brightness-95"
        >
          Meet businesses in need
        </a>
      </div>
    );
  return null;
}

type Pt = { x: number; y: number };
const coinEase = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Money moving between them, as in the first draft: a stream of coins along a curve from one to the
 * other, each turned to face its path (the art has speed lines trailing behind). `t` runs 0 → 1 over
 * the whole flight; each coin takes half of it, `gap` after the one before. `bend` is the curve's
 * control point; `label` rides just ahead of the stream. */
function Coins({ t, from, to, bend, count, gap, size, label }: { t: number; from: Pt; to: Pt; bend: Pt; count: number; gap: number; size: number; label?: string }) {
  if (t <= 0 || t >= 1) return null;
  const at = (e: number) => ({
    x: (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * bend.x + e * e * to.x,
    y: (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * bend.y + e * e * to.y,
  });
  const lead = at(coinEase(clamp01(t / 0.55)));
  const o = Math.min(clamp01(t / 0.08), clamp01((0.95 - t) / 0.12));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
      {Array.from({ length: count }, (_, i) => {
        const q = clamp01((t - i * gap) / 0.5);
        if (q <= 0 || q >= 1) return null;
        const e = coinEase(q);
        const pt = at(e);
        const dx = 2 * (1 - e) * (bend.x - from.x) + 2 * e * (to.x - bend.x);
        const dy = 2 * (1 - e) * (bend.y - from.y) + 2 * e * (to.y - bend.y);
        const art = COIN_FLY[(i + Math.floor(q * 6)) % 2];
        const k = (size * 1.7) / art[3];
        return <Sprite key={i} s={art} k={k} style={{ left: pt.x - (art[3] * k) / 2, top: pt.y - (art[4] * k) / 2, transform: `rotate(${Math.atan2(dy, dx)}rad)` }} />;
      })}
      {label && (
        <p
          className="absolute -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-full bg-green-dark px-3 py-1 font-display text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(41,45,54,0.2)] sm:text-[14px]"
          style={{ left: lead.x, top: lead.y, opacity: o }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

/** Rekha and Arjun with everything around them, step by step: Rekha's poses and props (walking in place
 * to the bank and to her new machine, the field partner walking in), Arjun on his sofa. The one the line
 * is about is full size, the other steps back. Shared by StoryHowItWorks and ScrollTextHowItWorks. */
export function Cast({
  step,
  f,
  H,
  mobile,
  rekha,
  arjun,
  orders = true,
}: {
  step: number;
  f: number;
  H: number;
  mobile: boolean;
  rekha: { x: number; ground: number };
  arjun: { x: number; ground: number };
  /** Whether the orders stack shows (off where there's no room beside her). */
  orders?: boolean;
}) {
  const line = useContext(LookContext) === "line";
  const active = STEPS[step].side;
  const rekhaX = rekha.x;
  const arjunX = arjun.x;
  const groundR = rekha.ground;
  const groundA = arjun.ground;
  const rk = (0.95 * H) / 403;
  const mk = (0.62 * H) / 631;
  // Rekha never leaves her spot: when the story moves her on (to the bank, to her new machine) she
  // walks in place and the thing she's walking to slides in towards her. The field partner walks in
  // the same way, from the middle.
  const walkU = usePlay(step === I.credit || step === I.money ? step : null, WALK_MS);
  const partnerU = usePlay(step === I.rangde ? step : null, WALK_MS);
  const walking = walkU < 1;
  const frame = (u: number) => Math.floor((u * WALK_MS) / FRAME_MS) % 6;
  const rekhaPose: Spr = walking ? REKHA_WALK[frame(walkU)] : step === I.credit || step === I.options ? REKHA.sad : step === I.rangde ? REKHA.proud : REKHA.sew;
  // Once the new machine has arrived she leans on it, and from then on she has two.
  const withMachine = step === I.money && !walking ? WITH_MACHINE.lean : step > I.money ? WITH_MACHINE.two : null;
  const wk = (0.95 * H) / WITH_MACHINE_REF;
  const arrive = (u: number) => (1 - easeOut(u)) * 1.3 * H;
  // Arjun is there from the start, stepped back until his part (finding Rekha's loan). He stays on his
  // sofa, facing the middle: scrolling, tapping when he finds Rekha and when he lends, cheering when it's
  // funded and at the end.
  const arjunPose: Spr = step === I.outcome || (step === I.invest && f > 0.9) ? SOFA.cheer : step === I.invest || (step === I.choose && f > CHOSEN) ? SOFA.tap : SOFA.relax;
  // Rekha's props stand on her inner side, towards the middle.
  const propX = (mobile ? 0.62 : 0.78) * H;

  const person = (side: Side): CSSProperties => {
    const on = side === active || active === "B";
    return {
      left: side === "R" ? rekhaX : arjunX,
      top: side === "R" ? groundR : groundA,
      width: H * 1.2,
      height: H,
      transform: `translate(-50%, -100%) scale(${on ? 1 : 0.75})`,
      opacity: on ? 1 : 0.4,
      filter: line || on ? "none" : "grayscale(0.7)",
    };
  };

  return (
    <>
      {/* Rekha, with her one or two props. */}
      <div aria-hidden className="absolute origin-bottom transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none" style={person("R")}>
        <Breathe still={walking}>
          <AnimatePresence initial={false}>
            {step === I.need && <Fig key="want" s={MACHINE} k={mk} x={propX} dim />}
            {step === I.money && walking && <Fig key="new" s={GIFT_MACHINE} k={mk} x={propX + arrive(walkU)} />}
            {orders && step === I.money && <Fig key="orders" s={ORDERS} k={(0.3 * H) / 353} x={(mobile ? 1.18 : -0.5) * H} />}
            {/* On laptops the bank stands behind her, out of the way of the list in the middle. */}
            {(step === I.credit || step === I.options) && <Bank key="bank" w={0.75 * H} x={mobile ? propX * 1.05 + arrive(walkU) : -0.45 * H} />}
            {step === I.rangde && (
              <Fig
                key={partnerU < 1 ? "partner-walk" : f > 0.78 ? "partner-thumbs" : "partner"}
                s={partnerU < 1 ? OFFICER_WALK[frame(partnerU)] : f > 0.78 ? OFFICER.thumbs : OFFICER.write}
                k={H / 456}
                x={propX * 0.95 + arrive(partnerU) * 1.2}
                flip={partnerU < 1}
              />
            )}
            {withMachine ? <Fig key={withMachine.s.join()} s={withMachine.s} k={wk} x={withMachine.dx * wk} /> : <Fig key={walking ? "rekha-walk" : rekhaPose.join()} s={rekhaPose} k={rk} />}
          </AnimatePresence>
        </Breathe>
        {step === I.need && (
          <div
            className="absolute rounded-full bg-white px-2.5 py-1 font-display text-[13px] font-bold text-ink shadow-[0_2px_8px_rgba(41,45,54,0.12)]"
            style={{ left: `calc(50% + ${propX}px)`, bottom: 0.66 * H, transform: "translateX(-50%)" }}
          >
            ₹25,000
          </div>
        )}
      </div>

      {/* Arjun, breathing like Rekha. */}
      <div aria-hidden className="absolute origin-bottom transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none" style={person("A")}>
        <Breathe delay={1.1}>
          <AnimatePresence initial={false}>
            <Fig key={arjunPose.join()} s={arjunPose} k={H / SOFA_REF} flip />
          </AnimatePresence>
        </Breathe>
      </div>

      {/* Fetch every drawing the story uses up front, so a pose never pops in mid-scroll. */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 opacity-0">
        {[REKHA.sad, SOFA.relax, WITH_MACHINE.lean.s, ORDERS, OFFICER.write, GIFT_MACHINE, AVATARS[0]].map((s) => (
          <Sprite key={s.join()} s={s} k={0.05} line={line} />
        ))}
        <div className={`size-2 ${line ? "bg-[url(/hiw-story/line/bank-open.png)]" : "bg-[url(/hiw-story/bank-open.webp)]"}`} />
        <div className={`size-2 ${line ? "bg-[url(/hiw-story/line/bank-shutter.png)]" : "bg-[url(/hiw-story/bank-shutter.webp)]"}`} />
      </div>
    </>
  );
}

export function StoryHowItWorks({ look = "color" }: { look?: Look }) {
  const line = look === "line";
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [size, setSize] = useState({ w: 1200, h: 700 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setSize({ w: stage.clientWidth, h: stage.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // The page's scroll through the tall section drives the story; the stage stays pinned under the navbar.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      const travel = section.offsetHeight - (window.innerHeight - nav);
      setT(clamp01((nav - rect.top) / Math.max(1, travel)) * TRAVEL);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  let step = 0;
  while (step < STEPS.length - 1 && t >= STOPS[step + 1]) step++;
  const f = clamp01((t - STOPS[step]) / STEPS[step].w);

  const mobile = size.w < 768;
  // H: a full-size person, standing on `ground`. On laptops the two stand well apart, the line between
  // them; on phones Rekha is at the top, Arjun at the bottom (above the floating "Invest now" button,
  // which covers the bottom ~90px) and the line in the middle.
  const H = mobile ? Math.min(size.h * 0.21, size.w * 0.42) : Math.max(180, Math.min(size.h * 0.4, size.w * 0.2, 320));
  const groundR = mobile ? 44 + H : size.h * 0.84;
  const groundA = mobile ? size.h - 100 : size.h * 0.84;
  const rekhaX = size.w * (mobile ? 0.3 : 0.17);
  const arjunX = size.w * (mobile ? 0.5 : 0.83);
  // The line's box: the whole stage's middle on laptops, the gap between the two on phones.
  const lineTop = mobile ? groundR + 12 : 48;
  // (When Arjun has stepped back he takes up less of the bottom, so the line can use that too.)
  const arjunTop = groundA - (STEPS[step].side === "R" ? 0.75 : 1) * H;
  const lineBottom = mobile ? arjunTop - 10 : size.h - 48;

  return (
    <LookContext.Provider value={look}>
      <div id="how-it-works" className={`relative mx-2 overflow-clip rounded-[16px] ${line ? "bg-[#FAFAFA]" : "bg-gradient-to-b from-white to-bg-grey"}`}>
        <div className="flex flex-col items-center gap-2 px-4 pb-2 pt-12 text-center sm:px-8 sm:pt-16 lg:pt-[80px]">
          <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">How Rang De works</h2>
        </div>
        <section ref={sectionRef} aria-label="How Rang De works, told as a story" className="relative" style={{ height: `calc(${TRAVEL * PACE + 1} * (100svh - var(--navbar-bottom, 0px)))` }}>
          {/* The stage only shows one line at a time, so the story is also here, in order. */}
          <div className="sr-only">
            <ol>
              {STEPS.map((s, i) => (
                <li key={s.text}>
                  {s.text}
                  {s.sub && ` ${s.sub}`}
                  {INFO[i] && ` ${INFO[i].stat} ${INFO[i].source}`}
                  {i === I.options && ` ${OPTIONS.map((o) => `${o.label}: ${o.fact} (${o.source})`).join(" ")}`}
                  {i === I.rangde && ` ${VERIFY.map((v) => `${v.title}, ${v.time}: ${v.line}`).join(" ")}`}
                </li>
              ))}
            </ol>
            <a href="#opportunities">Meet businesses in need</a>
          </div>
          <div ref={stageRef} className="sticky w-full overflow-hidden" style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100dvh - var(--navbar-bottom, 0px))", minHeight: 520 }}>
            <Clouds mobile={mobile} />

            {/* The line look's floor: a pale band under Arjun's ground, and a grey ground line under each
                of them that stops short of the middle, like a scene at each edge. */}
            {line && (
              <>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#F3F3F3]" style={{ top: groundA }} />
                {[
                  { g: groundR, from: mobile ? Math.max(0, rekhaX - 0.9 * H) : 0, to: rekhaX + (mobile ? 1.45 : 1.15) * H },
                  { g: groundA, from: mobile ? arjunX - 1.1 * H : arjunX - 0.9 * H, to: mobile ? arjunX + 1.1 * H : size.w },
                ].map(({ g, from, to }, i) => (
                  <div key={i} aria-hidden className="pointer-events-none absolute h-[2px] rounded-full" style={{ top: g - 1, left: from, width: to - from, background: INK_GREY }} />
                ))}
              </>
            )}

            {/* Progress: one pill for each of the story's four parts, filling as the reader scrolls through it. */}
            <div aria-hidden className="absolute left-1/2 top-4 flex w-[min(560px,calc(100%-32px))] -translate-x-1/2 gap-1.5 sm:top-6">
              {PARTS.map((p, i) => (
                <div key={i} className="h-[4px] flex-1 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-ink/72" style={{ width: `${clamp01((t - p.from) / p.w) * 100}%` }} />
                </div>
              ))}
            </div>

            {/* The line, with its card under it, in the middle. */}
            <div
              className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center justify-center gap-3 text-center sm:gap-5"
              style={{ top: lineTop, height: lineBottom - lineTop, width: mobile ? size.w - 32 : Math.min(500, size.w * 0.38) }}
            >
              {/* The new line and card replace the old ones at once and fade in. (Waiting for the old ones to
                  fade out first could leave a stale line on screen when the reader scrolls quickly.) */}
              <motion.div key={`line-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="pointer-events-auto">
                <Line step={step} hideSub={mobile && step === I.rangde && f >= CARD_AT} />
              </motion.div>
              <motion.div
                key={`card-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`w-full ${step === I.options ? "max-w-[400px]" : "max-w-[320px]"}`}
              >
                <StepCard step={step} f={f} mobile={mobile} />
              </motion.div>
            </div>

            <Cast step={step} f={f} H={H} mobile={mobile} rekha={{ x: rekhaX, ground: groundR }} arjun={{ x: arjunX, ground: groundA }} />

            {/* The money moving: the loan from Arjun to Rekha, then her repayments back, a coin a month.
                On laptops the coins dip under the line in the middle; on phones (Rekha above, Arjun
                below) they swing out to the left. */}
            {(() => {
              const arjunHand = { x: arjunX - (mobile ? 0.1 : 0.15) * H, y: groundA - 0.6 * H };
              const rekhaAt = { x: rekhaX + 0.45 * H, y: groundR - 0.4 * H };
              const bend = mobile ? { x: -size.w * 0.32, y: (rekhaAt.y + arjunHand.y) / 2 } : { x: size.w / 2, y: Math.min(size.h - 20, groundA + 0.1 * size.h) };
              const coin = mobile ? 30 : 44;
              if (step === I.money) return <Coins t={f / 0.75} from={arjunHand} to={rekhaAt} bend={bend} count={7} gap={0.07} size={coin} label={`${inr(GOAL)} → Rekha`} />;
              if (step === I.repay) return <Coins t={f / 0.95} from={rekhaAt} to={arjunHand} bend={bend} count={12} gap={0.042} size={coin} />;
              return null;
            })()}

            <p aria-hidden className={`absolute bottom-4 right-5 font-display text-[13px] font-medium text-ink/48 transition-opacity duration-300 ${t < 0.3 ? "opacity-100" : "opacity-0"}`}>
              Scroll ↓
            </p>
          </div>
        </section>
      </div>
    </LookContext.Provider>
  );
}
