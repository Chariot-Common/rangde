import type { Metadata } from "next";
import { InvestmentSlider } from "@/components/sections/investment-calculator/InvestmentSlider";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { TypedHero } from "@/components/versions/TypedHero";
import { CursorRangoli } from "@/components/versions/CursorRangoli";
import { ScrollType } from "@/components/versions/ScrollType";
import { ScrollPoints, type ScrollPointItem } from "@/components/versions/ScrollPoints";
import {
  HowItWorksTabs,
  V5_PROBLEM_POINTS,
  QuestionCards,
  V5_SOLUTION_POINTS,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 5 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then how it works and the returns.",
  robots: { index: false, follow: false },
};

const E = (n: string) => `/images/v5-emoji/${n}.webp`;
// Each point's emoji, and how many words of its title come before it (where it sits before it lifts out).
const PROBLEM: ScrollPointItem[] = [
  { emoji: E("bank"), after: 1 }, // Banks · won’t lend to them
  { emoji: E("money-bag"), after: 2 }, // Informal loans · cost more
  { emoji: E("bar-chart"), after: 3 }, // No credit score · built
];
const SOLUTION: ScrollPointItem[] = [
  { emoji: E("investor"), after: 1 }, // Investors · lend to them
  { emoji: E("handshake"), after: 1 }, // Interest · stays fair
  { emoji: E("doc-verified"), after: 1 }, // Repaying · builds credit
];

const LEAD =
  "Lend to rural entrepreneurs building businesses across India. Your money helps them access credit and build a formal credit history, while you earn returns.";

// Version 5: Version 1.1 (Figma "Home - v1.1", node 2687:14442) reworked with the typed hero intro
// (TypedHero), the cursor rangoli and scroll-typed headings. The other Startup India headline, recent
// stories → the problem, with what Rang De built sliding up over it → reels → How it works with the
// calculator under it → investors → the founders → the top questions as cards. From the problem section
// down to the founders it uses Version 1.1's refined sections, keeping its own letter-by-letter headings.
export default function V5() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CursorRangoli />
      <TypedHero lead={LEAD} />
      {/* Two ordinary sections (no longer stacked), their points played by scroll. */}
      <ScrollPoints heading={"The financial system wasn’t built\nfor the businesses of rural India"} points={V5_PROBLEM_POINTS} items={PROBLEM} />
      <ScrollPoints tone="green" eyebrow="India’s first direct social investment platform" heading="So we built one for them at Rang De" points={V5_SOLUTION_POINTS} items={SOLUTION} />
      <ReelsWheel tight heading={<ScrollType as="span" text="The money may be small. What it makes possible isn’t." />} />
      <HowItWorksTabs typed refined>
        <InvestmentSlider refined />
      </HowItWorksTabs>
      <Testimonials typed refined />
      <FoundersSection typed photos="v3" talkFirst />
      <QuestionCards count={4} />
    </div>
  );
}
