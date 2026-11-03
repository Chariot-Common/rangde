import type { Metadata } from "next";
import { FAQ } from "@/components/FAQ";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { VersionHero } from "@/components/versions/VersionHero";
import { HomeStatePicker } from "@/components/versions/HomeStatePicker";
import { RepaymentJourney } from "@/components/versions/RepaymentJourney";
import { FromAbroad, HowFromAbroad } from "@/components/versions/nri";
import { ClosingCta } from "@/components/versions/proof";
import { LinkButton } from "@/components/versions/ui";
import { faqGroups } from "@/data/faqs";
import { STATE_OPPORTUNITIES, getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";
import { getRangDeStats, roundedPlus } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version D · Invest back home | Rang De",
  description: "Homepage test version for NRIs and OCI card holders: back an entrepreneur in your home state.",
  robots: { index: false, follow: false },
};

const NRI_FAQ = faqGroups.filter((g) => ["NRIs and OCI holders", "Repayments & interest rates"].includes(g.category));

// Version D: the homepage re-told for NRIs. Same sections and style; the story starts from home.
export default async function NriVersion() {
  const [stats, individuals] = await Promise.all([getRangDeStats(), getIndividualOpportunities()]);
  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <VersionHero
          eyebrow="For NRIs and OCI card holders"
          headline={[{ text: "Invest back home," }, { text: "in someone building a business there", green: false }]}
          lead={`${roundedPlus(stats.investorsAbroad)} investors abroad already lend to rural entrepreneurs across ${stats.states} states. Find your home state and start with ₹500.`}
          actions={
            <>
              <LinkButton href="#home-state">Find your home state</LinkButton>
              <LinkButton href="#how" variant="secondary">
                How NRIs invest
              </LinkButton>
            </>
          }
          below={<HeroStats />}
        />
        <HomeStatePicker individuals={uniqueBorrowers(individuals)} states={STATE_OPPORTUNITIES} />
        <HowFromAbroad />
        <RepaymentJourney title={{ lead: "From Dubai or Dallas ~", rest: "watch your money come back, month after month." }} />
        <FromAbroad />
        <ClosingCta lead="Far from home," rest="still part of it." sub="Start with ₹500, choose someone from your home state, and follow every repayment from wherever you are." />
      </div>
      <FAQ groups={NRI_FAQ} heading="NRI questions" />
    </>
  );
}
