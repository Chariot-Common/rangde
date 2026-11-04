import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { WhyNotHigher } from "@/components/versions/idea";
import { ClosingCta } from "@/components/versions/proof";
import { ApproachHero, INFRA_POINTS, PeopleStrip, PointsSection, PressRow, QuestionCards, StoriesBothSides } from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 3 · Less said | Rang De",
  description: "Homepage test version: one line, proof, how it works, stories from both sides.",
  robots: { index: false, follow: false },
};

// Version 3 (Figma "Home - v3", node 2719:50454): as little text as possible, and each idea once.
// One line with the stats, the people and the press → how it works (the scroll story) → stories from
// both sides → the infrastructure behind it → why returns aren't higher → "Now invest in Bharat" →
// the founders (as on v1) → the remaining questions as cards.
// Left out on purpose so nothing repeats: the Oxford intro (the founders section tells it), the
// outcome chain (the scroll story already follows one loan through) and the live borrowers (the hero
// strip already shows the people). Those live in Version 4.
export default function V3() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero tone="ink" title="Invest directly in rural entrepreneurs. Help them build credit, while you earn returns." strip={<PeopleStrip />} below={<PressRow />} />
      <StoryHowItWorks />
      <StoriesBothSides />
      <PointsSection tone="cream" heading="A new way of lending needs serious infrastructure." points={INFRA_POINTS} />
      <WhyNotHigher />
      <ClosingCta lead="You invest in companies and markets." rest="Now invest in Bharat." sub="In the people building businesses outside the headlines. Start with ₹500." />
      <FoundersSection />
      <QuestionCards heading="Questions & Answers" count={4} exclude={["Why aren’t Rang De returns higher?"]} />
    </div>
  );
}
