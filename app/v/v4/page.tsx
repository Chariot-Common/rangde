import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { OtherStartupIndia, OutcomeChain, WhyNotHigher } from "@/components/versions/idea";
import { ClosingCta } from "@/components/versions/proof";
import { LinkButton } from "@/components/versions/ui";
import {
  ApproachHero,
  HowItWorksTabs,
  InfrastructureRow,
  QuestionCards,
  SeeWhereMoneyGoes,
  SmallMoney,
} from "@/components/versions/approaches";
import { getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 4 · Lend to a person | Rang De",
  description: "Homepage test version: Ram's Claude Design draft, section for section, in the site's design.",
  robots: { index: false, follow: false },
};

// Version 4: Ram's Claude Design homepage, in his order, built from the site's own sections and real
// data. "What if you could lend directly to another person?" → one loan, more than one outcome (Gita
// Devi) → a few thousand rupees can change a business → meet the Other Startup India (live borrowers)
// → how it works, with the infrastructure behind it → see where your money goes (live figures) → why
// returns aren't higher → the founders → "Now invest in Bharat" → questions.
// From his draft, left out so nothing is said twice: the second credit chain ("you're not just giving
// someone a loan", covered by the outcome chain) and "what does a loan make possible" (the outcome
// chain and the small-money section already show it, with real people). His placeholder figures are
// replaced by the live ones.
export default async function V4() {
  const [people, stats] = await Promise.all([getIndividualOpportunities().then((p) => uniqueBorrowers(p).slice(0, 10)), getRangDeStats()]);
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        tone="ink"
        eyebrow="Peer-to-peer social investing"
        title="What if you could lend directly to another person?"
        lead="With Rang De, you can. Lend to people building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns."
        actions={
          <>
            <LinkButton href="#how-it-works">See how it works</LinkButton>
            <LinkButton href="#people" variant="secondary">
              Meet the people you&rsquo;re backing
            </LinkButton>
          </>
        }
        strip={false}
        glow={false}
      />
      <OutcomeChain />
      <SmallMoney />
      <OtherStartupIndia people={people} />
      <HowItWorksTabs visual="journey" tone="grey">
        <InfrastructureRow />
      </HowItWorksTabs>
      <SeeWhereMoneyGoes stats={stats} />
      <WhyNotHigher />
      {/* Version 1.1's founders collage, with Ram's Ashoka Fellow card and Smita's quote in place of two photos. */}
      <FoundersCollage cards />
      <ClosingCta lead="You invest in companies and markets." rest="Now invest in Bharat." sub="In the people building businesses outside the headlines. Start with ₹500." />
      <QuestionCards heading="Questions & Answers" count={4} exclude={["Why aren’t Rang De returns higher?"]} />
    </div>
  );
}
