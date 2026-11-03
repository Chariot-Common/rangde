import type { Metadata } from "next";
import { FAQ } from "@/components/FAQ";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { WhyRangDeSteps } from "@/components/sections/why-rangde/WhyRangDeSteps";
import { VersionHero } from "@/components/versions/VersionHero";
import { RepaymentJourney } from "@/components/versions/RepaymentJourney";
import { ClosingCta, FdOrRangDe, HonestAnswer } from "@/components/versions/proof";
import { OtherStartupIndia, WhyNotHigher } from "@/components/versions/idea";
import { LinkButton, SIGNUP_URL } from "@/components/versions/ui";
import { faqGroups } from "@/data/faqs";
import { getRangDeStats, roundedPlus } from "@/lib/stats";
import { getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";

export const metadata: Metadata = {
  title: "Version C · Proof first | Rang De",
  description: "Homepage test version: track record, repayments and safety first.",
  robots: { index: false, follow: false },
};

const PROOF_FAQ = faqGroups.filter((g) => ["Repayments & interest rates", "Investing on Rang De"].includes(g.category));

// Version C: the homepage, reordered and re-told for cautious investors. Every section is
// either the homepage's own or built in its style; only the story's order and emphasis change.
export default async function ProofVersion() {
  const stats = await getRangDeStats();
  const people = uniqueBorrowers(await getIndividualOpportunities()).slice(0, 10);
  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <VersionHero
          eyebrow="RBI regulated · Since 2019"
          headline={[
            { text: `${stats.principalRepaidPct.toFixed(1)}% of principal repaid,` },
            { text: `across ${roundedPlus(stats.entrepreneurs)} rural loans`, green: false },
          ]}
          lead={`${roundedPlus(stats.investors)} social investors lend to vetted rural entrepreneurs through Rang De, and get repaid with interest.`}
          actions={
            <>
              <LinkButton href={SIGNUP_URL}>Start with ₹500</LinkButton>
              <LinkButton href="#opportunities" variant="secondary">
                Meet the founders first
              </LinkButton>
            </>
          }
          below={<HeroStats />}
        />
        <RepaymentJourney />
        <WhyRangDeSteps />
        <HonestAnswer />
        <WhyNotHigher />
        <FdOrRangDe />
        <Testimonials />
        <OtherStartupIndia people={people} />
        <ClosingCta lead="You invest in companies and markets." rest="Now invest in Bharat." sub="In the people building businesses outside the headlines. Start with ₹500." />
        <OpportunitiesSection />
        <ClosingCta lead="Start small." rest="See it come back." sub="Begin with ₹500, choose who you back, and follow every repayment on your dashboard." />
      </div>
      <FAQ groups={PROOF_FAQ} heading="Before you start" />
    </>
  );
}
