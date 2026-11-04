import type { Metadata } from "next";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import {
  ApproachHero,
  CreditChain,
  HowItWorksTabs,
  InfrastructureRow,
  PlatformCalculator,
  PointsSection,
  PROBLEM_POINTS,
  QuestionCards,
  StackedSections,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 1.2 · The other Startup India | Rang De",
  description: "Homepage test version: the problem, Rang De with the calculator, the credit chain, then how it works.",
  robots: { index: false, follow: false },
};

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";

// Version 1.2 (Figma "Home - v1.2", node 2718:46522): the problem, with the Rang De card (and the
// returns calculator) sliding up over it → "not just a loan" with the credit chain and the reels →
// How it works in v1's five-tab layout, played by Durga's journey from the How it works v3 prototype
// (a real listing, light mock UI), with the infrastructure behind it underneath → the founders → five
// question cards.
export default function V12() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero title="Invest in the other Startup India" lead={LEAD} />
      <StackedSections
        first={<PointsSection heading={"Our financial system wasn’t built for the businesses of rural India"} points={PROBLEM_POINTS} />}
        second={<PlatformCalculator />}
      />
      <section className="mx-2 rounded-[16px] bg-white pt-20 md:pt-24 lg:pt-[120px]">
        <CreditChain />
      </section>
      <ReelsWheel heading={null} />
      <HowItWorksTabs visual="journey" tone="grey">
        <InfrastructureRow />
      </HowItWorksTabs>
      <FoundersSection />
      <QuestionCards count={5} />
    </div>
  );
}
