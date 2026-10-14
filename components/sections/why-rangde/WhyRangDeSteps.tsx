"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { STATS_SNAPSHOT as LIVE, roundedPlus } from "@/lib/stats";

/**
 * "Why Rang De?" — three numbered steps joined by a dashed line, told as one story in the
 * present tense: banks say no → Rang De vets the entrepreneur AND gets the loan funded by
 * social investors → the business grows and the money goes round again. Each step has its
 * own little UI with a different shape and weight (a rejected form, a featured two-part
 * card, a typographic impact block) so the row doesn't read as three copies of one card.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
// Real investors from the site's testimonials, shown as the people funding the loan.
const INVESTORS = ["ritika-ojha", "ajay-jain", "shiri-baghar", "kishor-nayar"].map((n) => `/images/testimonials/${n}.webp`);
// Real entrepreneurs from rangde.in's live listings (same set as the calculator).
const ENTREPRENEURS = ["Rekha-42-img.jpg", "Vijay-004-img.jpg", "manawrmonika037-img.jpg", "nitin-jadhav-img.jpg"].map(
  (f) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=80&h=80&fit=facearea&facepad=2.2`,
);

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

function useShow(amount = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();
  return { ref, show: !!reduce || inView, reduce: !!reduce };
}

/* 1 — Banks say no: a compact loan form, slightly askew, stamped "Not eligible". */
function ProblemMock() {
  const { ref, show, reduce } = useShow();
  const rows = [
    ["Credit history", "None"],
    ["Land to pledge", "None"],
    ["Income proof", "Cash only"],
  ];
  return (
    <div ref={ref} className="relative flex w-full items-center justify-center rounded-[16px] bg-[#EFEAE2]/70 px-6 py-10">
      <div className="relative w-full max-w-[250px] -rotate-2 rounded-[12px] bg-white p-4 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_6px_16px_rgba(41,45,54,0.08)]">
        <div className="flex items-center justify-between">
          <p className="font-display text-p4 font-bold text-ink">Bank loan application</p>
          <span className="font-display text-[10px] font-semibold text-ink/40">#2041</span>
        </div>
        <ul className="mt-2 flex flex-col divide-y divide-dashed divide-ink/12">
          {rows.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-1.5 font-display text-[12px] leading-[16px]">
              <span className="text-ink/56">{k}</span>
              <span className="flex items-center gap-1 font-semibold text-ink/72">
                {v}
                <span className="flex size-[14px] items-center justify-center rounded-full bg-[#D93D3D]/10 text-[#D93D3D]">{cross}</span>
              </span>
            </li>
          ))}
        </ul>
        <motion.span
          className="absolute -bottom-3 right-3 rotate-[-8deg] rounded-[6px] border-2 border-[#D93D3D] bg-white px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[1px] text-[#D93D3D]"
          initial={reduce ? false : { opacity: 0, scale: 1.6 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={reduce ? { duration: 0 } : { duration: 0.35, delay: 0.9, ease: EASE }}
        >
          Not eligible
        </motion.span>
      </div>
    </div>
  );
}

/* 2 — Rang De makes it a yes: the featured card, in two halves — vetted on the ground,
   then funded together by social investors and released as credit. */
