"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { FounderCallInline } from "@/components/sections/founder-call-cta/FounderCallInline";
import { TestimonialCard } from "@/components/sections/testimonials/TestimonialCard";
import { testimonialsRow1 } from "@/lib/content";
import { FounderTimes } from "./FounderTimes";

// Version D ("Invest back home") — the sections this version adds, in the homepage's style.
// Payment rules follow the verbatim rangde.in FAQ answers (data/faqs.ts, "NRIs and OCI holders").

const EASE = [0.22, 1, 0.36, 1] as const;

const tick = (
  <svg viewBox="0 0 12 12" className="size-[10px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 6.2l2.3 2.3L9.5 3.8" />
  </svg>
);
const cross = (
  <svg viewBox="0 0 12 12" className="size-[9px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M3 3l6 6M9 3l-6 6" />
  </svg>
);

function Row({ ok, children, delay, show, reduce }: { ok: boolean; children: ReactNode; delay: number; show: boolean; reduce: boolean }) {
  return (
    <motion.li
      className="flex items-center justify-between gap-3 py-2 font-display text-[13px] font-medium leading-[18px] text-ink/80"
      initial={reduce ? false : { opacity: 0, x: -6 }}
      animate={show ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : delay, ease: EASE }}
    >
      <span>{children}</span>
      <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full ${ok ? "bg-green-dark text-white" : "bg-[#D93D3D]/12 text-[#B42323]"}`}>
        {ok ? tick : cross}
        <span className="sr-only">{ok ? "accepted" : "not accepted"}</span>
      </span>
    </motion.li>
  );
}

/** How to invest from abroad: three numbered steps on a dashed line, each with its own little UI. */
export function HowFromAbroad() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = !!useReducedMotion();
  const show = reduce || inView;

  const steps: { title: string; text: string; mock: ReactNode }[] = [
    {
      title: "Pay in rupees from India",
      text: "Use your Non Resident Rupee account with a bank in India. RBI rules don’t allow overseas accounts or cards.",
      mock: (
        <ul className="flex flex-col divide-y divide-dashed divide-ink/12">
          <Row ok show={show} reduce={reduce} delay={0.4}>NRE / NRO account in India</Row>
          <Row ok={false} show={show} reduce={reduce} delay={0.55}>Overseas bank account</Row>
          <Row ok={false} show={show} reduce={reduce} delay={0.7}>International card</Row>
        </ul>
      ),
    },
    {
      title: "Verify your KYC once",
      text: "The RBI requires it before any money reaches a borrower. NRIs and OCI/PIO card holders can invest.",
      mock: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-[40px] items-center justify-center rounded-full bg-primary/16 font-display text-p3 font-bold text-ink" aria-hidden>
              You
            </div>
            <div className="text-left">
              <p className="font-display text-p4 font-bold text-ink">Your profile</p>
              <p className="font-display text-[12px] font-medium text-ink/72">Investing from abroad</p>
            </div>
          </div>
          <motion.span
            className="self-start rounded-full bg-green-dark px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.8px] text-white"
            initial={reduce ? false : { opacity: 0, scale: 1.4 }}
            animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.9, ease: EASE }}
          >
            KYC verified
          </motion.span>
        </div>
      ),
    },
    {
      title: "Back someone back home",
      text: "Repayments come back as Rang De credit. Reinvest in someone new, or withdraw to your account.",
      mock: (
        <div className="flex flex-col gap-3">
          <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Rang De credit</p>
          <motion.p
            className="font-display text-h4 font-bold text-green-dark"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 1, ease: EASE }}
          >
            + ₹872
          </motion.p>
          <p className="font-display text-[12px] font-medium text-ink/72">Example: a monthly repayment arrives</p>
          <div className="flex gap-2">
            <span className="rounded-[4px] bg-green-dark px-3 py-1.5 font-display text-[12px] font-bold text-white">Reinvest</span>
            <span className="rounded-[4px] bg-ink/8 px-3 py-1.5 font-display text-[12px] font-bold text-ink">Withdraw</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="relative mx-2 scroll-mt-[calc(var(--navbar-bottom)+8px)] rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-10 lg:gap-14">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Investing from abroad", className: "text-ink" },
            { text: "takes three steps.", className: "text-green-dark" },
          ]}
          className="max-w-[820px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />
        <div ref={ref} className="relative grid w-full grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-6 lg:gap-10">
          <motion.div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[20px] hidden h-0 origin-left border-t-2 border-dashed border-ink/16 md:block"
            initial={reduce ? false : { scaleX: 0 }}
            animate={show ? { scaleX: 1 } : undefined}
            transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : 0.2, ease: EASE }}
          />
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center gap-5 text-center">
              <span className="relative z-10 flex size-[40px] items-center justify-center rounded-full bg-green-dark font-display text-p2 font-bold text-white ring-4 ring-[#F7F3ED]">
                {i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-p1 font-bold text-ink">{s.title}</h3>
                <p className="mx-auto max-w-[320px] font-display text-p3 font-medium text-ink/80">{s.text}</p>
              </div>
              <div className="w-full max-w-[300px] rounded-[12px] bg-white p-4 text-left shadow-[0_1px_2px_rgba(41,45,54,0.06),0_6px_16px_rgba(41,45,54,0.08)]">{s.mock}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Kishor Nayar lends from Texas; then the founders' Q&A, with the time where you live. */
export function FromAbroad() {
  const kishor = testimonialsRow1.find((t) => t.name.startsWith("Kishor Nayar"));
  return (
    <section id="founders" className="relative mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-10 rounded-[16px] bg-white px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <AnimatedText
        as="h2"
        segments={[
          { text: "People lend from all over the world.", className: "text-ink" },
          { text: "Ask the founders anything.", className: "text-green-dark" },
        ]}
        className="max-w-[820px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
      />
      {kishor && (
        <div className="w-full max-w-[720px]">
          <TestimonialCard testimonial={kishor} align="left" variant="grid" />
        </div>
      )}
      <div className="w-full [&>div]:border-t-0 [&>div]:pt-0">
        <FounderCallInline />
      </div>
      <div className="flex w-full max-w-[1100px] flex-col gap-3">
        <p className="text-center font-display text-p3 font-bold text-ink">The next session, where you are</p>
        <FounderTimes />
      </div>
    </section>
  );
}
