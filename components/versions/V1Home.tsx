import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { heroIntroStories } from "@/lib/content";
import { FoundersCollage } from "./FoundersCollage";
import { PlainQuestionCards } from "./PlainQuestionCards";
import { ProblemGrid } from "./ProblemGrid";
import { ProblemPairs } from "./ProblemPairs";
import { ScrollInk } from "./ScrollInk";
import {
  ApproachHero,
  HowItWorksTabs,
} from "./approaches";

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";
// Version 1.1: three lines from sm up, for the rhythm: "India." ends the first, "credit history," the second, "returns." the third.
const LEAD_V11 =
  "Lend to rural entrepreneurs building businesses across India.\nYour money helps them access credit and build a formal credit history,\nwhile you earn returns.";

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
/** Version 1.1. The page is here (rather than in app/v/v1/page.tsx) so the variants can reuse it.
 * `problem`: "pairs" (v1: three before → after rows, ProblemPairs.tsx) or "grid" (v1-d: six cards, the problems stay and
 * each is answered by a card under it, ProblemGrid.tsx).
 * `refresh` (Version 1.1): the lead in three lines, How it works after the founders, the founders photo's thinner frame. */
export function V1Home({ problem = "pairs", refresh = false }: { problem?: "pairs" | "grid"; refresh?: boolean } = {}) {
  const howItWorks = (
    <HowItWorksTabs refined inked bare visual="journey">
      <InvestmentSlider refined />
    </HowItWorksTabs>
  );
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={refresh ? LEAD_V11 : LEAD} mobileLead={MOBILE_LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent11" />} />
      {/* The problem and Rang De's answer: each problem struck through (or cut) as its answer arrives. */}
      {problem === "grid" ? <ProblemGrid /> : <ProblemPairs />}
      <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
      {!refresh && howItWorks}
      <Testimonials refined inked />
      <FoundersCollage thinFrame={refresh} />
      {/* Version 1.1: How it works comes once the case for Rang De has been made (the stories, the investors, the founders). */}
      {refresh && howItWorks}
      <PlainQuestionCards count={4} flip large phoneHeading="Questions we get often" autoHighlight />
      {/* The way in: the live listings, by individuals, states and funds. */}
      <OpportunitiesSection />
    </div>
  );
}
