import type { Metadata } from "next";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { FounderCallCta } from "@/components/sections/founder-call-cta/FounderCallCta";
import {
  ApproachHero,
  CreditChain,
  HowItWorksTabs,
  InfrastructureRow,
  PlatformCalculator,
  PointsSection,
  PROBLEM_POINTS,
  QuestionCards,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 1.2 · The other Startup India | Rang De",
  description: "Homepage test version: the problem, Rang De with the calculator, the credit chain, then how it works.",
  robots: { index: false, follow: false },
};

// Version 1.2 (Figma "Home - v1.2", node 2718:46522): same opening as 1.1, but the solution card
// carries the returns calculator, then "not just a loan" with the credit chain and the reels,
// How it works with the four pillars of infrastructure under it, the founders' call and five
// question cards.
export default function V12() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        title={<h1 className="font-display text-h1 font-bold text-green-dark [text-wrap:balance]">Invest in the other Startup India</h1>}
        lead="Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns."
      />
      <PointsSection heading={<>Our financial system wasn’t built <br className="hidden md:block" />for the businesses of rural India</>} points={PROBLEM_POINTS} />
      <PlatformCalculator />
      <section className="mx-2 rounded-[16px] bg-white pt-20 md:pt-24 lg:pt-[120px]">
        <CreditChain />
      </section>
      <ReelsWheel heading={null} />
      <HowItWorksTabs tone="white">
        <InfrastructureRow />
      </HowItWorksTabs>
      <FounderCallCta />
      <QuestionCards count={5} />
    </div>
  );
}
