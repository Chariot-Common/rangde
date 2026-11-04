"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { HowItWorksStage } from "@/components/how-it-works/HowItWorksStage";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";
import { FaqScene, hasFaqScene } from "@/components/faq/FaqScenes";
import { SourceTip } from "@/components/ui/SourceTip";
import { FAQS_URL } from "@/data/faqs";
import { recentStories, testimonialsRow1, testimonialsRow2, type Story, type Testimonial } from "@/lib/content";
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
 * stories strip. v1.x lead with "Invest in the other Startup India" and keep returns secondary in
 * the line below; v3 is one larger two-tone line with no sub-copy.
 */
export function ApproachHero({ title, lead, below }: { title: ReactNode; lead?: string; below?: ReactNode }) {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? { initial: false as const } : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } };
  return (
    <div className="relative isolate flex w-full flex-col items-center gap-12 overflow-hidden px-4 pt-[100px] sm:px-2 sm:pt-12 md:pt-16 lg:gap-16 lg:pt-[64px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[33px] -z-10 h-[1040px] w-[1040px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_250px_rgba(254,199,0,0.64)] sm:top-[-95px] sm:h-[650px] sm:w-[650px] md:top-[-125px] md:h-[850px] md:w-[850px] lg:top-[-174px] lg:h-[1250px] lg:w-[1250px]"
      />
      <motion.div className="flex w-full max-w-[920px] flex-col items-center gap-2 text-center" {...fade(0)}>
        {title}
        {lead && <p className="max-w-[320px] font-display text-p1 font-medium text-ink/80 [text-wrap:balance] sm:max-w-[820px]">{lead}</p>}
      </motion.div>
      <motion.div className="w-full max-w-[1200px]" {...fade(0.25)}>
        <HeroStats />
      </motion.div>
      <motion.div className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]" {...fade(0.4)}>
        <StoryCarousel items={recentStories} layout="recent" />
      </motion.div>
      {below}
    </div>
  );
}

/** v3: press, awards and backers as social proof (Figma 2719:51429, grey placeholders there too). */
export function PressRow() {
  return (
    <div className="flex w-full flex-col items-center gap-4 border-b border-ink/8 pb-12">
      <Eyebrow className="text-ink/56">Featured in, awarded and backed by</Eyebrow>
      <div className="flex w-full flex-wrap justify-center gap-3 overflow-hidden sm:gap-6 lg:flex-nowrap">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex h-[56px] w-[120px] shrink-0 items-center justify-center rounded-[8px] bg-[#e5e5e5] font-display text-[11px] font-bold uppercase tracking-[0.88px] text-ink/40 sm:h-[80px] sm:w-[160px]">
            Logo
          </div>
        ))}
      </div>
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

function PointText({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : "tip" in p ? (
          <SourceTip key={i} source={p.source}>
            {p.tip}
          </SourceTip>
        ) : (
          <strong key={i} className="font-bold text-ink">
            {p.bold}
          </strong>
        ),
      )}
    </>
  );
}

const PENDING_SOURCE = "Source to be confirmed before this goes live.";

