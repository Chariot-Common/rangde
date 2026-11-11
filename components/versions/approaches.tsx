"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { setNavIntro } from "@/lib/nav-intro";
import { motion, useInView, useReducedMotion } from "motion/react";
import { HeroStats, StatNumber } from "@/components/sections/hero/HeroStats";
import { heroStatsFrom } from "@/lib/content";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { HowItWorksStage } from "@/components/how-it-works/HowItWorksStage";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";
import { JourneyStage, type JourneyScene } from "@/components/how-it-works/journey/JourneyStage";
import { ScrollFill } from "@/components/ui/ScrollFill";
import { WordReveal } from "@/components/ui/WordReveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePageReady } from "@/lib/use-page-ready";
import { BODY_DURATION, BODY_STAGGER, TITLE_DURATION, TITLE_STAGGER, heroSequence } from "@/lib/hero-sequence";
import { SourceTip } from "@/components/ui/SourceTip";
import { FAQS_URL } from "@/data/faqs";
import { STATS_SNAPSHOT as LIVE, type RangDeStats } from "@/lib/stats";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import { recentStories, testimonialsRow1, testimonialsRow2, type Story, type Testimonial } from "@/lib/content";
import { Icon } from "@/components/ui";
import { ScrollInk } from "./ScrollInk";
import { ScrollType } from "./ScrollType";
import { Eyebrow } from "./ui";

// Sections for the three homepage approaches in Figma "Rang De Master Design III", node 2743:14706:
// Home - v1.1 (app/v/v1), Home - v1.2 (app/v/v1-2) and Home - v3 (app/v/v3). They reuse the site's
// tokens and existing pieces (story cards, stats, calculator, How it works stage, FAQ scenes).
// The Figma frames are wireframes in places (grey circles, grey boxes); where the site already has
// a matching asset it is used, otherwise the placeholder stays a placeholder rather than an invented one.

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

/**
 * Hero (Figma 2687:14490 / 2719:50492): headline, a line under it, the live stats, then the recent
 * stories strip. Same entrance as the live homepage (HeroIntro): once the page loader has gone the
 * headline fills in word by word (pale → full), the line under it appears word by word, then the
 * stats count up and the stories slide in. v1.x lead with "Invest in the other Startup India" in
 * green; v3 is one larger ink line with no sub-copy.
 */
/**
 * Phones, Version 1.1 (Figma "Home - v1.1" mobile, node 2921:4511): under the RBI seal a chevron invites a scroll. The
 * first time the page is scrolled the chevron drifts down and fades out while the proof numbers open up in its
 * place (two columns, a rule between the rows), pushing the stories down. They then stay, once, for good.
 */
function PhoneStats() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const stats = heroStatsFrom(useRangDeStats());
  useEffect(() => {
    if (open) return;
    const check = () => window.scrollY > 24 && setOpen(true);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [open]);
  // Figma's order: businesses funded over investors on the left, loans disbursed over principal repaid on the right.
  const num = (label: string) => stats.find((s) => s.label === label);
  const FIG_LABEL: Record<string, string> = { "Entrepreneurs funded": "Businesses funded" };
  const FIG_FORMAT: Record<string, (n: number) => string> = { "Loans disbursed": (n) => `${Math.floor(n)}+ Cr` };
  const cols = [["Entrepreneurs funded", "Investors aboard"], ["Loans disbursed", "Principal repaid"]];
  const dur = reduce ? 0 : 0.7;
  return (
    <motion.div className="relative sm:hidden" initial={false} animate={{ height: open ? "auto" : 32 }} transition={{ duration: dur, ease: EASE }} style={{ overflow: "hidden" }}>
      <motion.div aria-hidden className="absolute inset-x-0 top-2 flex justify-center" initial={false} animate={open ? { y: 24, opacity: 0 } : { y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}>
        <Icon name="chevron-down" size={24} className="opacity-40 brightness-0" />
      </motion.div>
      <motion.div className="grid grid-cols-2 gap-6 px-0 pb-4 pt-8" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.6, delay: open && !reduce ? 0.2 : 0, ease: EASE }} aria-hidden={!open}>
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-6">
            {col.map((label, ri) => {
              const s = num(label);
              if (!s || s.kind !== "number") return null;
              return (
                <Fragment key={label}>
                  {ri > 0 && <hr className="w-full border-0 border-t border-ink/8" />}
                  <div className="flex flex-col items-center gap-1">
                    <StatNumber target={s.target} format={FIG_FORMAT[label] ?? s.format} index={ci * 2 + ri} inView={open} className="whitespace-nowrap font-display text-h3 font-bold text-text-grey-80" />
                    <p className="font-display text-[10px] font-semibold uppercase leading-[15px] tracking-[1.2px] text-text-grey-64">{FIG_LABEL[label] ?? label}</p>
                  </div>
                </Fragment>
              );
            })}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/** `mobileLead` (Version 1.1): on phones, this replaces `lead` (two short paragraphs split by a rule), the stats shrink to
 * the RBI seal with a chevron under it, and the headline is a little larger (Figma "Home - v1.1" mobile). */
/** `compact` (Version 4): the headline one size smaller, so the visual under it carries more of the hero.
 * `bigTitle` (Version 2): the ink headline at Version 1's size (H1, 56/64 from tablets up) in a wider block, for a title
 * with its own line break. */
export function ApproachHero({ title, lead = "", mobileLead, tone = "green", wide = false, glow = true, compact = false, bigTitle = false, eyebrow, actions, strip, below }: { title: string; lead?: string; mobileLead?: ReactNode; tone?: "green" | "ink"; wide?: boolean; glow?: boolean; compact?: boolean; bigTitle?: boolean; eyebrow?: string; actions?: ReactNode; strip?: ReactNode; below?: ReactNode }) {
  const ready = usePageReady();
  const reduce = useReducedMotion();
  const seq = heroSequence(title, lead);
  // Phones (Version 1.1): the short lead fades in as one block as soon as the headline is done, and the RBI seal follows right on it.
  const phone = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(max-width: 639px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
  const afterBody = mobileLead && phone ? seq.body + 0.5 : lead ? seq.stats : seq.body + 0.1;
  const [statsStart, setStatsStart] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setStatsStart(true), reduce ? 0 : afterBody * 1000);
    return () => clearTimeout(id);
  }, [ready, reduce, afterBody]);
  // Version 1.1: the nav stays hidden until the stories are in, then fades in with a shine on its buttons.
  useEffect(() => {
    if (!mobileLead) return;
    setNavIntro("hidden");
    let id: ReturnType<typeof setTimeout> | undefined;
    if (ready) id = setTimeout(() => setNavIntro("reveal"), reduce ? 0 : (afterBody + 0.8) * 1000);
    return () => {
      clearTimeout(id);
      setNavIntro("idle");
    };
  }, [mobileLead, ready, reduce, afterBody]);
  const after = (extra = 0) =>
    reduce
      ? { initial: false as const }
      : { initial: { opacity: 0, y: 16 }, animate: ready ? { opacity: 1, y: 0 } : undefined, transition: { duration: 0.6, delay: afterBody + extra, ease: EASE } };

  return (
    <div className={`relative isolate flex w-full flex-col items-center overflow-hidden px-4 sm:px-2 ${compact ? "gap-8 pt-10 sm:gap-10 sm:pt-8 md:pt-10 lg:gap-12 lg:pt-[40px]" : `pt-[100px] sm:pt-12 md:pt-16 lg:gap-16 lg:pt-[64px] ${mobileLead ? "gap-8 sm:gap-12" : "gap-12"}`}`}>
      {glow && (
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[33px] -z-10 h-[1040px] w-[1040px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_250px_rgba(254,199,0,0.64)] sm:top-[-95px] sm:h-[650px] sm:w-[650px] md:top-[-125px] md:h-[850px] md:w-[850px] lg:top-[-174px] lg:h-[1250px] lg:w-[1250px]"
      />
      )}
      <div className={`flex w-full flex-col items-center gap-2 text-center ${bigTitle ? "max-w-[1040px]" : wide ? "max-w-[930px]" : "max-w-[920px]"}`}>
        {eyebrow &&
          (bigTitle ? (
            // Version 2: the design system's H5 in Inter (not the Parkinsans eyebrow), phones and laptops alike.
            <p className="mb-2 font-display text-h5 font-bold uppercase tracking-[0.88px] text-green-dark">{eyebrow}</p>
          ) : (
            <Eyebrow className="mb-2 text-green-dark">{eyebrow}</Eyebrow>
          ))}
        <WordReveal
          as="h1"
          text={title}
          from={tone === "ink" ? 0.24 : 0.48}
          stagger={TITLE_STAGGER}
          duration={TITLE_DURATION}
          play={ready}
          className={
            tone === "ink"
              ? `font-display ${bigTitle ? `text-h1 md:leading-[64px] ${mobileLead ? "max-sm:text-[38px] max-sm:leading-[44px] max-sm:tracking-[-0.76px] sm:leading-[38px]" : "leading-[38px]"}` : compact ? "text-h3" : "text-h2"} font-bold text-ink [text-wrap:balance]`
              : `font-display text-h1 font-bold text-green-dark [text-wrap:balance] md:leading-[64px] ${mobileLead ? "max-sm:text-[38px] max-sm:leading-[44px] max-sm:tracking-[-0.76px] sm:leading-[38px]" : "leading-[38px]"}`
          }
        />
        {mobileLead && (
          <motion.div
            className="flex w-full flex-col items-center gap-4 px-8 pt-4 sm:hidden"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: seq.body, ease: EASE }}
          >
            {mobileLead}
          </motion.div>
        )}
        {lead && (
          <WordReveal
            text={lead}
            stagger={BODY_STAGGER}
            duration={BODY_DURATION}
            delay={seq.body}
            play={ready}
            className={`${mobileLead ? "max-sm:hidden " : ""}w-full max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] ${wide ? "sm:max-w-[930px]" : "sm:max-w-[820px]"}`}
          />
        )}
      </div>
      {actions && (
        <motion.div className="-mt-4 flex flex-wrap items-center justify-center gap-3 lg:-mt-8" {...after(-0.1)}>
          {actions}
        </motion.div>
      )}
      <motion.div className="w-full max-w-[1200px]" {...after()}>
        <HeroStats start={statsStart} sealOnlyMobile={!!mobileLead} />
        {mobileLead && <PhoneStats />}
      </motion.div>
      {/* `strip={false}`: no strip (Version 4 meets the people further down instead). */}
      {strip !== false && (
        <motion.div className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]" {...after(0.2)}>
          {strip ?? <StoryCarousel items={recentStories} layout="recent" />}
        </motion.div>
      )}
      {below && <motion.div className="w-full" {...after(0.4)}>{below}</motion.div>}
    </div>
  );
}