function AnswerMock() {
  const { ref, show, reduce } = useShow();
  const checks = ["Partner visits her at home", "Business checked on the ground", "Repayment plan agreed"];
  return (
    <div ref={ref} className="relative flex w-full items-center justify-center rounded-[20px] bg-primary/8 px-5 py-8 ring-1 ring-primary/16 lg:px-8">
      <div className="w-full max-w-[340px] overflow-hidden rounded-[16px] bg-white shadow-[0_1px_2px_rgba(41,45,54,0.06),0_12px_32px_rgba(13,170,222,0.14)]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-green/16 text-green-dark">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6" />
              </svg>
            </span>
            <div className="min-w-0 text-left">
              <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/48">Vetted on the ground</p>
              <p className="font-display text-p4 font-bold text-ink">Grocery shop · Madhya Pradesh</p>
            </div>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {checks.map((c, i) => (
              <motion.li
                key={c}
                className="flex items-center gap-2 font-display text-[12px] font-medium leading-[16px] text-ink/80"
                initial={reduce ? false : { opacity: 0, x: -6 }}
                animate={show ? { opacity: 1, x: 0 } : undefined}
                transition={reduce ? { duration: 0 } : { duration: 0.35, delay: 0.5 + i * 0.15, ease: EASE }}
              >
                <span className="flex size-[16px] items-center justify-center rounded-full bg-green-dark text-white">{tick}</span>
                {c}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="border-t border-dashed border-ink/12 bg-[#FAFBFC] p-4">
          <div className="flex items-center justify-between">
            <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/48">Funded by social investors</p>
            <div className="flex">
              {INVESTORS.map((src, i) => (
                <span key={src} className={`relative size-[22px] overflow-hidden rounded-full ring-2 ring-white ${i ? "-ml-1.5" : ""}`}>
                  <Image src={src} alt="" fill sizes="22px" className="object-cover" />
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2.5 h-[8px] overflow-hidden rounded-full bg-ink/8">
            <motion.div
              className="h-full origin-left rounded-full bg-primary"
              initial={reduce ? false : { scaleX: 0 }}
              animate={show ? { scaleX: 1 } : undefined}
              transition={reduce ? { duration: 0 } : { duration: 1.2, delay: 1, ease: EASE }}
            />
          </div>
          <motion.div
            className="mt-3 flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] bg-green-dark font-display text-[12px] font-bold text-white"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={reduce ? { duration: 0 } : { duration: 0.35, delay: 2.1, ease: EASE }}
          >
            {tick} Credit released, at a fair rate
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* 3 — Businesses grow, impact spreads: no card, just a big number with ripples behind it. */
function ImpactMock() {
  const { ref, show, reduce } = useShow();
  return (
    <div ref={ref} className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-green/12 px-6 py-9">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-dark/16"
          style={{ width: 150 + i * 90, height: 150 + i * 90 }}
          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.4 + i * 0.2, ease: EASE }}
        />
      ))}
      <div className="relative flex">
        {ENTREPRENEURS.map((src, i) => (
          <span key={src} className={`relative size-[30px] overflow-hidden rounded-full ring-2 ring-white ${i ? "-ml-2" : ""}`}>
            <Image src={src} alt="" fill unoptimized className="object-cover" />
          </span>
        ))}
      </div>
      <p className="relative mt-3 font-display text-[44px] font-extrabold leading-[48px] tracking-[-1px] text-green-dark">{roundedPlus(LIVE.entrepreneurs)}</p>
      <p className="relative font-display text-p4 font-semibold text-ink/72">entrepreneurs backed</p>
      <div className="relative mt-4 flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 font-display text-[12px] font-semibold text-ink/72">
        <span><b className="font-bold text-ink">{LIVE.states}</b> states</span>
        <span className="size-[3px] rounded-full bg-ink/32" />
        <span><b className="font-bold text-ink">{roundedPlus(LIVE.investors)}</b> investors</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Banks say no",
    text: "Many small businesses have no credit history or land to pledge, so banks turn them away. Moneylenders step in instead, at steep rates.",
    mock: <ProblemMock />,
  },
  {
    title: "Rang De makes it a yes",
    text: "A local partner vets each entrepreneur on the ground. Then social investors across India fund the loan together, so credit reaches them at a fair rate, with training and mentoring alongside.",
    mock: <AnswerMock />,
  },
  {
    title: "Businesses grow, impact spreads",
    text: `Entrepreneurs repay every month and investors earn returns, so the money goes on to fund the next business. So far, that's ${roundedPlus(LIVE.entrepreneurs)} entrepreneurs across ${LIVE.states} states.`,
    mock: <ImpactMock />,
  },
];

/** Each step fades in when it reaches the screen — side by side on desktop they arrive
 * together (staggered by index); stacked on phones each one waits for its own turn. */
function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduce = useReducedMotion();
  const show = !!reduce || inView;
  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center gap-5 text-center"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.1 + index * 0.2, ease: EASE }}
    >
      <span className="flex size-[42px] items-center justify-center rounded-full border border-ink/12 bg-white font-display text-p2 font-bold text-ink shadow-[0_1px_2px_rgba(41,45,54,0.06)]">
        {index + 1}
      </span>
      <div className="flex max-w-[340px] flex-col gap-2">
        <p className="font-display text-[20px] font-bold leading-[26px] text-ink">{step.title}</p>
        <p className="font-display text-p3 font-medium text-ink/64">{step.text}</p>
      </div>
      {step.mock}
    </motion.div>
  );
}

export function WhyRangDeSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduce = useReducedMotion();
  const show = !!reduce || inView;

  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-10 lg:gap-14">
        <div className="flex max-w-[860px] flex-col items-center gap-4 text-center">
          <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-ink/64">Why Rang De?</p>
          <h2 className="font-display text-h3 font-bold text-ink">Businesses in rural areas should have the power to grow!</h2>
          <p className="max-w-[600px] font-display text-p2 font-medium text-ink/64">
            Statistically speaking, a majority of India faces difficulty in accessing credit, which means less autonomy and
            lower chances to grow. That&apos;s where Rang De comes in.
          </p>
        </div>

        <div ref={ref} className="relative grid w-full grid-cols-1 items-start gap-12 md:grid-cols-[1fr_1.3fr_1fr] md:gap-6 lg:gap-10">
          {/* dashed line joining the numbers (desktop/tablet) */}
          <motion.div
            aria-hidden
            className="absolute left-[15%] right-[15%] top-[20px] hidden h-0 origin-left border-t-2 border-dashed border-ink/16 md:block"
            initial={reduce ? false : { scaleX: 0 }}
            animate={show ? { scaleX: 1 } : undefined}
            transition={reduce ? { duration: 0 } : { duration: 1, delay: 0.2, ease: EASE }}
          />
          {STEPS.map((s, i) => (
            <Step key={s.title} step={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
