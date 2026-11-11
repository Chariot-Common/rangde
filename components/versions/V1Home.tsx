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
import { ApproachHero } from "./approaches";
import { V4HowItWorks } from "./V4HowItWorks";
import { HowItWorksModalButton } from "./HowItWorksModal";
import { TrustList } from "./V6Sections";

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
 * `refresh` (Version 1.1): the lead in three lines and the founders photo's thinner frame. */
// The founders' line from Version 2: when it began and why.
const FOUNDERS_STORY = (
  <>
    They started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow. The idea was to let
    anyone lend a little to the people banks overlook, and see exactly where every rupee goes.
  </>
);

// 11 Nov 2026: the hero → the problem and what Rang De built → the investment calculator → the reels → Version 2's How it
// works (grey card; the real-UI How it works is out, and lives on in the "How it works" pop-up at the end) → the investors →
// the founders, with Version 2's eyebrow and line → as on Version 3: the live opportunities with "How it works" beside
// "Explore all opportunities" and the infrastructure points under a divider in the same card, then the questions with
// "Read more FAQs" and "Talk to our founders".
export function V1Home({ problem = "pairs", refresh = false }: { problem?: "pairs" | "grid"; refresh?: boolean } = {}) {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* The same borrower cards (photos and copy) as Version 5. */}
      <ApproachHero title="Invest in the other Startup India" lead={refresh ? LEAD_V11 : LEAD} mobileLead={MOBILE_LEAD} strip={<StoryCarousel items={heroIntroStories} layout="recent11" />} />
      {/* The problem and Rang De's answer: each problem struck through (or cut) as its answer arrives. */}
      {problem === "grid" ? <ProblemGrid /> : <ProblemPairs />}
      {/* The calculator, on its own card now (it sat under the real-UI How it works, in the same cream). */}
      <section className="mx-2 flex flex-col items-center rounded-[16px] bg-[#F7F3ED] px-4 py-14 sm:px-8 sm:py-20 md:py-24 lg:px-[80px] lg:py-[120px]">
        <InvestmentSlider refined />
      </section>
      <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
      {/* Version 2's How it works, in its grey card; swipe the animation on phones to move between the steps. */}
      <V4HowItWorks swipe />
      <Testimonials refined inked evenRows />
      <FoundersCollage thinFrame={refresh} eyebrow="Why Rang De exists?" story={FOUNDERS_STORY} />
      <OpportunitiesSection roomy secondaryCta={<HowItWorksModalButton />} after={<TrustList inCard />} />
      <PlainQuestionCards count={4} flip navyLink large foundersCall />
    </div>
  );
}