// Press, awards and backers from rangde.in/media-awards (Nov 2026). rangde.in lists them as text, so
// the logos are the publications' own, from Wikimedia Commons (public/images/press). YourStory
// has no logo there yet: it's set as a wordmark until its file is added.
const PRESS: { name: string; logo?: string; h?: number; note?: string }[] = [
  { name: "India Today", logo: "/images/press/india-today.png", h: 30 },
  { name: "Forbes", logo: "/images/press/forbes.svg", h: 24 },
  { name: "The Economic Times", logo: "/images/press/economic-times.svg", h: 26 },
  { name: "Mint", logo: "/images/press/mint.svg", h: 26 },
  { name: "CNBC-TV18", logo: "/images/press/cnbc-tv18.svg", h: 26 },
  { name: "YourStory" },
  { name: "The Better India", logo: "/images/press/the-better-india.svg", h: 42 },
  { name: "Ashoka", logo: "/images/press/ashoka.svg", h: 44 },
  { name: "World Bank · Development Marketplace Award", logo: "/images/press/world-bank.svg", h: 30 },
  { name: "Google for Startups Accelerator", logo: "/images/press/google-for-startups.svg", h: 26 },
];

function PressItem({ p, scale = 1 }: { p: (typeof PRESS)[number]; scale?: number }) {
  return (
    <li className="flex shrink-0 items-center px-6 opacity-72 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0 sm:px-10">
      {p.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- third-party logo files, shown at their own aspect ratio
        <img src={p.logo} alt={p.name} style={{ height: p.h !== undefined ? p.h * scale : undefined, maxWidth: 200 * scale }} className="w-auto object-contain" />
      ) : (
        <span className="flex flex-col items-center text-ink">
          <span className="font-display font-extrabold leading-none tracking-[-0.4px]" style={{ fontSize: 20 * scale }}>
            {p.name}
          </span>
          {p.note && (
            <span className="mt-1 font-display font-bold uppercase tracking-[0.88px]" style={{ fontSize: 10 * scale }}>
              {p.note}
            </span>
          )}
        </span>
      )}
    </li>
  );
}

/** v3: press, awards and backers as social proof (Figma 2719:51429), moving as one slow strip — the
 * opposite way to the people strip above it — that
 * pauses on hover. Logos sit in grey and take their colour on hover. */
