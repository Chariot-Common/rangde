import type { Metadata } from "next";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { TypedHero } from "@/components/versions/TypedHero";
import { CursorRangoli } from "@/components/versions/CursorRangoli";
import { ScrollType } from "@/components/versions/ScrollType";
import {
  HowItWorksTabs,
  PointsSection,
  V5_PROBLEM_POINTS,
  QuestionCards,
  V5_SOLUTION_POINTS,
  StackedSections,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 5 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then how it works and the returns.",
  robots: { index: false, follow: false },
};

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";

// Version 5: Version 1.1 (Figma "Home - v1.1", node 2687:14442) reworked with the typed hero intro
// (TypedHero), the cursor rangoli and scroll-typed headings. The other Startup India headline, recent
// stories → the problem, with what Rang De built sliding up over it → reels → How it works with the
// calculator under it → investors → the founders → the top questions as cards.
export default function V5() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CursorRangoli />
      <TypedHero lead={LEAD} />
      <StackedSections
        first={<PointsSection typed heading={"The financial system wasn’t built for the businesses of rural India"} points={V5_PROBLEM_POINTS} />}
        second={<PointsSection typed tone="green" eyebrow="India’s first direct social investment platform" heading="So we built one for them at Rang De" points={V5_SOLUTION_POINTS} />}
      />
      <ReelsWheel heading={<ScrollType as="span" text="The money may be small. What it makes possible isn’t." />} />
      <HowItWorksTabs typed>
        <InvestmentSlider />
      </HowItWorksTabs>
      <Testimonials typed />
      <FoundersSection typed />
      <QuestionCards count={4} />
    </div>
  );
}