export const PROBLEM_POINTS: Point[] = [
  {
    title: "Banks won’t lend to them",
    icon: "/images/why-rangde-v2/icon-bank.webp",
    text: [
      { tip: "Fewer than 15%", source: PENDING_SOURCE },
      " of Indians have access to formal credit. Without a credit history or land as collateral, a business loan is out of reach, even if the business is sound.",
    ],
  },
  {
    title: "Informal loans cost more",
    icon: "/images/why-rangde-v2/icon-banknotes.webp",
    text: [
      "What’s left is moneylenders and MFIs that lend at ",
      { tip: "20–30% interest rates", source: PENDING_SOURCE },
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

export const INFRA_POINTS: Point[] = [
  { title: "Regulated", icon: "/images/why-rangde-v2/icon-shield-check.webp", text: ["Built within India’s RBI-regulated P2P lending framework."] },
  { title: "Curated", icon: "/images/why-rangde-v2/icon-target-center.webp", text: ["Borrowers are screened and authenticated diligently."] },
  { title: "Transparent", icon: "/images/why-rangde-v2/icon-map.webp", text: ["You see where your money goes and follow its progress."] },
  { title: "Credit-linked", icon: "/images/why-rangde-v2/icon-bar-chart.webp", text: ["Repayments build borrowers’ formal credit histories."] },
];

/** Three (or four) illustrated points in a row: Figma 2687:22322 (problem), 2687:22321 (solution), 2718:46885 (infrastructure). */
export function PointsGrid({ points, size = "lg" }: { points: Point[]; size?: "lg" | "sm" }) {
  const lg = size === "lg";
  return (
    <div className={`grid w-full max-w-[1200px] grid-cols-1 gap-10 sm:grid-cols-2 ${points.length === 4 ? "lg:grid-cols-4" : "md:grid-cols-3"} md:gap-12`}>
      {points.map((p, i) => (
        <Reveal key={p.title} delay={i * 0.08} className={`flex flex-col items-center text-center ${lg ? "gap-6" : "gap-4"}`}>
          <div className={`relative flex shrink-0 items-center justify-center rounded-full bg-white/72 ${lg ? "size-[120px] md:size-[160px]" : "size-[80px]"}`}>
            {p.icon && <Image src={p.icon} alt="" width={lg ? 96 : 48} height={lg ? 96 : 48} unoptimized className={lg ? "size-[72px] md:size-[96px]" : "size-[48px]"} />}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className={`font-display font-bold text-ink ${lg ? "text-p1" : "text-p2"}`}>{p.title}</h3>
            <p className="font-display text-p2 font-medium leading-[24px] text-ink/80">
              <PointText parts={p.text} />
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** A full section: heading (optional eyebrow) over a PointsGrid. tone "green" is the Figma green/light card. */
export function PointsSection({ eyebrow, heading, points, tone = "plain", children }: { eyebrow?: string; heading: ReactNode; points: Point[]; tone?: "plain" | "green" | "cream"; children?: ReactNode }) {
  const bg = tone === "green" ? "bg-[#cbe0b8]" : tone === "cream" ? "bg-[#F7F3ED]" : "bg-[#f1f2f5]";
  return (
    <section className={`mx-2 flex flex-col items-center gap-12 rounded-[16px] px-4 py-20 sm:px-8 md:gap-16 md:py-24 lg:py-[120px] ${bg}`}>
      <Reveal className="flex max-w-[1200px] flex-col items-center gap-2 text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">{heading}</h2>
      </Reveal>
      <PointsGrid points={points} />
      {children}
    </section>
  );
}

/* ───────────────────────── v1.2: platform + calculator ───────────────────────── */

/** v1.2's solution card (Figma 2718:46710): what Rang De is, then the returns slider right inside it. */
export function PlatformCalculator() {
  return (
    <section className="relative z-10 mx-2 flex flex-col items-center gap-12 rounded-[16px] bg-[#cbe0b8] px-4 py-20 sm:px-8 md:gap-16 md:py-24 lg:py-[120px]">
      <Reveal className="flex max-w-[1100px] flex-col items-center gap-3 text-center">
        <Eyebrow>India’s first direct social investment platform</Eyebrow>
        <h2 className="font-display text-[24px] font-bold leading-[28px] text-ink [text-wrap:balance] sm:text-h4 md:text-[36px] md:leading-[44px]">
          Rang De empowers you to directly fund rural entrepreneurs across India.{" "}
          <span className="text-green-dark">Your money helps them access credit and build a formal credit history, while you earn returns.</span>
        </h2>
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
        <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">
          With Rang De, you’re not just giving someone a loan. You’re helping them build their financial future.
        </h2>
      </div>
      <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 md:gap-4">
        {CHAIN.map((step, i) => (
          <motion.li
            key={step}
            className="flex items-center gap-3 md:gap-4"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.45, delay: i * 0.18, ease: EASE }}
          >
            {i > 0 && <Image src="/images/approaches/chain-arrow.svg" alt="" width={24} height={16} unoptimized aria-hidden className="h-[16px] w-[24px]" />}
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
const HIW_TABS = [
  { title: "Choose", text: "Explore entrepreneurs looking for a loan.", stage: 0 },
  { title: "Understand", text: "See exactly what they need the money for.", stage: 1 },
  { title: "Lend", text: "Decide whom you want to support.", stage: 2 },
  { title: "Follow", text: "Track the progress of your loans.", stage: 3 },
  { title: "Earn", text: "Get repaid with returns as the loan is repaid.", stage: 3 },
];
const TAB_MS = 7000;

export function HowItWorksTabs({ children, tone = "cream" }: { children?: ReactNode; tone?: "cream" | "white" }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const running = inView && !paused && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % HIW_TABS.length), TAB_MS);
    return () => clearTimeout(id);
  }, [active, running]);

  const tab = HIW_TABS[active];
  return (
    <section
      ref={ref}
      id="how-it-works"
      className={`mx-2 flex flex-col items-center gap-12 rounded-[16px] px-4 py-20 sm:px-8 md:py-24 lg:px-[80px] lg:py-[120px] ${tone === "cream" ? "bg-[#F7F3ED]" : "bg-white"}`}
    >
      <Reveal className="flex max-w-[1200px] flex-col items-center gap-2 text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">Investment to repayment – you’re in control at every step</h2>
      </Reveal>

      <div className="flex w-full max-w-[1200px] flex-col" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="h-[340px] w-full overflow-hidden rounded-[8px] bg-white sm:h-[420px] lg:h-[480px]">
          <HowItWorksStage stepIndex={tab.stage} label={HOW_IT_WORKS_STEPS[tab.stage].illustrationLabel} />
        </div>
        <div role="tablist" aria-label="How it works steps" className="grid grid-cols-5">
          {HIW_TABS.map((t, i) => (
            <button
              key={t.title}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="group relative flex flex-col items-center gap-1 px-1 pt-4 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-4 sm:pt-6"
            >
              <span className="absolute inset-x-0 top-0 h-[4px] bg-ink/16 sm:h-[8px]">
                {i === active && (
                  <motion.span
                    key={`${active}-${running}`}
                    className="absolute inset-y-0 left-0 bg-ink"
                    initial={{ width: running ? "0%" : "100%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: running ? TAB_MS / 1000 : 0, ease: "linear" }}
                  />
                )}
                {i < active && <span className="absolute inset-0 bg-ink/40" />}
              </span>
              <span className={`font-display text-p3 font-bold sm:text-p1 ${i === active ? "text-ink" : "text-ink/56 group-hover:text-ink"}`}>{t.title}</span>
              <span className="hidden font-display text-p3 font-medium text-ink/80 sm:block sm:text-p2">{t.text}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center font-display text-p3 font-medium text-ink/80 sm:hidden">{tab.text}</p>
      </div>

      {children && (
        <>
          <div className="h-px w-full max-w-[1200px] bg-ink/8" />
          {children}
        </>
      )}
    </section>
  );
}

/** "A new way of lending needs serious infrastructure." (Figma 2718:46885), under How it works in v1.2. */
export function InfrastructureRow({ heading = "A new way of lending needs serious infrastructure." }: { heading?: string }) {
  return (
    <div className="flex w-full max-w-[1200px] flex-col items-center gap-10">
      <h3 className="text-center font-display text-h4 font-bold text-ink">{heading}</h3>
      <PointsGrid points={INFRA_POINTS} size="sm" />
    </div>
  );
}

/* ───────────────────────── Question cards ───────────────────────── */

export interface QuestionCard {
  question: string;
  answer: string;
  /** A FaqScene key (components/faq/FaqScenes.tsx) for the visual, when one fits. */
  scene?: string;
  tint: string;
}

// The five questions people ask most, shown as visual cards instead of a long FAQ list.
// Answers are rangde.in's FAQ wording where one exists; "returns" follows Ram's draft.
export const QUESTION_CARDS: QuestionCard[] = [
  {
    question: "Why aren’t Rang De returns higher?",
    tint: "#E8F3DE",
    scene: "How much interest will I earn if I invest?",
    answer:
      "Because Rang De isn’t trying to be the stock market. If your only goal is to maximise financial returns, there are other places to invest. Here your money earns a fair return, up to 8.5% p.a., while it builds businesses, livelihoods, credit histories, families and communities.\n\nThe interest stays fair for the borrower too: that is the whole point. Both are investments. They simply optimise for different outcomes.",
  },
  {
    question: "How secure is the money I put in Rang De?",
    tint: "#DCEFF8",
    scene: "Are returns guaranteed?",
    answer:
      "Rang De works with a set of credible and ethical community organizations or social enterprises called impact partners. These organizations identify communities engaged in sustainable livelihoods, but do not have access to institutional credit. They mentor these communities in effectively utilizing and repaying this credit, leading to an excellent repayment rate on Rang De. However, as per RBI regulations, we cannot guarantee any repayments on the platform.",
  },
  {
    question: "I’m an NRI/OCI. Can I still invest in Rang De?",
    tint: "#E8F3DE",
    scene: "What are the payment options for NRIs and OCI card holders?",
    answer:
      "Yes. Resident Indians, Non-Resident Indians, and Overseas Citizens of India/Persons of Indian Origin with valid KYC documents and Indian bank accounts can invest on Rang De.\n\nWe accept payments in Indian currency from Non Resident Rupee accounts maintained with banks in India. RBI regulations do not permit us to accept payments from overseas bank accounts or international cards issued overseas.",
  },
  {
    question: "What happens if the borrower doesn’t repay?",
    tint: "#DCEFF8",
    scene: "How does the Rang De model work?",
    answer:
      "A local impact partner identifies every borrower in a community it already works with, and stays with them through the loan, mentoring them to use it well and keep to the schedule. You also see each loan’s credit rating, rate and tenure before you invest.\n\nThat is why repayment on Rang De is high. But P2P lending carries risk: if a borrower can’t repay, that part of your principal can be lost, and as per RBI regulations Rang De cannot guarantee repayments. Spreading your money across many borrowers lowers the effect of any one of them.",
  },
  {
    question: "How does Rang De choose who gets a loan?",
    tint: "#E8F3DE",
    scene: "What is unique about Rang De?",
    answer:
      "Before any profile is listed, Rang De and its partners on the ground run an in-depth vetting process: community identification, business assessment, credit evaluation, identity verification and a profile review. Only the borrowers who pass every step are published, with why they need the loan and how they plan to repay it.",
  },
];

/**
 * Figma 2712:38948: the top questions as tall cards with the visual up front (not on click). Tapping
 * one opens it full screen, question and answer beside the visual, like FAQPills' pop-up. A
 * "See all FAQs" link sits under them for everything else.
 */
export function QuestionCards({ heading, count = 4 }: { heading?: string; count?: 4 | 5 }) {
  const cards = QUESTION_CARDS.slice(0, count);
  const [open, setOpen] = useState<QuestionCard | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <section className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-white px-4 py-16 sm:px-8 md:py-20">
      {heading && <h2 className="text-center font-display text-h3 font-bold text-ink">{heading}</h2>}
      <div className="-mx-4 flex w-[calc(100%+32px)] snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:w-full sm:px-0 lg:justify-center [&::-webkit-scrollbar]:hidden">
        {cards.map((c, i) => (
          <Reveal key={c.question} delay={i * 0.06} className="shrink-0 snap-center">
            <button
              type="button"
              onClick={() => setOpen(c)}
              className="group relative flex h-[420px] w-[280px] flex-col overflow-hidden rounded-[8px] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:h-[480px] sm:w-[300px] xl:w-[340px]"
              style={{ backgroundColor: c.tint }}
            >
              <span className="relative z-10 p-8 pr-14 font-display text-p1 font-bold text-ink lg:p-10 lg:pr-16">{c.question}</span>
              <span className="pointer-events-none relative mt-auto block h-[260px] w-full sm:h-[300px]">
                {c.scene && hasFaqScene(c.scene) && <FaqScene question={c.scene} />}
              </span>
              <span aria-hidden className="absolute right-5 top-8 flex size-[36px] items-center justify-center rounded-full bg-white/80 text-ink transition-transform duration-300 group-hover:rotate-90 lg:top-10">
                <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
          </Reveal>
        ))}
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

      <dialog
        ref={ref}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === ref.current && setOpen(null)}
        aria-label={open?.question ?? "Question"}
        className="m-auto h-[min(720px,calc(100svh-32px))] w-[min(1280px,calc(100vw-32px))] overflow-hidden rounded-[16px] bg-white p-0 backdrop:bg-black/56 backdrop:backdrop-blur-sm"
      >
        {open && (
          <>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex size-[40px] items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_1px_4px_rgb(0_0_0/0.12)] hover:brightness-95 lg:right-4 lg:top-4"
            >
              <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="flex h-full flex-col overflow-y-auto lg:grid lg:grid-cols-[1fr_1fr] lg:overflow-hidden">
              <div className="relative aspect-[4/3] w-full shrink-0 lg:aspect-auto lg:h-full" style={{ backgroundColor: open.tint }}>
                {open.scene && hasFaqScene(open.scene) && <FaqScene question={open.scene} />}
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-10 lg:overflow-y-auto lg:p-16">
                <h3 className="font-display text-h3 font-bold text-ink lg:pr-8">{open.question}</h3>
                <p className="whitespace-pre-line font-body text-p2 leading-[28px] text-ink/72">{open.answer}</p>
              </div>
            </div>
          </>
        )}
      </dialog>
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
          <p className="font-display text-h4 font-bold text-ink [text-wrap:balance] md:text-h3">
            Ram and Smita came back from Oxford to build Rang De
            <span className="text-ink/64">, with a simple belief: where you live or how much you earn shouldn’t determine your opportunities to grow.</span>
            <span className="mt-6 block text-ink/64 md:mt-12">Here’s how that works.</span>
          </p>
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
  return (
    <section className="mx-2 flex flex-col items-center gap-10 overflow-hidden rounded-[16px] bg-[#F7F3ED] py-20 md:gap-14 md:py-24 lg:py-[120px]">
      <Reveal className="px-4 text-center">
        <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">Real stories about Rang De, from both sides</h2>
      </Reveal>
      <div className="flex w-full snap-x snap-mandatory items-stretch gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => (
          <div key={i} className="snap-center">
            {it.kind === "b" ? <StoryCard story={it.s} layout="recent" loading="lazy" /> : <InvestorStoryCard t={it.t} />}
          </div>
        ))}
      </div>
    </section>
  );
}
