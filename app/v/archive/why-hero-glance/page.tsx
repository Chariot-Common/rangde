import type { Metadata } from "next";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ClearProofHeading, ClearResources, ClearStories } from "@/components/versions/WhyClear";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { ClearHero } from "@/components/versions/WhyHero";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ThreadEvidence, ThreadHow, ThreadMoney, ThreadProblem, ThreadProof } from "@/components/versions/WhyThread";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";

export const metadata: Metadata = {
  title: "Version 4, one-glance hero (archived) | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told in headings.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-evidence", label: "The numbers" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
  { id: "f-resources", label: "Sources" },
] as const;

// Version 4, "One thread" (20 Nov 2026). Hero → the problem (a line leaves a business and stops short of a bank) → one
// figure as ten dots → how it works (lenders' lines meet at the business, one loops back to you) → three stacked cards
// (funds a business, can earn interest, isn't guaranteed) → proof (heading left, bold cards right) → testimonials →
// questions → sources. Earlier sections (WhyClear's problem, steps, calculator, stories) are off the page, not deleted.
// Archived 22 Nov 2026: /v/why with the one-glance hero (whole headline at once over a full-bleed photo, with a strip of businesses).
export default function WhyHeroGlancePage() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ClearHero />
      <div className="relative flex flex-col gap-2">
        <ChapterPill chapters={CHAPTERS} />
        <ThreadProblem />
        <ThreadEvidence />
        <ThreadHow />
        <ThreadMoney />
        <ThreadProof />
        <ClearStories />
        <ReelsWheel tight heading={<ClearProofHeading />} />
        <Testimonials refined inked evenRows />
        <PlainQuestionCards count={4} flip navyLink large foundersCall />
        <ClearResources />
      </div>
    </div>
  );
}
