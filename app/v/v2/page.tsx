import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { ApproachHero, HowItWorksTabs, InfrastructureRow, SeeWhereMoneyGoes } from "@/components/versions/approaches";
import { V4HeroCards } from "@/components/versions/V4Sections";
import { V4Returns } from "@/components/versions/V4Returns";
import { V4Cycle } from "@/components/versions/V4Cycle";
import { V4HowItWorks } from "@/components/versions/V4HowItWorks";
import { getRangDeStats } from "@/lib/stats";
// Phones: one spacing system for every section (after cruise.money); see the file.
import "./v2-mobile.css";

export const metadata: Metadata = {
  title: "Version 2 · Lend to a person | Rang De",
  description: "Homepage test version: Ram's draft, reworked (Figma Home - v4, node 2982:5123).",
  robots: { index: false, follow: false },
};

// Version 2 (Ram's draft, reworked; until 10 Nov 2026 this was Version 2.1, and before that the old Version 4 was here; Figma "Home - v4", node 2982:5123, from Ram's Claude Design draft): "What if you could lend directly to
// another person?" with four real investee cards → how it works (the original pop-up, left and right) → the loan as a
// loop (social investment → business → repayment → credit history → more opportunity) → the Other Startup India, in
// their own reels → you decide who you back (the product, step by step) → the infrastructure → where the money goes
// (live figures) → why returns aren't higher (fair on both sides) → the founders → live opportunities → questions (both
// from Version 1).
// Phones (as on Version 1): a short lead in two parts with a rule between them; the stats wait under an arrow and open
// as the page is scrolled, so the RBI seal leads straight into the investee cards.
const MOBILE_LEAD = (
  <>
    <p className="font-display text-p1 font-medium text-ink/64">
      <strong className="font-bold text-ink/80">With Rang De, you can.</strong> Lend to people building businesses and livelihoods across rural India.
    </p>
    <hr className="w-full border-0 border-t border-ink/8" />
    <p className="font-display text-p1 font-medium text-ink/64">
      Your money helps them <strong className="font-bold text-ink/80">access credit and build a formal credit history, while you earn returns.</strong>
    </p>
  </>
);

export default async function V2() {
  const stats = await getRangDeStats();
  return (
    <div className="v2-page flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        tone="ink"
        eyebrow="Peer-to-peer social investing"
        title={"What if you could lend\ndirectly to another person?"}
        lead="With Rang De, you can. Lend to people building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns."
        compact
        bigTitle
        mobileLead={MOBILE_LEAD}
        // No buttons here (they jumped past the rest of the page): the people being funded, and by how many, instead.
        strip={<V4HeroCards />}
        glow={false}
      />
      <V4HowItWorks />
      <V4Cycle />
      <ReelsWheel
        tight
        heading={
          // Each line fills in letter by letter as it scrolls up: grey 24 → 100, then green dark 24% → green dark.
          <>
            <ScrollInk as="span" tone="grey" text="Meet the Other Startup India." className="block" />
            <ScrollInk as="span" tone="green" text="No pitch decks. No valuations. Just people building Bharat." className="block" />
          </>
        }
      />
      <HowItWorksTabs refined inked bare visual="journey" eyebrow={null} heading="You decide who you back." />
      {/* The live figures, then the infrastructure behind them in the same green section (white text, animated icons). */}
      <SeeWhereMoneyGoes stats={stats} inked after={<InfrastructureRow badge="#fff" onDark inked />} />
      {/* Why aren't returns higher: what one loan returns, beyond the interest (no comparison with other investments). */}
      <V4Returns />
      {/* Photos only: the Ashoka Fellow card (from 14 years ago) and the quote card are out. */}
      <FoundersCollage
        thinFrame
        roomy
        phoneLayout
        // From the review call: when it began, and how it has grown since (live figures, as in the section above).
        story={
          <>
            They started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow. The idea was to let
            anyone lend a little to the people banks overlook, and see exactly where every rupee goes. Since then, {stats.investors.toLocaleString("en-IN")} social
            investors have lent ₹{Math.round(stats.disbursedCr).toLocaleString("en-IN")} crore to {stats.entrepreneurs.toLocaleString("en-IN")} entrepreneurs across India.
          </>
        }
      />
      {/* From Version 1: the live opportunities (with "See more") right after the founders, then its questions. */}
      <OpportunitiesSection inked />
      <PlainQuestionCards count={4} flip large phoneHeading="Questions we get often" autoHighlight fadeIn />
    </div>
  );
}
