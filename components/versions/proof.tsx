"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { faqGroups } from "@/data/faqs";
import { formatInr } from "@/lib/investment-calculator";
import { LinkButton, SIGNUP_URL } from "./ui";

// Version C ("Proof first") — the two sections this version adds to the homepage's own:
// an honest answer to "what if they can't repay?", and Rang De next to a fixed deposit.
// Facts: live stats feed (lib/stats.ts) and the verbatim rangde.in FAQ answers (data/faqs.ts).

const EASE = [0.22, 1, 0.36, 1] as const;
const faqAnswer = (q: string) => faqGroups.flatMap((g) => g.faqs).find((f) => f.question === q)?.answer ?? "";

const FACES = ["Rekha-42-img.jpg", "Vijay-004-img.jpg", "manawrmonika037-img.jpg"].map(
  (f) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=96&h=96&fit=facearea&facepad=2.2`,
);

/** "What if a borrower can't repay?" — the big track-record number, then the honest answer. */
export function HonestAnswer() {
  const { principalRepaidPct, entrepreneurs } = useRangDeStats();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const show = !!reduce || inView;
  const guards = [
    { title: "A local partner knows them", text: "Impact partners identify every borrower in the communities they already work with." },
    { title: "They are mentored to repay", text: "Partners stay with them, helping them use the loan well and keep to the schedule." },
    { title: "You see the risk upfront", text: "Every loan shows its credit rating, rate and tenure before you invest a rupee." },
  ];

  return (
    <section className="relative mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-16 sm:px-8 md:py-24">
      <div ref={ref} className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-12">
        <AnimatedText
          as="h2"
          segments={[
            { text: "What if a borrower can’t repay?", className: "text-ink" },
            { text: "Here is the honest answer.", className: "text-green-dark" },
          ]}
          className="max-w-[820px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />

        <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
          {/* The proof: a big ring filling to the share of principal repaid. */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative size-[220px] sm:size-[260px]">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(41,45,54,0.08)" strokeWidth="10" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--color-green-dark)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  pathLength={1}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={show ? { pathLength: principalRepaidPct / 100 } : undefined}
                  transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-h2 font-bold text-green-dark">{principalRepaidPct.toFixed(1)}%</p>
                <p className="font-display text-p4 font-bold uppercase tracking-[0.88px] text-ink/72">of principal repaid</p>
              </div>
            </div>
            <p className="max-w-[300px] font-display text-p3 font-medium text-ink/80">
              Across {entrepreneurs.toLocaleString("en-IN")} loans to rural entrepreneurs since 2019.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {guards.map((g, i) => (
              <motion.div
                key={g.title}
                className="flex items-start gap-4 rounded-[12px] bg-white p-5 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_6px_16px_rgba(41,45,54,0.06)]"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={show ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.3 + i * 0.15, ease: EASE }}
              >
                <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-green-dark font-display text-p3 font-bold text-white">{i + 1}</span>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-p2 font-bold text-ink">{g.title}</p>
                  <p className="font-display text-p3 font-medium text-ink/80">{g.text}</p>
                </div>
              </motion.div>
            ))}
            <details className="group rounded-[12px] border border-ink/16 bg-white/60 p-5">
              <summary className="cursor-pointer list-none rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark font-display text-p3 font-bold text-ink marker:hidden">
                <span className="inline-flex items-center gap-2">
                  Read Rang De&rsquo;s full answer
                  <svg viewBox="0 0 24 24" className="size-[16px] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </summary>
              <p className="mt-3 font-display text-p3 font-medium text-ink/80">{faqAnswer("How does Rang De ensure that I get my money back?")}</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

const ROWS: { label: string; fd: string; rd: string }[] = [
  { label: "Where it goes", fd: "Sits with your bank", rd: "To a vetted rural entrepreneur" },
  { label: "Returns", fd: "A fixed rate set by your bank", rd: "Up to 8.5% p.a., shown on each loan" },
  { label: "How it comes back", fd: "At maturity, or as payouts", rd: "As they repay, as credit to reinvest or withdraw" },
  { label: "Safety", fd: "Deposit insurance up to ₹5 lakh per bank", rd: "" },
  { label: "Starts at", fd: "Set by your bank", rd: "₹500" },
  { label: "Also builds", fd: "—", rd: "Someone’s livelihood" },
];

/** Rang De beside a fixed deposit: flip between the two with one tap, or see both on desktop. */
export function FdOrRangDe() {
  const [side, setSide] = useState<"fd" | "rd">("rd");
  const { principalRepaidPct } = useRangDeStats();
  const rows = ROWS.map((r) => (r.label === "Safety" ? { ...r, rd: `Not guaranteed; ${principalRepaidPct.toFixed(1)}% of principal repaid so far` } : r));
  const amount = 10_000;
  const card = (which: "fd" | "rd") => {
    const rd = which === "rd";
    return (
      <div
        className={`flex flex-col gap-5 rounded-[16px] bg-white p-6 sm:p-8 ${
          rd ? "shadow-[0_1px_2px_rgba(41,45,54,0.06),0_12px_32px_rgba(58,110,12,0.14)] ring-2 ring-green-dark/40" : "ring-1 ring-ink/12"
        }`}
      >
        <div className="flex items-center gap-3">
          {rd ? (
            <div className="flex">
              {FACES.map((src, i) => (
                <div key={src} className="relative size-[40px] rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]" style={{ marginLeft: i ? -12 : 0 }}>
                  <Image src={src} alt="" fill unoptimized sizes="40px" className="rounded-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-ink/8 text-ink/72">
              <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
              </svg>
            </span>
          )}
          <div>
            <p className="font-display text-p1 font-bold text-ink">{rd ? "Rang De" : "Fixed deposit"}</p>
            <p className="font-display text-p4 font-medium text-ink/72">Your {formatInr(amount)}…</p>
          </div>
        </div>
        <dl className="flex flex-col divide-y divide-dashed divide-ink/12">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[110px_1fr] gap-3 py-3 sm:grid-cols-[130px_1fr]">
              <dt className="font-display text-p4 font-bold uppercase tracking-[0.6px] text-ink/72">{r.label}</dt>
              <dd className={`font-display text-p3 font-medium ${rd ? "text-ink" : "text-ink/80"}`}>{rd ? r.rd : r.fd}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <section className="relative mx-2 rounded-[16px] bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-10">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Rang De or a fixed deposit?", className: "text-ink" },
            { text: "Many investors keep both.", className: "text-green-dark" },
          ]}
          className="max-w-[820px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />
        {/* Phones: one card at a time, flipped by a toggle. */}
        <div role="group" aria-label="Show" className="inline-flex rounded-full bg-bg-grey p-1 md:hidden">
          {(["rd", "fd"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={side === k}
              onClick={() => setSide(k)}
              className={`min-h-[44px] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-5 font-display text-p3 font-bold ${side === k ? "bg-green-dark text-white" : "text-ink/80"}`}
            >
              {k === "rd" ? "Rang De" : "Fixed deposit"}
            </button>
          ))}
        </div>
        <div className="w-full md:hidden">{card(side)}</div>
        <div className="hidden w-full grid-cols-2 gap-4 md:grid">
          {card("fd")}
          {card("rd")}
        </div>
        <p className="max-w-[760px] rounded-[12px] border-2 border-[#FEC700] bg-[#FFF1C7] px-4 py-3 text-center font-display text-p4 font-medium text-ink">
          Draft for compliance review: confirm every line, especially &ldquo;Safety&rdquo;, before this goes live.
        </p>
      </div>
    </section>
  );
}

export function ClosingCta({ lead, rest, sub }: { lead: string; rest: string; sub: string }) {
  return (
    <section className="relative mx-2 flex flex-col items-center gap-8 rounded-[16px] bg-[#cbe0b8] px-4 py-16 text-center sm:px-8 md:py-24">
      <AnimatedText
        as="h2"
        segments={[
          { text: lead, className: "text-ink" },
          { text: rest, className: "text-green-dark" },
        ]}
        className="max-w-[820px] font-display text-[28px] font-bold leading-[32px] sm:text-h3 sm:leading-[48px]"
      />
      <p className="max-w-[620px] font-display text-p1 font-medium text-ink/80">{sub}</p>
      <LinkButton href={SIGNUP_URL}>Start with ₹500</LinkButton>
    </section>
  );
}
