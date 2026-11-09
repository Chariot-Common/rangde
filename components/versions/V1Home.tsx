import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { heroIntroStories } from "@/lib/content";
import { FoundersCollage } from "./FoundersCollage";
import { PlainQuestionCards } from "./PlainQuestionCards";
import { ProblemShift } from "./ProblemShift";
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
/** Version 1.1. The page is here (rather than in app/v/v1/page.tsx) so a variant can reuse it. */
export function V1Home() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={LEAD} mobileLead={MOBILE_LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent11" />} />
      {/* The problem, then Rang De's answer to each, struck through one by one on scroll (text only). */}
      <ProblemShift />
      <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
      <HowItWorksTabs refined inked bare visual="journey">
        <InvestmentSlider refined />
      </HowItWorksTabs>
      <Testimonials refined inked />
      <FoundersCollage />
      <PlainQuestionCards count={4} flip large phoneHeading="Questions we get often" autoHighlight />
      {/* The way in: the live listings, by individuals, states and funds. */}
      <OpportunitiesSection />
    </div>
  );
}
