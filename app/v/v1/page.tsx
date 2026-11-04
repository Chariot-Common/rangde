import type { Metadata } from "next";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { FounderCallCta } from "@/components/sections/founder-call-cta/FounderCallCta";
import {
  ApproachHero,
  HowItWorksTabs,
  PointsSection,
  PROBLEM_POINTS,
  QuestionCards,
  SOLUTION_POINTS,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 1.1 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then how it works and the returns.",
  robots: { index: false, follow: false },
};

// Version 1.1 (Figma "Home - v1.1", node 2687:14442): the other Startup India headline, recent
// stories → the problem → what Rang De built, point for point → reels → How it works with the
// calculator under it → investors → the founders' call → the top questions as cards.
export default function V1() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        title={<h1 className="font-display text-h1 font-bold text-green-dark [text-wrap:balance]">Invest in the other Startup India</h1>}
        lead="Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns."
      />
      <PointsSection heading={<>The financial system wasn’t built <br className="hidden md:block" />for the businesses of rural India</>} points={PROBLEM_POINTS} />
      <PointsSection tone="green" eyebrow="India’s first direct social investment platform" heading="So we built one for them at Rang De" points={SOLUTION_POINTS} />
      <ReelsWheel heading="The money may be small. What it makes possible isn’t." />
      <HowItWorksTabs>
        <InvestmentSlider />
      </HowItWorksTabs>
      <Testimonials />
      <FounderCallCta />
      <QuestionCards count={4} />
    </div>
  );
}
