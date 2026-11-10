import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { ClosingCta } from "@/components/versions/proof";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { ApproachHero, HowItWorksTabs, QuestionCards, SeeWhereMoneyGoes } from "@/components/versions/approaches";
import { FairReturns, V4HeroCards } from "@/components/versions/V4Sections";
import { V4Cycle } from "@/components/versions/V4Cycle";
import { V4HowItWorks } from "@/components/versions/V4HowItWorks";
import { TrustList } from "@/components/versions/V6Sections";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 2 · Lend to a person | Rang De",
  description: "Homepage test version: Ram's draft, reworked (Figma Home - v4, node 2982:5123).",
  robots: { index: false, follow: false },
};

// Version 2 (Ram's draft, reworked; until 10 Nov 2026 this was Version 2.1, and before that the old Version 4 was here; Figma "Home - v4", node 2982:5123, from Ram's Claude Design draft): "What if you could lend directly to
// another person?" with four real investee cards → how it works (the original pop-up, left and right) → the loan as a
// loop (social investment → business → repayment → credit history → more opportunity) → the Other Startup India, in
// their own reels → you decide who you back (the product, step by step) → the infrastructure → where the money goes
// (live figures) → why returns aren't higher (fair on both sides) → now invest in Bharat → the founders → questions.
export default async function V2() {
  const stats = await getRangDeStats();
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        tone="ink"
        eyebrow="Peer-to-peer social investing"
        title="What if you could lend directly to another person?"
        lead="With Rang De, you can. Lend to people building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns."
        compact
        // No buttons here (they jumped past the rest of the page): the people being funded, and by how many, instead.
        strip={<V4HeroCards />}
        glow={false}
      />
      <V4HowItWorks />
      <V4Cycle />
      <ReelsWheel
        tight
        heading={
          <>
            Meet the Other Startup India.
            <br />
            <span className="text-green-dark">No pitch decks. No valuations. Just people building Bharat.</span>
          </>
        }
      />
      <HowItWorksTabs refined inked bare visual="journey" eyebrow={null} heading="You decide who you back." />
      <TrustList />
      <SeeWhereMoneyGoes stats={stats} />
      <FairReturns />
      <ClosingCta lead="You invest in companies and markets." rest="Now invest in Bharat." sub="In the people building businesses outside the headlines. Start with ₹500." />
      {/* Photos only: the Ashoka Fellow card (from 14 years ago) and the quote card are out. */}
      <FoundersCollage thinFrame />
      <QuestionCards heading="Questions & Answers" count={4} exclude={["Why aren’t Rang De returns higher?"]} />
    </div>
  );
}