/** `big` (Version 6): the logos about 20% bigger. */
export function PressRow({ big = false }: { big?: boolean } = {}) {
  return (
    <div className="flex w-full flex-col items-center gap-6 border-b border-ink/8 pb-12">
      <Eyebrow className="text-ink/56">In the news, recognised and backed by</Eyebrow>
      <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex w-max animate-[marquee-reverse_45s_linear_infinite] items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...PRESS, ...PRESS].map((p, i) => (
            <PressItem key={i} p={p} scale={big ? 1.2 : 1} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── v3: the people, not the numbers ───────────────────────── */

// Live listings on rangde.in/invest/individuals (Oct 2026), the same people as the How it works v3
// prototype: name, what the business is, state and photo as published (rangde.imgix.net/bImg, cropped
// to the face).
const PEOPLE: { name: string; trade: string; state: string; img: string }[] = [
  { name: "Durga Chouhan", trade: "Tent & decoration business", state: "Madhya Pradesh", img: "durgamanawar01-img.jpg" },
  { name: "Rekha Bai", trade: "Grocery store", state: "Rajasthan", img: "Rekha-42-img.jpg" },
  { name: "Khandu Ganga Chavhan", trade: "Poultry farm", state: "Maharashtra", img: "51603-017-633-01-5111-img.jpg" },
  { name: "Monika Bhatodra", trade: "Cosmetics store", state: "Madhya Pradesh", img: "manawrmonika037-img.jpg" },
  { name: "Manoj Kumar Mandal", trade: "Professional services", state: "Assam", img: "10020497-img.jpg" },
  { name: "Vijay Muwel", trade: "General store", state: "Madhya Pradesh", img: "Vijay-004-img.jpg" },
  { name: "Nitin Vishvnath Jadhav", trade: "Repair business", state: "Maharashtra", img: "nitin-jadhav-img.jpg" },
  { name: "Dnyaneshwar Nandu Mahale", trade: "Clothing store", state: "Maharashtra", img: "dnyaneshwar-mahale--img.jpg" },
  { name: "Jagdish Kashinath Sahare", trade: "Repair garage", state: "Maharashtra", img: "Jagdish-sahare--img.jpg" },
];
const portrait = (f: string) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=520&h=680&fit=crop&crop=faces`;

/**
 * v3's hero strip in place of the green story cards (which the "stories from both sides" section
 * repeats further down): just the people — a tall portrait each, with their name, what they run and
 * where — moving slowly, no figures. Pauses on hover.
 */
export function PeopleStrip() {
  return (
    <div className="group relative w-full overflow-hidden">
      <ul className="flex w-max animate-[marquee_70s_linear_infinite] gap-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...PEOPLE, ...PEOPLE].map((p, i) => (
          <li key={i} aria-hidden={i >= PEOPLE.length || undefined} className="relative h-[260px] w-[195px] shrink-0 overflow-hidden rounded-[12px] bg-ink/8 sm:h-[320px] sm:w-[240px] lg:h-[380px] lg:w-[290px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- rangde.imgix.net does the face crop */}
            <img src={portrait(p.img)} alt="" loading={i < 6 ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01] hover:!scale-[1.04]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 from-50% to-black/72" />
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-0.5 text-white">
              <p className="font-display text-p2 font-bold leading-[22px]">{p.name}</p>
              <p className="font-display text-p3 font-medium text-white/80">{p.trade}</p>
              <p className="mt-1 flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-[0.88px] text-[#9fd96a]">
                <svg viewBox="0 0 24 24" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.4" />
                </svg>
                {p.state}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="sr-only">{PEOPLE.map((p) => `${p.name}, ${p.trade}, ${p.state}`).join("; ")}</p>
    </div>
  );
}

/* ───────────────────────── Points rows ───────────────────────── */

type Part = string | { tip: string; source: string } | { bold: string };
export interface Point {
  title: string;
  text: Part[];
  /** Illustration: an existing animated icon from the Why Rang De set. */
  icon?: string;
}

export function PointText({ parts, plain = false }: { parts: Part[]; plain?: boolean }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : "tip" in p ? (
          <SourceTip key={i} source={p.source} plain={plain}>
            {p.tip}
          </SourceTip>
        ) : (
          plain ? (
            <Fragment key={i}>{p.bold}</Fragment>
          ) : (
            <strong key={i} className="font-bold text-ink">
              {p.bold}
            </strong>
          )
        ),
      )}
    </>
  );
}

// Sourced the same way as the rest of the site: Findex for formal borrowing (also in the How it works
// story), NABARD for the informal rate (also on the live Why Rang De card).
const FINDEX_SOURCE =
  "Source: World Bank, Global Findex Database 2021. Share of Indian adults (15+) who borrowed from a bank or other formal financial institution in the past year.";
const NABARD_SOURCE =
  "Source: NABARD Rural Economic Conditions & Sentiments Survey, July 2026, as reported by Rural Voice on 23 Jul 2026. Average rate on informal loans: 17.77%.";

export const PROBLEM_POINTS: Point[] = [
  {
    title: "Banks won’t lend to them",
    icon: "/images/why-rangde-v2/icon-bank.webp",
    text: [
      { tip: "Only about 12%", source: FINDEX_SOURCE },
      " of Indian adults borrowed from a bank or formal lender in 2021. Without a credit history or land as collateral, a business loan is out of reach, even if the business is sound.",
    ],
  },
  {
    title: "Informal loans cost more",
    icon: "/images/why-rangde-v2/icon-banknotes.webp",
    text: [
      "What’s left is moneylenders and other informal lenders, whose loans in rural India average ",
      { tip: "almost 18% interest", source: NABARD_SOURCE },
      ". Rates like that eat the very income the loan was meant to help grow.",
    ],
  },
  {
    title: "No credit score built",
    icon: "/images/why-rangde-v2/icon-warning-circle.webp",
    text: ["Informal loans leave no record. Repay every rupee and the next loan still starts from zero — while unpaid debt compounds into a trap."],
  },
];

// One-to-one answers to the three problems above.
export const SOLUTION_POINTS: Point[] = [
  {
    title: "Investors lend to them",
    icon: "/images/why-rangde-v2/icon-hand-check.webp",
    text: [
      "No land collateral needed — our social investors fund them directly. All borrowers are ",
      {
        tip: "strictly vetted",
        source:
          "A local impact partner meets every entrepreneur in person: community identification, business assessment, credit evaluation, identity verification and a profile review, before a loan is listed.",
      },
      " with our local partners, who also provide financial training.",
    ],
  },
  {
    title: "Interest stays fair",
    icon: "/images/why-rangde-v2/icon-shield-check.webp",
    text: ["All borrowers pay up to 8.5% p.a. interest, with no hidden charges, and fair repayment schedules that follow the business’s real cash flow."],
  },
  {
    title: "Repaying builds credit",
    icon: "/images/why-rangde-v2/icon-bar-chart.webp",
    text: ["Every repayment is reported to the credit bureaus. So borrowers who may never have had a credit file start building one, and with it access to the formal financial system."],
  },
];

const MFI_RATE_SOURCE = "Source to be confirmed.";

/** Version 5's copy of the points (shorter, to fit four lines at P2), also used by Version 1.1. */
export const V5_PROBLEM_POINTS: Point[] = [
  {
    title: "Banks won’t lend to them",
    icon: "/images/why-rangde-v2/icon-bank.webp",
    text: [
      // Findex 2021 puts formal borrowing at about 12% of Indian adults, so "fewer than 15%" holds.
      { tip: "Fewer than 15% of Indians have access to formal credit.", source: FINDEX_SOURCE },
      " Without a credit history or land as collateral, a business loan is out of reach, even if the business is sound.",
    ],
  },
  {
    title: "Informal loans cost more",
    icon: "/images/why-rangde-v2/icon-banknotes.webp",
    text: [
      "What’s left is moneylenders and MFIs that lend at ",
      // TODO: the source for 20–30% (NABARD's 17.77% average doesn't support it); placeholder until confirmed.
      { tip: "20–30% interest rates", source: MFI_RATE_SOURCE },
      ". These high rates eat the very income the loan was actually meant to help grow.",
    ],
  },
  {
    title: "No credit score built",
    icon: "/images/why-rangde-v2/icon-warning-circle.webp",
    text: ["Informal loans leave no record. Repay every rupee and the next loan still starts from zero — while unpaid debt compounds into a trap."],
  },
];

// One-to-one answers to the three problems above.
export const V5_SOLUTION_POINTS: Point[] = [
  {
    title: "Investors lend to them",
    icon: "/images/why-rangde-v2/icon-hand-check.webp",
    text: [
      "No land collateral needed — our social investors fund them directly. All borrowers are ",
      {
        tip: "strictly vetted",
        source:
          "A local impact partner meets every entrepreneur in person: community identification, business assessment, credit evaluation, identity verification and a profile review, before a loan is listed.",
      },
      " with our local Partners, who also provides financial training.",
    ],
  },
  {
    title: "Interest stays fair",
    icon: "/images/why-rangde-v2/icon-shield-check.webp",
    text: ["All borrowers pay up to 8.5% p.a. interest, with no hidden charges, and fair repayment schedules that follow the business’s real cash flow."],
  },
  {
    title: "Repaying builds credit",
    icon: "/images/why-rangde-v2/icon-bar-chart.webp",
    text: ["Every repayment is reported to the credit bureaus. So borrowers who may never have had a credit file start building one, access to the formal financial system."],
  },
];

export const INFRA_POINTS: Point[] = [
  { title: "Regulated", icon: "/images/why-rangde-v2/icon-shield-check.webp", text: ["Built within India’s RBI-regulated P2P lending framework."] },
  { title: "Curated", icon: "/images/why-rangde-v2/icon-target-center.webp", text: ["Borrowers are screened and authenticated diligently."] },
  { title: "Transparent", icon: "/images/why-rangde-v2/icon-map.webp", text: ["You see where your money goes and follow its progress."] },
  { title: "Credit-linked", icon: "/images/why-rangde-v2/icon-bar-chart.webp", text: ["Repayments build borrowers’ formal credit histories."] },
];

/** Three (or four) illustrated points in a row: Figma 2687:22322 (problem), 2687:22321 (solution), 2718:46885 (infrastructure). */
// The three shapes from the Why Rang De set — circle, eight-circle flower, wavy — solid copies (the
// originals carry fill-opacity .24, which made the masked badges faint). One colour per section, the
// shape changing from point to point; the icons are all the same green.
const BADGE_MASKS = ["circle", "flower", "wavy"].map((n) => `url(/images/approaches/shape-${n}.svg) center / contain no-repeat`);
const ICON_GREEN = "#109173";

/** `refined` (Version 1.1): 160px badges from md up (the icon scaled with them), each point 368px wide, and
 * the body text faded with no bold, the sourced phrases marked only by their underline. */
/** `emojis` (Version 5): one emoji image per point, in order, in place of the badge and icon, each scaled to
 * 92px tall (width in proportion). */
/** `onDark`: white titles and text, for a dark section (v2's green "see where your money goes"). */
export function PointsGrid({ points, size = "lg", badge = "#fff", shapeOffset = 0, refined = false, emojis, onDark = false }: { points: Point[]; size?: "lg" | "sm"; badge?: string; shapeOffset?: number; refined?: boolean; emojis?: string[]; onDark?: boolean }) {
  const lg = size === "lg";
  const reduce = useReducedMotion();
  return (
    <div className={`grid w-full max-w-[1200px] grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-10 ${points.length === 4 ? "lg:grid-cols-4" : refined ? "md:grid-cols-[repeat(3,minmax(0,368px))] md:justify-center" : "md:grid-cols-3"} md:gap-12`}>
      {points.map((p, i) => (
        <Reveal key={p.title} delay={i * 0.08} className={`flex flex-row items-start gap-4 text-left sm:flex-col sm:items-center sm:text-center ${lg ? "sm:gap-6" : "sm:gap-4"}`}>
          <div className={`relative flex shrink-0 items-center justify-center ${emojis?.[i] ? "h-[92px]" : lg ? `size-[64px] sm:size-[104px] ${refined ? "md:size-[160px]" : "md:size-[120px]"}` : "size-[64px] sm:size-[88px]"}`}>
            {/* Each point gets its own shape — the blobs from the live Why Rang De cards and the
                scalloped badge from Figma's lock icon (2719:47009) — tinted per section, turning
                once every 20s like the live badges. */}
            {!emojis?.[i] && (
            <motion.span
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundColor: badge, WebkitMask: BADGE_MASKS[(i + shapeOffset) % BADGE_MASKS.length], mask: BADGE_MASKS[(i + shapeOffset) % BADGE_MASKS.length] }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            )}
            {emojis?.[i] ? (
              <motion.span
                className="h-full"
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 + i * 0.08 }}
              >
                <Image src={emojis[i]} alt="" width={300} height={300} sizes="184px" className="h-full w-auto" />
              </motion.span>
            ) : p.icon && (
              <motion.span
                className="relative"
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 + i * 0.08 }}
              >
                {/* The animated icon used as a mask, so every icon reads in the same green. */}
                <span
                  className={`block ${lg ? `size-[30px] sm:size-[44px] ${refined ? "md:size-[70px]" : "md:size-[52px]"}` : "size-[28px] sm:size-[36px]"}`}
                  style={{ backgroundColor: ICON_GREEN, WebkitMask: `url(${p.icon}) center / contain no-repeat`, mask: `url(${p.icon}) center / contain no-repeat` }}
                />
              </motion.span>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className={`font-display font-bold ${onDark ? "text-white" : "text-ink"} ${lg ? "text-p2 sm:text-p1" : "text-p2"}`}>{p.title}</h3>
            <p className={`font-display text-p3 font-medium leading-[22px] sm:text-p2 sm:leading-[24px] ${onDark ? "text-white/72" : refined ? "text-ink/64" : "text-ink/80"}`}>
              <PointText parts={p.text} plain={refined} />
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** A full section: heading (optional eyebrow) over a PointsGrid. tone "green" is the Figma green/light card. */
/** `typed`: the heading types itself out as it is scrolled into view (Version 1.1). */
export function PointsSection({ eyebrow, heading, points, tone = "plain", badge, typed = false, refined = false, emojis, children }: { eyebrow?: string; heading: string; points: Point[]; tone?: "plain" | "green" | "cream" | "white"; badge?: string; typed?: boolean; refined?: boolean; emojis?: string[]; children?: ReactNode }) {
  const bg = tone === "green" ? "bg-[#cbe0b8]" : tone === "cream" ? "bg-[#F7F3ED]" : tone === "white" ? "bg-white" : "bg-[#f1f2f5]";
  const badgeColor = badge ?? (tone === "green" ? "rgba(255,255,255,0.72)" : tone === "white" ? "#F1F2F5" : "#fff");
  return (
    <section className={`mx-2 flex flex-col items-center gap-8 rounded-[16px] px-5 py-14 sm:gap-12 sm:px-8 sm:py-20 md:gap-16 md:py-24 lg:py-[120px] ${bg}`}>
      <Reveal className="flex max-w-[1200px] flex-col items-center gap-2 text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {typed ? (
          <ScrollType text={heading} className="max-w-[780px] font-display text-h3 font-bold text-ink" />
        ) : (
          <AnimatedText as="h2" text={heading} className="max-w-[780px] font-display text-h3 font-bold text-ink" />
        )}
      </Reveal>
      <PointsGrid points={points} badge={badgeColor} shapeOffset={tone === "green" ? 2 : tone === "plain" ? 0 : 1} refined={refined} emojis={emojis} />
      {children}
    </section>
  );
}

/* ───────────────────────── Problem → solution, stacked ───────────────────────── */

/**
 * The problem card holds still while the solution card scrolls up over it. The first card sticks
 * with its bottom edge on screen (so a card taller than the screen is still read to the end before
 * it pins), then the second slides over it.
 */
export function StackedSections({ first, second }: { first: ReactNode; second: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      setTop(Math.min(nav + 8, window.innerHeight - el.offsetHeight));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);
  return (
    <div className="relative flex flex-col gap-2">
      <div ref={ref} className="z-0 md:sticky" style={{ top: top ?? "calc(var(--navbar-bottom, 0px) + 8px)" }}>
        {first}
      </div>
      <div className="relative z-10 rounded-[16px] md:shadow-[0_-12px_32px_rgba(41,45,54,0.08)]">{second}</div>
    </div>
  );
}

/* ───────────────────────── v1.2: platform + calculator ───────────────────────── */

/** v1.2's solution card (Figma 2718:46710): what Rang De is, then the returns slider right inside it. */
export function PlatformCalculator() {
  return (
    <section className="relative z-10 mx-2 flex flex-col items-center gap-12 rounded-[16px] bg-[#cbe0b8] px-4 py-20 sm:px-8 md:gap-16 md:py-24 lg:py-[120px]">
      <Reveal className="flex max-w-[1100px] flex-col items-center gap-3 text-center">
        <Eyebrow>India’s first direct social investment platform</Eyebrow>
        <AnimatedText
          as="h2"
          segments={[
            { text: "Rang De empowers you to directly fund rural entrepreneurs across India.", className: "text-ink" },
            { text: "Your money helps them access credit and build a formal credit history, while you earn returns.", className: "text-green-dark" },
          ]}
          className="font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />
      </Reveal>
      <InvestmentSlider />
    </section>
  );
}

/* ───────────────────────── v1.2: the credit chain ───────────────────────── */

const CHAIN = ["Capital", "Business", "Repayment", "Credit history", "More opportunity"];

/** Figma 2719:47006: lock badge, the two-line promise, the chain of pills, then the credit-bureau line. */
export function CreditChain() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-8 px-4 md:gap-10">
      <div className="flex max-w-[1200px] flex-col items-center gap-6 text-center">
        <div className="relative size-[96px] md:size-[120px]">
          <Image src="/images/approaches/badge-star.svg" alt="" fill unoptimized className="p-[3%]" />
          <Image src="/images/approaches/lock-open.gif" alt="" width={64} height={64} unoptimized className="absolute left-1/2 top-1/2 size-[52px] -translate-x-1/2 -translate-y-1/2 md:size-[64px]" />
        </div>
        <AnimatedText
          as="h2"
          segments={[
            { text: "With Rang De, you’re not just giving someone a loan.", className: "text-ink" },
            { text: "You’re helping them build their financial future.", className: "text-[#5a2aa8]" },
          ]}
          className="font-display text-h3 font-bold"
        />
      </div>
      <ol className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-3 md:gap-4">
        {CHAIN.map((step, i) => (
          <motion.li
            key={step}
            className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 md:gap-4"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.45, delay: i * 0.18, ease: EASE }}
          >
            {i > 0 && <Image src="/images/approaches/chain-arrow.svg" alt="" width={24} height={16} unoptimized aria-hidden className="h-[16px] w-[24px] rotate-90 sm:rotate-0" />}
            <span className="rounded-[48px] bg-[#ddd1f0] px-5 py-2 font-display text-p3 font-bold text-[#330c6e] md:px-6 md:text-p2">{step}</span>
          </motion.li>
        ))}
      </ol>
      <p className="max-w-[800px] text-center font-display text-p2 font-medium leading-[24px] text-ink/80">
        Every repayment is reported to the credit bureaus. Borrowers who may never have had a credit file start building one. And with it, access to the formal financial system.
        <br />
        <strong className="font-bold text-ink">Even just a few thousand rupees can change a business.</strong>
      </p>
    </div>
  );
}

/* ───────────────────────── How it works (tabs over the real UI) ───────────────────────── */

// Figma 2712:38773: five steps under one media area. The media is the site's existing
// How it works stage (the product UI, animated), mapped onto the five steps below.
// `stage`: the homepage pop-up's UI frame for that step (visual "ui"); `scene`: the matching part of
// Durga's journey from the How it works v3 prototype (visual "journey", components/how-it-works/journey).
// Each tab plays its visual through once, in step with its line, then hands over to the next; after
// Earn it loops back to Choose. `ms`: one pass of the pop-up UI's loop for that step (figma-motion.js
// w[k], or the part of it in `segment`); `sceneMs`: one pass of the journey scene plus a short hold.
const HIW_TABS: { title: string; text: string; stage: number; segment?: [number, number]; ms: number; scene: JourneyScene; sceneMs: number; sceneLabel: string }[] = [
  { title: "Choose", text: "Explore entrepreneurs looking for a loan.", stage: 0, ms: 12000, scene: "choose", sceneMs: 8600, sceneLabel: "Real listing cards from rangde.in scroll past; the Women filter is tapped and the list narrows; Durga Chouhan's card is picked and opens into her page." },
  { title: "Understand", text: "See exactly what they need the money for.", stage: 1, ms: 16800, scene: "understand", sceneMs: 9800, sceneLabel: "Durga's page on rangde.in scrolls: photos of her, her grocery shop in Dhar and her family; her plan to add a tent and decoration rental business; her first formal loan; and the key facts, ₹1,00,000 at 8.25% repaid monthly, verified by Transform Rural India Foundation." },
  { title: "Lend", text: "Decide whom you want to support.", stage: 2, ms: 8900, scene: "lend", sceneMs: 9200, sceneLabel: "₹2,000 is picked and lent to Durga; other investors join until 31 of them fill her ₹1,00,000 goal; the money is collected on 15 October and reaches her shop on 16 October." },
  { title: "Follow", text: "Track the progress of your loans.", stage: 3, segment: [0, 0.585], ms: 6900, scene: "follow", sceneMs: 6600, sceneLabel: "A notification says Durga has repaid ₹119; then a log of her repayments, each month arriving as a new row, on time, as a ring fills towards 18 of 18." },
  { title: "Earn", text: "Get repaid with returns as the loan is repaid.", stage: 3, segment: [0.6, 1], ms: 4800, scene: "earn", sceneMs: 6600, sceneLabel: "Repaid in full: ₹2,133 back, ₹2,000 of it your money and ₹133 returns. Reinvest is tapped and the next entrepreneur, Rekha Bai, comes up." },
];

const HIW_TABS_V11 = [
  ...HIW_TABS.slice(0, 3),
  {
    ...HIW_TABS[4],
    title: "Get repaid",
    text: "Every repayment, with returns, straight to your bank.",
    scene: "repaid" as JourneyScene,
    sceneMs: 10600,
    sceneLabel: "Durga's repayments arrive month by month, on time, as a ring fills towards 18 of 18; then she has repaid in full: ₹2,133 back, ₹2,000 of it your money and ₹133 returns, credited to your bank account.",
  },
];


// Version 1.1 plays Follow and Earn on their own, slower 28.8s clock (figma-motion.js, step 4's data-v11 branch).
const V11_STEP4: Record<string, { segment: [number, number]; ms: number }> = {
  Follow: { segment: [0, 13.8 / 28.8], ms: 13800 },
  Earn: { segment: [13.82 / 28.8, 1], ms: 14980 },
};

/** `visual`: "ui" — the homepage pop-up's animated product UI (v1); "journey" — Durga's journey from the
 * How it works v3 prototype, real listings in light mock UI (v1.2). */
/** `typed`: the heading types itself out as it is scrolled into view (Version 5).
 * `refined` (Version 1.1): the animation frame is rounded (8px) with a 4px ink-16% stroke inside its left,
 * top and right edges; the grey step line is its bottom edge, clipped by the same corners, with the black
 * indicator gliding along it to the chosen step. The divider above the calculator is stronger (ink 24%)
 * with 80px either side. */
/** `bare` (Version 1.1): the journey window without its browser bar, centred, with only the beat's one-line caption
 * as a small pointer under it (no explanatory copy beside it: the animation already shows it). */
/** `heading`/`eyebrow` (Version 4): its own line ("You decide who you back.") instead of the usual one. */
export function HowItWorksTabs({ children, tone = "cream", visual = "ui", typed = false, refined = false, inked = false, bare = false, heading = "Investment to repayment – you’re in control at every step", eyebrow = "How it works" }: { children?: ReactNode; tone?: "cream" | "white" | "grey"; visual?: "ui" | "journey"; typed?: boolean; refined?: boolean; inked?: boolean; bare?: boolean; heading?: string; eyebrow?: string | null }) {
  // Version 1.1 (bare): four steps, Follow and Earn as one ("Get repaid"), since repayments now go straight to the
  // investor's bank account and there is nothing to reinvest from.
  const TABS = bare ? HIW_TABS_V11 : HIW_TABS;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const running = inView && !paused && !reduce;
  const tabMs = useCallback((i: number) => (visual === "journey" ? TABS[i].sceneMs : (refined && V11_STEP4[TABS[i].title]?.ms) || TABS[i].ms), [visual, refined, TABS]);

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % TABS.length), tabMs(active));
    return () => clearTimeout(id);
  }, [active, running, tabMs, TABS.length]);

  const tab = TABS[active];
  return (
    <section
      ref={ref}
      id="how-it-works"
      className={`mx-2 flex flex-col items-center gap-8 rounded-[16px] px-4 py-14 sm:gap-12 sm:px-8 sm:py-20 md:py-24 lg:px-[80px] lg:py-[120px] ${tone === "cream" ? "bg-[#F7F3ED]" : tone === "grey" ? "bg-[#ebeaea]" : "bg-white"}`}
    >
      <Reveal className="flex max-w-[1200px] flex-col items-center gap-2 text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {inked ? (
          // Version 1.1: fills in as it is read, plain (no coloured edge).
          <ScrollInk as="h2" tone="plain" text={heading} className="font-display text-h3 font-bold" />
        ) : typed ? (
          <ScrollType text={heading} className="font-display text-h3 font-bold text-ink" />
        ) : (
          <AnimatedText as="h2" text={heading} className="font-display text-h3 font-bold text-ink" />
        )}
      </Reveal>

      <div className="flex w-full max-w-[1200px] flex-col" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={refined ? "w-full overflow-hidden rounded-[8px] max-sm:overflow-visible" : "contents"}>
        <div className={`w-full overflow-hidden ${bare ? "hiw-bare " : ""}${refined ? "hiw-v11 max-sm:overflow-visible max-sm:bg-transparent sm:border-x-4 sm:border-t-4 sm:border-ink/16 sm:bg-white" : "rounded-[8px] bg-white"} ${visual === "journey" ? (refined ? `h-[380px] sm:h-[600px] ${bare ? "lg:h-[600px]" : "lg:h-[520px]"}` : "h-[560px] sm:h-[600px] lg:h-[520px]") : "h-[340px] sm:h-[420px] lg:h-[480px]"}`}>
          {visual === "journey" ? (
            <JourneyStage scene={tab.scene} label={tab.sceneLabel} loopMs={tab.sceneMs} frameW={bare ? 760 : undefined} />
          ) : (
            <HowItWorksStage wide v11={refined} stepIndex={tab.stage} segment={(refined && V11_STEP4[tab.title]?.segment) || tab.segment} label={HOW_IT_WORKS_STEPS[tab.stage].illustrationLabel} />
          )}
        </div>
        {refined && (
          // The grey step line as the frame's bottom edge, with one black indicator gliding along it.
          <div aria-hidden className="relative hidden h-[4px] w-full bg-ink/16 sm:block sm:h-[8px]">
            <motion.span
              className="pointer-events-none absolute inset-y-0 bg-ink"
              initial={false}
              animate={{ left: `${(active * 100) / TABS.length}%` }}
              transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: `${100 / TABS.length}%` }}
            />
          </div>
        )}
        </div>
        {refined && (
          // Phones (Figma): five short segments under the window, the current one in sky blue.
          <div className="mt-[40px] flex gap-1 sm:hidden">
            {TABS.map((t, i) => (
              <button key={t.title} type="button" aria-label={`Step ${i + 1}: ${t.title}`} aria-current={i === active} onClick={() => setActive(i)} className="flex h-4 flex-1 items-center">
                <span className="relative h-1 w-full overflow-hidden rounded-full bg-ink/16">
                  {i < active && <span className="absolute inset-0 bg-primary" />}
                  {i === active && (
                    <motion.span
                      key={`${active}-${running}`}
                      className="absolute inset-y-0 left-0 bg-primary"
                      initial={{ width: running ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: running ? tabMs(active) / 1000 : 0, ease: "linear" }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
        <div role="tablist" aria-label="How it works steps" className={`relative ${TABS.length === 4 ? "grid-cols-4" : "grid-cols-5"} ${refined ? "hidden sm:grid" : "grid"}`}>
          {TABS.map((t, i) => (
            <button
              key={t.title}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="group relative flex flex-col items-center gap-1 px-1 pt-4 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-4 sm:pt-6"
            >
              {!refined && (
              <span className="absolute inset-x-0 top-0 h-[4px] bg-ink/16 sm:h-[8px]">
                {i === active && (
                  <motion.span
                    key={`${active}-${running}`}
                    className="absolute inset-y-0 left-0 bg-ink"
                    initial={{ width: running ? "0%" : "100%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: running ? tabMs(active) / 1000 : 0, ease: "linear" }}
                  />
                )}
              </span>
              )}
              <span className={`hidden font-display font-bold sm:block sm:text-p1 ${i === active ? "text-ink" : "text-ink/56 group-hover:text-ink"}`}>{t.title}</span>
              <span className="sr-only sm:hidden">{t.title}</span>
              <span className="hidden font-display text-p3 font-medium text-ink/80 sm:block sm:text-p2">{t.text}</span>
            </button>
          ))}
        </div>
        {refined ? (
          <div className="mt-6 flex flex-col items-center gap-2 text-center sm:hidden" aria-live="polite">
            <p className="font-display text-[11px] font-bold uppercase leading-[16px] tracking-[0.88px] text-text-grey-64">Step {active + 1}</p>
            <p className="font-display text-[24px] font-bold leading-[32px] text-ink">
              {tab.title} · <span className="text-ink/48">{tab.text}</span>
            </p>
          </div>
        ) : (
        <div className="mt-1 flex flex-col items-center gap-1 text-center sm:hidden" aria-live="polite">
          <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-ink/56">
            Step {active + 1} of {TABS.length}
          </p>
          <p className="font-display text-p1 font-bold text-ink">{tab.title}</p>
          <p className="font-display text-p3 font-medium text-ink/80">{tab.text}</p>
        </div>
        )}
      </div>

      {children && (
        <>
          <div className={`w-full max-w-[1200px] ${refined ? "my-4 h-px bg-ink/24 max-sm:h-0 max-sm:border-t max-sm:border-dotted max-sm:border-ink/24 max-sm:bg-transparent sm:my-8" : "h-px bg-ink/8"}`} />
          {children}
        </>
      )}
    </section>
  );
}

/** "A new way of lending needs serious infrastructure." (Figma 2718:46885), under How it works in v1.2. */
/** `inked` (Version 2): the heading fills in letter by letter as it scrolls up (white at 24% → white on dark; text grey
 * 24 → 100 otherwise). */
export function InfrastructureRow({ heading = "A new way of lending needs serious infrastructure.", badge = "#F1F2F5", onDark = false, inked = false }: { heading?: string; badge?: string; onDark?: boolean; inked?: boolean }) {
  return (
    <div className="flex w-full max-w-[1200px] flex-col items-center gap-10">
      {inked ? (
        <ScrollInk as="h3" tone={onDark ? "white" : "grey"} text={heading} className="text-center font-display text-h4 font-bold" />
      ) : (
        <AnimatedText as="h3" text={heading} className={`text-center font-display text-h4 font-bold ${onDark ? "text-white" : "text-ink"}`} />
      )}
      <PointsGrid points={INFRA_POINTS} size="sm" badge={badge} shapeOffset={1} onDark={onDark} />
    </div>
  );
}

/* ───────────────────────── Question cards (cruise-style) ───────────────────────── */

export interface QuestionCard {
  question: string;
  answer: string;
  /** Two or three short facts, shown as chips when the card opens. */
  facts: { text: string; tone?: "ok" | "no" }[];
  /** The card's photo. PLACEHOLDERS from the site's own story photos until the commissioned
   * visuals land (prompts in docs/approaches-faq-visual-prompts.md). */
  image: string;
  /** Which part of the photo stays in frame. */
  focus?: string;
}

// The five questions people ask most, shown as photo cards instead of a long FAQ list.
// Answers are rangde.in's FAQ wording where one exists; "returns" follows Ram's draft.
export const QUESTION_CARDS: QuestionCard[] = [
  {
    question: "Why aren’t Rang De returns higher?",
    image: "/images/stories/story-2-bg.webp",
    facts: [{ text: "Up to 8.5% p.a. for you", tone: "ok" }, { text: "A fair rate for the borrower too", tone: "ok" }, { text: "Not built to beat the stock market", tone: "no" }],
    answer:
      "Because Rang De isn’t trying to be the stock market. If your only goal is to maximise financial returns, there are other places to invest. Here your money earns a fair return, up to 8.5% p.a., while it builds businesses, livelihoods, credit histories, families and communities.\n\nThe interest stays fair for the borrower too: that is the whole point.",
  },
  {
    question: "How secure is the money I put in Rang De?",
    image: "/images/stories/story-3-bg.webp",
    facts: [{ text: "Impact partners mentor every borrower", tone: "ok" }, { text: `${LIVE.principalRepaidPct.toFixed(1)}% of principal repaid`, tone: "ok" }, { text: "No guarantee: RBI rules", tone: "no" }],
    answer:
      "Rang De works with a set of credible and ethical community organizations or social enterprises called impact partners. These organizations identify communities engaged in sustainable livelihoods, but do not have access to institutional credit. They mentor these communities in effectively utilizing and repaying this credit, leading to an excellent repayment rate on Rang De. However, as per RBI regulations, we cannot guarantee any repayments on the platform.",
  },
  {
    question: "I’m an NRI/OCI. Can I still invest in Rang De?",
    image: "/images/stories/story-1-bg.webp",
    facts: [{ text: "Yes, with valid KYC", tone: "ok" }, { text: "Pay from your NRO account in India", tone: "ok" }, { text: "Overseas accounts or cards", tone: "no" }],
    answer:
      "Yes. Resident Indians, Non-Resident Indians, and Overseas Citizens of India/Persons of Indian Origin with valid KYC documents and Indian bank accounts can invest on Rang De.\n\nWe accept payments in Indian currency from Non Resident Rupee accounts maintained with banks in India. RBI regulations do not permit us to accept payments from overseas bank accounts or international cards issued overseas.",
  },
  {
    question: "What happens if the borrower doesn’t repay?",
    image: "/images/stories/story-4-bg.webp",
    facts: [{ text: "A local partner stays with every loan", tone: "ok" }, { text: "Spread across many borrowers", tone: "ok" }, { text: "Part of the principal can be lost", tone: "no" }],
    answer:
      "A local impact partner identifies every borrower in a community it already works with, and stays with them through the loan, mentoring them to use it well and keep to the schedule. You also see each loan’s credit rating, rate and tenure before you invest.\n\nThat is why repayment on Rang De is high. But P2P lending carries risk: if a borrower can’t repay, that part of your principal can be lost, and as per RBI regulations Rang De cannot guarantee repayments. Spreading your money across many borrowers lowers the effect of any one of them.",
  },
  {
    question: "How does Rang De choose who gets a loan?",
    image: "/images/how-it-works/opp-1.webp",
    facts: [{ text: "Met in person by a local partner", tone: "ok" }, { text: "Five checks before listing", tone: "ok" }, { text: "Only verified profiles go live", tone: "ok" }],
    answer:
      "Before any profile is listed, Rang De and its partners on the ground run an in-depth vetting process: community identification, business assessment, credit evaluation, identity verification and a profile review. Only the borrowers who pass every step are published, with why they need the loan and how they plan to repay it.",
  },
];

export function FactChip({ text, tone = "ok" }: { text: string; tone?: "ok" | "no" }) {
  return (
    <li className="flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 font-display text-p3 font-bold text-ink shadow-[0_1px_2px_rgba(41,45,54,0.08)]">
      <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full text-white ${tone === "ok" ? "bg-green-dark" : "bg-[#C8372D]"}`}>
        <svg viewBox="0 0 24 24" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {tone === "ok" ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7L7 17" />}
        </svg>
      </span>
      {text}
    </li>
  );
}

/**
 * The top questions as tall photo cards in a row, after cruise.money's feature cards: the question
 * sits on the photo, a "+" in the corner. Opening one widens it in place (the others slide along)
 * and a frosted panel brings in the facts and the answer; "−" closes it. On phones the card keeps its
 * width and the panel covers the photo. "Read more FAQs" sits underneath for everything else.
 */
/** `exclude`: questions a page already answers in a section of its own (v3 has "Why aren't returns
 * higher?" as a full section), so the cards don't repeat it. */
export function QuestionCards({ heading, count = 4, exclude = [] }: { heading?: string; count?: 4 | 5; exclude?: string[] }) {
  const cards = QUESTION_CARDS.filter((q) => !exclude.includes(q.question)).slice(0, count);
  const [open, setOpen] = useState<number | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = useReducedMotion();

  // Keep the opened card in view once it has finished widening; Escape closes it.
  useEffect(() => {
    if (open === null) return;
    const id = setTimeout(() => refs.current[open]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "nearest" }), 320);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, reduce]);

  return (
    <section className="mx-2 flex flex-col items-center gap-10 overflow-hidden rounded-[16px] bg-white py-16 md:py-20">
      {heading && <AnimatedText as="h2" text={heading} className="px-4 text-center font-display text-h3 font-bold text-ink" />}
      <div className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {cards.map((c, i) => {
          const isOpen = open === i;
          return (
            // Same motion as cruise.money's use-case cards: the card's width eases out over 0.3s
            // (cubic-bezier(.215,.61,.355,1)) and the cards beside it slide along; the "+" turns into
            // "−" (its upright bar rotates flat, 0.2s) and stays as the close button; the content fades
            // up from 80px below.
            <div
              key={c.question}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`group relative h-[480px] shrink-0 snap-center overflow-hidden rounded-[16px] bg-ink transition-[width] duration-300 ease-[cubic-bezier(.215,.61,.355,1)] motion-reduce:transition-none sm:h-[560px] ${
                isOpen ? "w-[calc(100vw-32px)] sm:w-[min(920px,calc(100vw-64px))]" : "w-[calc(100vw-64px)] sm:w-[340px]"
              }`}
            >
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 640px) 920px, 100vw"
                className={`object-cover transition-transform duration-700 ease-out ${isOpen ? "" : "group-hover:scale-[1.03]"}`}
                style={c.focus ? { objectPosition: c.focus } : undefined}
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/72" />

              {/* The whole closed card opens it. */}
              {!isOpen && (
                <button
                  type="button"
                  aria-label={c.question}
                  aria-expanded={false}
                  onClick={() => setOpen(i)}
                  className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                />
              )}

              {/* + / − : opens, and once open, closes. */}
              <button
                type="button"
                aria-label={isOpen ? `Close: ${c.question}` : `Open: ${c.question}`}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="absolute right-5 top-5 z-30 flex size-[56px] items-center justify-center rounded-full bg-white/24 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/36 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-[64px]"
              >
                <span aria-hidden className="relative block size-[22px]">
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-current transition-[rotate] duration-200 ease-out ${isOpen ? "rotate-90" : ""}`}
                  />
                </span>
              </button>

              <h3
                className={`pointer-events-none absolute bottom-7 left-7 z-10 max-w-[300px] font-display text-[26px] font-bold leading-[32px] text-white transition-opacity duration-200 [text-wrap:balance] sm:bottom-10 sm:left-10 sm:text-h4 ${
                  isOpen ? "max-sm:opacity-0" : ""
                }`}
              >
                {c.question}
              </h3>

              <div
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={`absolute inset-x-3 bottom-3 top-[88px] z-20 flex flex-col gap-4 overflow-y-auto rounded-[12px] bg-[#F7F3ED]/92 p-6 backdrop-blur-xl transition-[opacity,translate] duration-300 ease-[cubic-bezier(.215,.61,.355,1)] motion-reduce:transition-none sm:bottom-6 sm:left-auto sm:right-6 sm:top-[100px] sm:w-[min(440px,55%)] sm:p-8 ${
                  isOpen ? "translate-y-0 opacity-100 delay-150" : "pointer-events-none translate-y-[80px] opacity-0"
                }`}
              >
                <h4 className="font-display text-p1 font-bold text-ink">{c.question}</h4>
                <ul className="flex flex-col gap-2">
                  {c.facts.map((f) => (
                    <FactChip key={f.text} {...f} />
                  ))}
                </ul>
                <p className="whitespace-pre-line font-display text-p3 font-medium leading-[22px] text-ink/80 sm:text-p2 sm:leading-[26px]">{c.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
      <a
        href={FAQS_URL}
        className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-primary/12 px-8 font-display text-p3 font-bold text-primary transition-colors hover:bg-primary/20"
      >
        Read more FAQs
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </section>
  );
}

/* ───────────────────────── v3: founders, stories from both sides ───────────────────────── */

/** Figma 2719:51479: the founders' photo as a tilted print, then the one-paragraph origin. */
export function FounderOrigin() {
  return (
    <section className="mx-2 flex flex-col items-center rounded-[16px] bg-white px-4 py-20 sm:px-8 md:py-24 lg:py-[120px]">
      <div className="flex max-w-[760px] flex-col items-center gap-12 text-center lg:gap-16">
        <Reveal>
          <div className="relative h-[180px] w-[240px] -rotate-3 overflow-hidden rounded-[8px] border-[6px] border-white shadow-[0_4px_24px_rgba(0,0,0,0.24)] sm:h-[240px] sm:w-[320px]">
            <Image src="/images/approaches/founders-oxford.png" alt="Ram and Smita, Rang De’s founders" fill sizes="320px" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ScrollFill
            className="font-display text-h4 font-bold [text-wrap:balance] md:text-h3"
            segments={[
              { text: "Ram and Smita came back from Oxford to build Rang De", solid: true },
              { text: ", with a simple belief: where you live or how much you earn shouldn’t determine your opportunities to grow. " },
              { text: "Here’s how that works.", breakBefore: true },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

function InvestorStoryCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex h-full w-[calc(100vw-32px)] shrink-0 flex-col justify-between gap-8 rounded-[8px] bg-[#084a2f] p-7 sm:w-[340px] lg:w-[440px]">
      <div className="flex flex-col gap-4">
        <Eyebrow className="text-[#62af1d]">Investor</Eyebrow>
        <p className="font-display text-p2 leading-[26px] text-white/72">
          {t.quote.map((s, i) => (
            <span key={i} className={s.emphasized ? "font-bold text-white" : undefined}>
              {s.text}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-white/16 pt-5">
        <Image src={t.avatar} alt="" width={48} height={48} className="size-[48px] rounded-[8px] border-2 border-white object-cover" />
        <div className="flex flex-col">
          <p className="font-display text-p2 font-bold text-white">{t.name}</p>
          {(t.since || t.role) && <p className="font-display text-p4 font-medium text-white/64">{t.since ?? t.role}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Figma 2730:10: "Real stories about Rang De, from both sides" — borrower and investor cards kept
 * separate (they are not pairs), alternating: a borrower's story, then an investor's.
 */
export function StoriesBothSides() {
  const investors = [...testimonialsRow1, ...testimonialsRow2];
  const items: ({ kind: "b"; s: Story } | { kind: "i"; t: Testimonial })[] = [];
  recentStories.forEach((s, i) => {
    items.push({ kind: "b", s });
    items.push({ kind: "i", t: investors[i] });
  });
  const rowRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // The row drifts on its own (a seamless loop over two copies of the cards), and stays a normal
  // scroller: trackpad, swipe, or drag with the mouse. It holds still while hovered, touched or
  // dragged, and while off screen; with reduced motion it doesn't drift at all.
  useEffect(() => {
    const row = rowRef.current;
    const loop = loopRef.current;
    if (!row || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SPEED = 36; // px per second
    let raf = 0;
    let last = 0;
    let pos = row.scrollLeft;
    let hold = false;
    let resumeAt = 0;
    let visible = false;
    const half = () => (loop.nextElementSibling as HTMLElement).offsetLeft - (row.firstElementChild as HTMLElement).offsetLeft;
    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 0;
      last = t;
      if (visible && !hold && t > resumeAt) {
        // Pick up wherever a manual scroll left it.
        if (Math.abs(row.scrollLeft - pos) > 2) pos = row.scrollLeft;
        pos += (SPEED * dt) / 1000;
        const h = half();
        if (h > 0 && pos >= h) pos -= h;
        row.scrollLeft = pos;
      } else {
        pos = row.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.1 });
    io.observe(row);
    const stop = () => (hold = true);
    const go = () => {
      hold = false;
      resumeAt = performance.now() + 1200;
    };
    const onScroll = () => {
      // Wrap manual scrolling too, so it never runs out at either end.
      const h = half();
      if (h <= 0) return;
      if (row.scrollLeft >= h * 1.5) row.scrollLeft -= h;
      else if (row.scrollLeft <= 1 && hold) row.scrollLeft += h;
    };
    row.addEventListener("pointerenter", stop);
    row.addEventListener("pointerleave", go);
    row.addEventListener("touchstart", stop, { passive: true });
    row.addEventListener("touchend", go);
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      row.removeEventListener("pointerenter", stop);
      row.removeEventListener("pointerleave", go);
      row.removeEventListener("touchstart", stop);
      row.removeEventListener("touchend", go);
      row.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Drag to scroll with a mouse (touch and trackpads scroll natively).
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !rowRef.current) return;
    drag.current = { x: e.clientX, left: rowRef.current.scrollLeft, moved: false };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !rowRef.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    rowRef.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const card = (it: (typeof items)[number], key: string, hidden?: boolean) => (
    <div key={key} className="flex shrink-0" aria-hidden={hidden || undefined}>
      {it.kind === "b" ? <StoryCard story={it.s} layout="recent" loading="lazy" stretch hiddenFromAT={hidden} /> : <InvestorStoryCard t={it.t} />}
    </div>
  );

  return (
    <section className="mx-2 flex flex-col items-center gap-10 overflow-hidden rounded-[16px] bg-[#F7F3ED] py-14 sm:py-20 md:gap-14 md:py-24 lg:py-[120px]">
      <Reveal className="px-4 text-center">
        <AnimatedText as="h2" text="Real stories about Rang De, from both sides" className="font-display text-h3 font-bold text-ink" />
      </Reveal>
      <div
        ref={rowRef}
        role="region"
        aria-label="Stories from borrowers and investors"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => drag.current?.moved && e.preventDefault()}
        className={`flex w-full select-none items-stretch gap-2 overflow-x-auto px-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:px-8 [&::-webkit-scrollbar]:hidden [&_img]:pointer-events-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {items.map((it, i) => card(it, `a${i}`))}
        {/* The second copy starts here; the loop wraps back by exactly this offset. */}
        <div ref={loopRef} className="w-0 shrink-0" aria-hidden />
        {items.map((it, i) => card(it, `b${i}`, true))}
      </div>
    </section>
  );
}

function InvestorStoryCardV6({ t }: { t: Testimonial }) {
  return (
    <div className="flex h-full w-[calc(100vw-32px)] shrink-0 flex-col justify-between gap-8 rounded-[8px] bg-[#084a2f] p-7 transition-transform duration-300 ease-out hover:scale-[1.015] sm:w-[340px] lg:w-[440px]">
      <div className="flex flex-col gap-4">
        <Eyebrow className="text-[#62af1d]">Investor</Eyebrow>
        <p className="font-display text-p2 leading-[26px] text-white/72">
          {t.quote.map((s, i) => (
            <span key={i} className={s.emphasized ? "font-bold text-white" : undefined}>
              {s.text}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-white/16 pt-5">
        <Image src={t.avatar} alt="" width={48} height={48} className="size-[48px] rounded-[8px] border-2 border-white object-cover" />
        <div className="flex flex-col">
          <p className="font-display text-p2 font-bold text-white">{t.name}</p>
          {(t.since || t.role) && <p className="font-display text-p4 font-medium text-white/64">{t.since ?? t.role}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Figma 2730:10: "Real stories about Rang De, from both sides" — borrower and investor cards kept
 * separate (they are not pairs), alternating: a borrower's story, then an investor's.
 */
// This section's borrower photos (portraits against a wall, in place of the story avatars).
const BOTH_SIDES_AVATARS: Record<string, string> = {
  "Sitara Devi": "/images/stories/avatars/sitara-devi.webp",
  "Neilhoupe u Koza": "/images/stories/avatars/neilhoupe-u-koza.webp",
  Sivakumar: "/images/stories/avatars/sivakumar.webp",
  "Gita Devi": "/images/stories/avatars/gita-devi.webp",
};
const ENTER_STAGGER = 0.12; // s between cards rising in, left to right
const ENTER_DURATION = 0.7;

/** Version 6's take: new borrower photos, rise-in entrance, grab-to-pause ticker, typed heading. */
export function StoriesBothSidesV6() {
  const investors = [...testimonialsRow1, ...testimonialsRow2];
  const items: ({ kind: "b"; s: Story } | { kind: "i"; t: Testimonial })[] = [];
  recentStories.forEach((s, i) => {
    items.push({ kind: "b", s: { ...s, avatar: BOTH_SIDES_AVATARS[s.name ?? ""] ?? s.avatar } });
    items.push({ kind: "i", t: investors[i] });
  });
  const rowRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const grabbed = useRef(false);
  const reduce = useReducedMotion();
  // The heading fills in as it comes up the screen, finishing as it reaches three quarters of the way
  // up; at that moment the cards rise into place one after another, left to right, and only then
  // does the row start drifting. Never again after that.
  const headingRef = useRef<HTMLDivElement>(null);
  const entered = useInView(headingRef, { once: true, margin: "0px 0px -25% 0px" });
  const drifting = useRef(false);
  useEffect(() => {
    if (!entered) return;
    const id = setTimeout(() => (drifting.current = true), reduce ? 0 : (4 * ENTER_STAGGER + ENTER_DURATION) * 1000);
    return () => clearTimeout(id);
  }, [entered, reduce]);

  // The row drifts on its own (a seamless loop over two copies of the cards), and stays a normal
  // scroller: trackpad, swipe, or drag with the mouse. It keeps drifting under the mouse; it holds
  // still only while the cards are grabbed (mouse held down, or a finger on them), and while off
  // screen. With reduced motion it doesn't drift at all.
  useEffect(() => {
    const row = rowRef.current;
    const loop = loopRef.current;
    if (!row || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SPEED = 36; // px per second
    let raf = 0;
    let last = 0;
    let pos = row.scrollLeft;
    let hold = false;
    let resumeAt = 0;
    let wasGrabbed = false;
    let visible = false;
    const half = () => (loop.nextElementSibling as HTMLElement).offsetLeft - (row.firstElementChild as HTMLElement).offsetLeft;
    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 0;
      last = t;
      // Let go of a grab: pick up again a moment later.
      if (wasGrabbed && !grabbed.current) resumeAt = t + 1200;
      wasGrabbed = grabbed.current;
      if (visible && drifting.current && !hold && !grabbed.current && t > resumeAt) {
        // Pick up wherever a manual scroll left it.
        if (Math.abs(row.scrollLeft - pos) > 2) pos = row.scrollLeft;
        pos += (SPEED * dt) / 1000;
        const h = half();
        if (h > 0 && pos >= h) pos -= h;
        row.scrollLeft = pos;
      } else {
        pos = row.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.1 });
    io.observe(row);
    const stop = () => (hold = true);
    const go = () => {
      hold = false;
      resumeAt = performance.now() + 1200;
    };
    const onScroll = () => {
      // Wrap manual scrolling too, so it never runs out at either end.
      const h = half();
      if (h <= 0) return;
      if (row.scrollLeft >= h * 1.5) row.scrollLeft -= h;
      else if (row.scrollLeft <= 1 && hold) row.scrollLeft += h;
    };
    row.addEventListener("touchstart", stop, { passive: true });
    row.addEventListener("touchend", go);
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      row.removeEventListener("touchstart", stop);
      row.removeEventListener("touchend", go);
      row.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Drag to scroll with a mouse (touch and trackpads scroll natively).
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !rowRef.current) return;
    drag.current = { x: e.clientX, left: rowRef.current.scrollLeft, moved: false };
    grabbed.current = true;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !rowRef.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    rowRef.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current = null;
    grabbed.current = false;
    setDragging(false);
  };

  const card = (it: (typeof items)[number], key: string, index: number, hidden?: boolean) => (
    <motion.div
      key={key}
      className="flex shrink-0"
      aria-hidden={hidden || undefined}
      initial={reduce ? false : { y: 80, opacity: 0 }}
      animate={entered || reduce ? { y: 0, opacity: 1 } : undefined}
      // Left to right; the copy that follows off screen just comes in with the last ones.
      transition={{ duration: ENTER_DURATION, delay: Math.min(index, 5) * ENTER_STAGGER, ease: [0.22, 1, 0.36, 1] }}
    >
      {it.kind === "b" ? <StoryCard story={it.s} layout="recent" loading="lazy" stretch hiddenFromAT={hidden} /> : <InvestorStoryCardV6 t={it.t} />}
    </motion.div>
  );

  return (
    <section className="mx-2 flex flex-col items-center gap-10 overflow-hidden rounded-[16px] bg-[#F7F3ED] py-14 sm:py-20 md:gap-14 md:py-24 lg:py-[120px]">
      <div ref={headingRef} className="px-4 text-center">
        {/* Fills in letter by letter, from entering the screen to three quarters of the way up. */}
        <ScrollInk as="h2" text="Real stories about Rang De, from both sides" offset={["start 1", "start 0.75"]} className="font-display text-h3 font-bold" />
      </div>
      <div
        ref={rowRef}
        role="region"
        aria-label="Stories from borrowers and investors"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => drag.current?.moved && e.preventDefault()}
        // Room above and below (taken back with negative margins) so a card growing on hover isn't
        // clipped by the scroller's edges.
        className={`-my-4 flex w-full select-none items-stretch gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:px-8 [&::-webkit-scrollbar]:hidden [&_img]:pointer-events-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {items.map((it, i) => card(it, `a${i}`, i))}
        {/* The second copy starts here; the loop wraps back by exactly this offset. */}
        <div ref={loopRef} className="w-0 shrink-0" aria-hidden />
        {items.map((it, i) => card(it, `b${i}`, items.length + i, true))}
      </div>
    </section>
  );
}

/* ───────────────────────── v4: sections from Ram's draft that had no build yet ───────────────────────── */

// Small on both sides: the least an investor can lend (rangde.in's ₹500 minimum, as on the site's
// "Start with ₹500"), and a real small loan from rangde.in's published success stories. Gita Devi's
// ₹20,000 isn't repeated here: Version 4's outcome chain follows her loan already.
const SMALL_LOANS: { amount: string; name?: string; avatar?: string; what: string; then: string }[] = [
  { amount: "₹500", what: "The least you can lend", then: "Your share, alongside other social investors" },
  { amount: "₹30,000", name: "Sitara Devi", avatar: "/images/stories/story-4-avatar.webp", what: "Opened her own cosmetics store", then: "Now earns ₹12,000 a month" },
];

/** Ram's "Why it matters": a few thousand rupees can change a business — small on the investor's side and the borrower's. */
export function SmallMoney() {
  return (
    <section className="mx-2 rounded-[16px] bg-white px-5 py-14 sm:px-8 sm:py-20 md:py-24 lg:py-[120px]">
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow className="text-green-dark">Why it matters</Eyebrow>
          <AnimatedText as="h2" text="A few thousand rupees can change a business." className="font-display text-h3 font-bold text-ink" />
          <p className="max-w-[480px] font-display text-p2 font-medium text-ink/80">
            Across India, people with the ability to build a livelihood are held back by one thing: no easy access to formal credit. What they need often isn&rsquo;t millions.
          </p>
          <p className="font-display text-p2 font-bold text-ink">The money may be small. What it makes possible isn&rsquo;t.</p>
        </Reveal>
        <div className="flex flex-col gap-3">
          {SMALL_LOANS.map((l, i) => (
            <Reveal key={l.amount} delay={0.1 + i * 0.12}>
              <div className="flex items-center gap-4 rounded-[16px] bg-[#F7F3ED] p-4 sm:gap-5 sm:p-5">
                <div className="relative flex size-[56px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#cbe0b8] text-green-dark ring-2 ring-white">
                  {l.avatar ? (
                    <Image src={l.avatar} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <span className="font-display text-h4 font-bold">₹</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-h4 font-bold text-green-dark">{l.amount}</p>
                  <p className="font-display text-p3 font-bold text-ink sm:text-p2">{l.what}</p>
                  <p className="font-display text-p4 font-medium text-ink/64">{l.name ? `${l.name} · ${l.then}` : l.then}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveFigure({ value, format, label, start, delay }: { value: number; format: (n: number) => string; label: string; start: boolean; delay: number }) {
  const n = useAnimatedNumber(start ? value : 0, { duration: 1400, delay, enabled: true });
  return (
    <div className="flex flex-col gap-1 rounded-[12px] bg-white/8 p-4 sm:p-5">
      <p className="font-display text-[26px] font-bold leading-[32px] text-white tabular-nums sm:text-h4">{format(n)}</p>
      <p className="font-display text-p4 font-medium text-white/72">{label}</p>
    </div>
  );
}

/**
 * Ram's "We think you should see where your money goes", with the real live figures: rangde.in's own
 * public stats feed (lib/stats.ts, refreshed every 10 minutes), counting up when the section comes in.
 */
/** `after` (v2): more of the section under the figures, past a divider (the infrastructure points). */
/** `inked` (Version 2): the heading fills in letter by letter as it scrolls up, white at 24% → white. */
export function SeeWhereMoneyGoes({ stats, after, inked = false }: { stats: RangDeStats; after?: ReactNode; inked?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const whole = (n: number) => Math.round(n).toLocaleString("en-IN");
  const figures = [
    { value: stats.entrepreneurs, format: whole, label: "Entrepreneurs backed" },
    { value: stats.disbursedCr, format: (n: number) => `₹${n.toFixed(2)} Cr`, label: "Lent to them so far" },
    { value: stats.principalRepaidPct, format: (n: number) => `${n.toFixed(1)}%`, label: "Of principal repaid" },
    { value: stats.investors, format: whole, label: "Social investors" },
    { value: stats.investorsAbroad, format: whole, label: "Of them NRIs and OCIs" },
    { value: stats.states, format: whole, label: "States with active loans" },
  ];
  return (
    <section className="mx-2 rounded-[16px] bg-[#084a2f] px-5 py-14 sm:px-8 sm:py-20 md:py-24 lg:py-[120px]">
      <div ref={ref} className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 md:gap-14">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.88px] text-[#9fd96a]">
            <span className="relative flex size-[8px]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#9fd96a] opacity-60 motion-reduce:animate-none" />
              <span className="relative size-[8px] rounded-full bg-[#9fd96a]" />
            </span>
            Live from Rang De
          </span>
          {inked ? (
            <ScrollInk as="h2" tone="white" text="We think you should see where your money goes." className="max-w-[760px] font-display text-h3 font-bold" />
          ) : (
            <AnimatedText as="h2" text="We think you should see where your money goes." className="max-w-[760px] font-display text-h3 font-bold text-white" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {figures.map((f, i) => (
            <LiveFigure key={f.label} {...f} start={inView} delay={i * 90} />
          ))}
        </div>
        <p className="text-center font-display text-p4 font-medium text-white/56">From Rang De&rsquo;s public platform data, refreshed every 10 minutes.</p>
        {after && (
          <>
            <div className="h-px w-full bg-white/16" />
            <div className="flex justify-center">{after}</div>
          </>
        )}
      </div>
    </section>
  );
}
