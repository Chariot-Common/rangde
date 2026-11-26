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
 * `navy` (Version 4, 25 Nov 2026): the heading at the page's section heading size (32 / 48 / 56px, as "How it works."),
 * the card in the nav's Login blue (nav sky), and the selected tab and "Explore all opportunities" in the nav's navy, the
 * button at the nav buttons' size.
 * `fresh` (Versions 2 and 3 updates, 26 Nov 2026): `navy`, with the newer cards (FreshCard), on a white card, and the
 * heading as one line, "14 people are raising a loan right now", with the live signal.
 */
export async function OpportunitiesSection({ inked = false, secondaryCta, after, roomy = false, navy: navyProp = false, fresh = false, note }: { inked?: boolean; secondaryCta?: ReactNode; after?: ReactNode; roomy?: boolean; navy?: boolean; fresh?: boolean; /** With `fresh`: a short line under the heading (Version 2 updates: when loans go out). */ note?: string } = {}) {
  const navy = navyProp || fresh;
  // One card (and one in the count) per person, the same rule India After Dark uses, so both
  // sites say the same number of people are waiting.
  const individuals = uniqueBorrowers(await getIndividualOpportunities());

  return (
    <section
      id="opportunities"
      className={`mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-8 overflow-hidden rounded-[16px] sm:gap-10 ${fresh ? "bg-bg-grey" : navy ? "bg-nav-sky" : "bg-[#cbe8f6]"} ${roomy ? "py-14 sm:py-20 lg:py-[120px]" : "py-12 sm:py-16 lg:py-sp12"}`}
    >
      {fresh ? (
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-display text-[12px] font-bold uppercase tracking-[1px] text-ink/72 ring-1 ring-ink/8">
            <LiveSignal className="size-[14px] shrink-0" />
            Live now
          </p>
          <h2 className="max-w-[760px] font-display text-[32px] font-bold leading-[1.06] tracking-[-0.02em] text-ink [text-wrap:balance] md:text-[48px] lg:text-[56px]">
            {individuals.length} people are raising a loan right now.
          </h2>
          {note && <p className="max-w-[560px] font-display text-p2 font-medium text-ink/64 [text-wrap:balance]">{note}</p>}
        </div>
      ) : (
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Figma "Section 9": the count in grey, then "Live now" on its own line in ink. */}
        <h2 className={navy ? "font-display text-[32px] font-bold leading-[1.06] tracking-[-0.02em] text-ink [text-wrap:balance] md:text-[48px] lg:text-[56px]" : "font-display text-h3 font-bold text-ink"}>
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
      )}

      {/* The founders' call CTA now lives in the founders section, just before the FAQs. */}
      <OpportunitiesTabs individuals={individuals} states={STATE_OPPORTUNITIES} funds={FUNDS_OPEN ? FUND_OPPORTUNITIES : []} secondaryCta={secondaryCta} navy={navy} fresh={fresh} />

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
