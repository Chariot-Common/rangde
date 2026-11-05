import type { Metadata } from "next";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { heroIntroStories } from "@/lib/content";
import {
  ApproachHero,
  HowItWorksTabs,
  PointsSection,
  V5_PROBLEM_POINTS,
  QuestionCards,
  V5_SOLUTION_POINTS,
  StackedSections,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 1.1 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then how it works and the returns.",
  robots: { index: false, follow: false },
};

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";

// Version 1.1 (Figma "Home - v1.1", node 2687:14442): the other Startup India headline, recent
// stories → the problem, with what Rang De built sliding up over it → reels → How it works with the
// calculator under it → investors → the founders → the top questions as cards.
export default function V1() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent" />} />
      <StackedSections
        first={<PointsSection heading={"The financial system wasn’t built for the businesses of rural India"} points={V5_PROBLEM_POINTS} />}
        second={<PointsSection tone="green" eyebrow="India’s first direct social investment platform" heading="So we built one for them at Rang De" points={V5_SOLUTION_POINTS} />}
      />
      <ReelsWheel tight heading="The money may be small. What it makes possible isn’t." />
      <HowItWorksTabs refined>
        <InvestmentSlider refined />
      </HowItWorksTabs>
      <Testimonials />
      <FoundersSection photos="v3" talkFirst />
      <QuestionCards count={4} />
    </div>
  );
}
