"use client";

import { motion, useReducedMotion } from "motion/react";
import { ScrollInk } from "./ScrollInk";

const EASE = [0.22, 1, 0.36, 1] as const;
const LISTINGS_URL = "https://rangde.in/invest/individuals";

/*
 * Version 6's trust section: the four points from the node graph's settled strip (TrustGraph: white circles, the
 * frame's own icons in the nav's dark blue, on the pale blue), side by side, with no lines and no Rang De logo.
 */
const TRUST = [
  { title: "Regulated", text: "Built within India’s regulated P2P lending framework.", icon: "/brand/trust-regulated.svg" },
  { title: "Curated", text: "Borrowers are screened and authenticated diligently.", icon: "/brand/trust-curated.svg" },
  { title: "Transparent", text: "You see where your money goes and follow its progress.", icon: "/brand/trust-transparent.svg" },
  { title: "Credit-linked", text: "Repayments build borrowers’ formal credit histories.", icon: "/brand/trust-credit-linked.svg" },
];

export function TrustList() {
  const reduce = useReducedMotion();
  return (
    <section className="mx-2 flex flex-col items-center gap-12 rounded-[16px] bg-bg-grey bg-[linear-gradient(var(--color-primary-8),var(--color-primary-8))] px-4 py-14 sm:px-8 sm:py-20 md:gap-16 lg:py-[120px]">
      <ScrollInk as="h2" tone="plain" text="A new way of lending needs serious infrastructure." className="max-w-[820px] text-center font-display text-h3 font-bold [text-wrap:balance]" />
      <ul className="grid w-full max-w-[1280px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {TRUST.map((p, i) => (
          <motion.li
            key={p.title}
            className="flex flex-col items-center gap-5 text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
          >
            <span aria-hidden className="flex size-[96px] items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(3,21,56,0.08)] lg:size-[112px]">
              <span
                className="block size-[44px] bg-nav-navy lg:size-[52px]"
                style={{ WebkitMask: `url(${p.icon}) center / contain no-repeat`, mask: `url(${p.icon}) center / contain no-repeat` }}
              />
            </span>
            <div className="flex max-w-[300px] flex-col gap-2">
              <h3 className="font-display text-[22px] font-bold leading-[28px] text-text-grey-100 lg:text-[24px] lg:leading-[30px]">{p.title}</h3>
              <p className="font-display text-p1 font-medium text-text-grey-64 lg:text-[20px] lg:leading-[28px]">{p.text}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/** The card that closes Version 6: one line and the way into the listings. */
export function ExploreCta() {
  return (
    <section className="mx-2 flex flex-col items-center gap-8 rounded-[16px] bg-[#cbe0b8] px-4 py-16 text-center sm:px-8 md:py-24 lg:py-[120px]">
      <ScrollInk as="h2" tone="plain" text="Find a business to back. Start with ₹500." className="max-w-[820px] font-display text-h3 font-bold [text-wrap:balance]" />
      <a
        href={LISTINGS_URL}
        className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-nav-navy px-8 py-4 font-display text-p1 font-bold text-white transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-grey-100 sm:px-12"
      >
        Explore businesses to invest in
        <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </section>
  );
}
