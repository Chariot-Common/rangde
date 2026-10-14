"use client";

import type { ReactNode } from "react";
import { useHowItWorks } from "@/components/how-it-works/HowItWorksContext";

/** Tabler line icons (same set as the How it works illustrations). */
const icon = (paths: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {paths}
  </svg>
);

const STEPS = [
  {
    title: "Every entrepreneur is checked",
    body: "Found, selected and verified on the ground.",
    icon: icon(<><path d="M9 12l2 2 4-4" /><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></>),
  },
  {
    title: "You choose who to support",
    body: "Read their story and what their business needs.",
    icon: icon(<><path d="M9 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M19 8v6m3-3h-6" /></>),
  },
  {
    title: "Invest on the 1st or 15th",
    body: "Collected on fixed dates, as per RBI rules.",
    icon: icon(<><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm12-4v4M8 3v4m-4 4h16" /><path d="M8 15h2v2H8z" /></>),
  },
  {
    title: "Get repaid every month",
    body: "Your money comes back, with returns.",
    icon: icon(<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>),
  },
];

/**
 * Bridge between "Why Rang De?" (the problem and our answer) and the rest of the page:
 * a short promise plus the four steps at a glance. The button opens the How it works
 * walkthrough at step 1; each step card opens it straight at that step.
 */
export function HowItWorksCta() {
  const { open } = useHowItWorks();

  return (
    <section
      id="how-it-works"
      className="mx-2 flex flex-col items-center gap-8 rounded-[16px] bg-white px-4 py-12 sm:gap-10 sm:px-8 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-sp12 lg:py-[80px]"
    >
      <div className="flex max-w-[460px] flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-ink/64">New to social investing?</p>
        <h2 className="font-display text-h3 font-bold text-ink">
          See how it works in <span className="text-green-dark">four simple steps</span>
        </h2>
        <p className="font-display text-p2 font-medium text-ink/64">
          From a verified entrepreneur to money back in your account. It takes about a minute.
        </p>
        <button
          type="button"
          onClick={() => open()}
          className="mt-2 inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-primary px-6 font-display text-p3 font-bold text-white transition-[filter] hover:brightness-95"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
          </svg>
          See how it works
        </button>
      </div>

      <ol className="grid w-full max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group flex h-full w-full items-start gap-4 rounded-[12px] border border-ink/8 bg-bg-grey/60 p-4 text-left transition-colors hover:border-green/40 hover:bg-green/8"
            >
              <span className="flex size-[44px] shrink-0 items-center justify-center rounded-[12px] bg-white text-green-dark shadow-[0_1px_2px_rgba(41,45,54,0.08)]">
                {s.icon}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-eyebrow text-[10px] font-semibold uppercase tracking-[1.2px] text-ink/48">Step {i + 1}</span>
                <span className="font-display text-p3 font-bold text-ink">{s.title}</span>
                <span className="font-display text-p4 font-medium text-ink/64">{s.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
