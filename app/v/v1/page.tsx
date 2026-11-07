import type { Metadata } from "next";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { heroIntroStories } from "@/lib/content";
import { StoryCard } from "@/components/versions/PairedStory";
import { PROBLEM_SCENES, SOLUTION_SCENES } from "@/components/versions/story-scenes";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ScrollInk } from "@/components/versions/ScrollInk";
import {
  ApproachHero,
  HowItWorksTabs,
  StackedSections,
  V5_PROBLEM_POINTS,
  V5_SOLUTION_POINTS,
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
// calculator under it → investors → the founders → the top questions as cards. The problem is one card,
// and so is what Rang De built, each scrolled through point by point with a simple chart (ProblemCard.tsx).
export default function V1() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent11" />} />
      {/* ROUGH CUT: two stacked sections, the green solution sliding up over the grey problem; steps left, scene right. */}
      <StackedSections
        first={<StoryCard tone="problem" heading={<ScrollInk as="span" tone="plain" text="The financial system wasn’t built for the businesses of rural India" />} points={V5_PROBLEM_POINTS} scenes={PROBLEM_SCENES} />}
        second={<StoryCard tone="solution" eyebrow="India’s first direct social investment platform" heading={<ScrollInk as="span" tone="plain" text="So we built one for them at Rang De" />} points={V5_SOLUTION_POINTS} scenes={SOLUTION_SCENES} />}
      />
      <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
      <HowItWorksTabs refined inked visual="journey">
        <InvestmentSlider refined />
      </HowItWorksTabs>
      <Testimonials refined inked />
      <FoundersCollage />
      <PlainQuestionCards count={4} flip />
    </div>
  );
}
