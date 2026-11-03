import { FUNDS_OPEN, FUND_OPPORTUNITIES, STATE_OPPORTUNITIES, getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";
import { OpportunitiesTabs } from "./OpportunitiesTabs";
import { LiveSignal } from "./LiveSignal";

/**
 * "Investment opportunities live now" — the live listings from rangde.in, tabbed by
 * Individuals / States / Funds like rangde.in/invest. Server component: the listings are
 * fetched (and revalidated) on the server, only the tab + scroll behaviour ships as JS.
 */
export async function OpportunitiesSection() {
  // One card (and one in the count) per person, the same rule India After Dark uses, so both
  // sites say the same number of people are waiting.
  const individuals = uniqueBorrowers(await getIndividualOpportunities());

  return (
    <section
      id="opportunities"
      className="mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-8 overflow-hidden rounded-[16px] bg-[#cbe8f6] py-12 sm:gap-10 sm:py-16 lg:py-sp12"
    >
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Figma "Section 9": the count in grey, then "Live now" on its own line in ink. */}
        <h2 className="font-display text-h3 font-bold text-ink">
          <span className="block text-ink/72">{individuals.length} investment opportunities</span>
          <span className="inline-flex items-center gap-3">
            <LiveSignal className="size-[0.85em] shrink-0" />
            Live now
          </span>
        </h2>
      </div>

      {/* The founders' call CTA now lives in the founders section, just before the FAQs. */}
      <OpportunitiesTabs individuals={individuals} states={STATE_OPPORTUNITIES} funds={FUNDS_OPEN ? FUND_OPPORTUNITIES : []} />
    </section>
  );
}
