import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { heroIntroStories } from "@/lib/content";
import { FoundersCollage } from "./FoundersCollage";
import { PlainQuestionCards } from "./PlainQuestionCards";
import { ProblemShift } from "./ProblemShift";
import { ProblemSideBySide } from "./ProblemSideBySide";
import { ProblemTabs } from "./ProblemTabs";
import { ScrollInk } from "./ScrollInk";
import {
  ApproachHero,
  HowItWorksTabs,
} from "./approaches";

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";

// Phones (Figma "Home - v1.1" mobile, node 2921:2749): two short paragraphs split by a rule, with the key words in bold.
const MOBILE_LEAD = (
  <>
    <p className="font-display text-p1 font-medium text-ink/64">
      <strong className="font-bold text-ink/80">Lend to rural entrepreneurs</strong> building businesses across India.
    </p>
    <hr className="w-full border-0 border-t border-ink/8" />
    <p className="font-display text-p1 font-medium text-ink/64">
      Your money helps them <strong className="font-bold text-ink/80">access credit and build a formal credit history, while you earn returns.</strong>
    </p>
  </>
);

// Version 1.1 (Figma "Home - v1.1", node 2687:14442): the other Startup India headline, recent
// stories → the problem, with what Rang De built sliding up over it → reels → How it works with the
// calculator under it → investors → the founders → the top questions as cards. The problem is one card,
// and so is what Rang De built, each scrolled through point by point with a simple chart (ProblemCard.tsx).
/** `problem`: "stacked" (Version 1.1: the problem and Rang De's answer as two cards side by side, one pair at a time on
 * scroll, ProblemSideBySide.tsx),
 * "tabs" (Version 1.1 B: one section, three tabs, each pair side by side with its scenes, ProblemTabs.tsx) or
 * "shift" (Version 1.1 C: large before → after pairs, no art, ProblemShift.tsx). Everything else is shared. */
export function V1Home({ problem = "stacked" }: { problem?: "stacked" | "tabs" | "shift" }) {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={LEAD} mobileLead={MOBILE_LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent11" />} />
      {/* The problem and Rang De's answer, side by side, one pair at a time on scroll. */}
      {problem === "tabs" ? (
        <ProblemTabs />
      ) : problem === "shift" ? (
        <ProblemShift />
      ) : (
        <ProblemSideBySide />
      )}
      <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
      <HowItWorksTabs refined inked bare visual="journey">
        <InvestmentSlider refined />
      </HowItWorksTabs>
      <Testimonials refined inked />
      <FoundersCollage />
      <PlainQuestionCards count={4} flip large phoneHeading="Questions we get often" autoHighlight />
    </div>
  );
}
