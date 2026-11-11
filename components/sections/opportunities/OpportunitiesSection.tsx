import { FUNDS_OPEN, FUND_OPPORTUNITIES, STATE_OPPORTUNITIES, getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";
import { OpportunitiesTabs } from "./OpportunitiesTabs";
import { LiveSignal } from "./LiveSignal";
import { ScrollInk } from "@/components/versions/ScrollInk";
import type { ReactNode } from "react";

/**
 * "Investment opportunities live now" — the live listings from rangde.in, tabbed by
 * Individuals / States / Funds like rangde.in/invest. Server component: the listings are
 * fetched (and revalidated) on the server, only the tab + scroll behaviour ships as JS.
 * `inked` (Version 2): the count line fills in letter by letter as it scrolls up, text grey 16 → text grey 80.
 * `secondaryCta` (Version 3): a second button beside "Explore all opportunities".
 * `after` (Version 3): more content in the same card, under a 1px divider that runs from the card's left padding to
 * its right padding.
 * `roomy` (Version 3): 120px above and below on laptops (80px on tablets, 56px on phones), as Version 3's other sections.
 */
export async function OpportunitiesSection({ inked = false, secondaryCta, after, roomy = false }: { inked?: boolean; secondaryCta?: ReactNode; after?: ReactNode; roomy?: boolean } = {}) {
  // One card (and one in the count) per person, the same rule India After Dark uses, so both
  // sites say the same number of people are waiting.
  const individuals = uniqueBorrowers(await getIndividualOpportunities());

  return (
    <section
      id="opportunities"
      className={`mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-8 overflow-hidden rounded-[16px] bg-[#cbe8f6] sm:gap-10 ${roomy ? "py-14 sm:py-20 lg:py-[120px]" : "py-12 sm:py-16 lg:py-sp12"}`}
    >
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Figma "Section 9": the count in grey, then "Live now" on its own line in ink. */}
        <h2 className="font-display text-h3 font-bold text-ink">
          {inked ? (
            <ScrollInk as="span" tone="grey80" text={`${individuals.length} investment opportunities`} className="block" />
          ) : (
            <span className="block text-ink/72">{individuals.length} investment opportunities</span>
          )}
          <span className="inline-flex items-center gap-3">
            <LiveSignal className="size-[0.85em] shrink-0" />
            Live now
          </span>
        </h2>
      </div>

      {/* The founders' call CTA now lives in the founders section, just before the FAQs. */}
      <OpportunitiesTabs individuals={individuals} states={STATE_OPPORTUNITIES} funds={FUNDS_OPEN ? FUND_OPPORTUNITIES : []} secondaryCta={secondaryCta} />

      {after && (
        <>
          {/* 1px, the card's width less its padding (16px on phones, 32px from sm up). */}
          <div aria-hidden className="h-px w-[calc(100%-32px)] shrink-0 bg-ink/16 sm:my-4 sm:w-[calc(100%-64px)] lg:my-8" />
          {after}
        </>
      )}
    </section>
  );
}
