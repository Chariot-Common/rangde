"use client";

import Image from "next/image";
import { Fragment, useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cards, stillOf, type Card } from "./WhyRangDeSection";

/**
 * "Why Rang De?" — same three cards and nine points as the original, laid out as a journey:
 * Problem → Solution → Impact, joined by arrows, each card tinted to match its icon. Points
 * are compact rows (icon left, text right) with the key figure in bold. The cards appear one
 * after another the first time the section scrolls into view. Each card's header icon loops;
 * the list icons are still and grey.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP = 0.35; // seconds between cards appearing

const TINT: Record<string, { bg: string; eyebrow: string; ring: string; arrow: string }> = {
  Problem: { bg: "bg-[#FDF0EF]", eyebrow: "text-[#C2362B]", ring: "border-[#C2362B]/12", arrow: "text-[#C2362B]/40" },
  Solution: { bg: "bg-[#EAF5F1]", eyebrow: "text-[#1E7F63]", ring: "border-[#1E7F63]/12", arrow: "text-[#1E7F63]/40" },
  Impact: { bg: "bg-[#FFF5E6]", eyebrow: "text-[#B86E00]", ring: "border-[#B86E00]/12", arrow: "text-[#B86E00]/40" },
};

/** Bold the first figure in a sentence (11%, 8.5% p.a., 65,000+ …). */
function emphasise(text: string): ReactNode {
  const m = text.match(/\d[\d,.]*(?:%|\+)?(?: p\.a\.)?/);
  if (!m || m.index === undefined) return text;
  return (
    <>
      {text.slice(0, m.index)}
      <b className="font-bold text-ink">{m[0]}</b>
      {text.slice(m.index + m[0].length)}
    </>
  );
}

function Arrow({ className, show, delay, reduce }: { className: string; show: boolean; delay: number; reduce: boolean | null }) {
  return (
    <svg viewBox="0 0 40 24" className={`h-6 w-10 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path
        d="M2 12h34M28 4l8 8-8 8"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={show ? { pathLength: 1, opacity: 1 } : undefined}
        transition={reduce ? { duration: 0 } : { duration: 0.5, delay, ease: EASE }}
      />
    </svg>
  );
}

function FlowCard({ card }: { card: Card }) {
  const tint = TINT[card.eyebrow];
  return (
    <div className={`flex h-full flex-col gap-6 rounded-[16px] border ${tint.ring} ${tint.bg} p-6 lg:p-8`}>
      <div className="flex items-center gap-4">
        <div className="relative size-[56px] shrink-0">
          <Image src={card.blob} alt="" fill />
          <div className={`absolute inset-[14px] ${card.blendColorBurn ? "mix-blend-color-burn" : ""}`}>
            <Image src={card.headerIcon} alt="" fill unoptimized />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className={`font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] ${tint.eyebrow}`}>{card.eyebrow}</p>
          <p className="font-display text-p2 font-bold leading-[22px] text-ink lg:text-[20px] lg:leading-[26px]">{card.heading}</p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-ink/8 rounded-[12px] bg-white/72">
        {card.items.map((item) => (
          <li key={item.text} className="flex items-start gap-3 px-4 py-3.5">
            <span className="relative mt-0.5 size-[24px] shrink-0">
              <Image src={stillOf(item.icon)} alt="" fill unoptimized className="grayscale brightness-[0.62]" />
            </span>
            <span className="font-display text-p3 font-medium text-ink/72">{emphasise(item.text)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyRangDeFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const show = !!reduce || inView;

  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 sm:gap-10 lg:gap-12">
        <h2 className="text-center font-display text-h3 font-bold text-ink">Why Rang De?</h2>

        <div ref={ref} className="flex w-full flex-col items-stretch gap-3 lg:flex-row lg:gap-2">
          {cards.map((card, i) => (
            <Fragment key={card.eyebrow}>
              {i > 0 && (
                <div className="flex shrink-0 items-center justify-center lg:w-10">
                  {/* Down on phones/tablets, across on desktop. */}
                  <Arrow className={`rotate-90 lg:rotate-0 ${TINT[cards[i - 1].eyebrow].arrow}`} show={show} delay={i * STEP - 0.1} reduce={reduce} />
                </div>
              )}
              <motion.div
                className="flex-1"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={show ? { opacity: 1, y: 0 } : undefined}
                transition={reduce ? { duration: 0 } : { duration: 0.6, delay: i * STEP, ease: EASE }}
              >
                <FlowCard card={card} />
              </motion.div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
