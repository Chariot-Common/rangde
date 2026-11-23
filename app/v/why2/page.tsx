import type { Metadata } from "next";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero2";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ThreadEvidence, ThreadHow, ThreadTurn, ThreadMoney, ThreadOptions, ThreadProblem, ThreadProof, ThreadSources, ThreadClose, Why2Questions } from "@/components/versions/WhyThread2";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist (copy 2) | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told in headings.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-evidence", label: "The numbers" },
  { id: "c-turn", label: "Why Rang De" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
  { id: "f-resources", label: "Sources" },
] as const;

// Version 4, "One thread" (20 Nov 2026). Hero → the problem (a line leaves a business and stops short of a bank) → one
// figure as ten dots → how it works (lenders' lines meet at the business, one loops back to you) → three stacked cards
// (funds a business, can earn interest, isn't guaranteed) → proof (heading left, bold cards right) → testimonials →
// questions → sources. Earlier sections (WhyClear's problem, steps, calculator, stories) are off the page, not deleted.
export default function WhyPage() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <PhotoRowHero />
      {/* The sections slide up over the hero, which stays put behind them. */}
      <div className="relative z-10 flex flex-col gap-2 bg-white">
        <ChapterPill chapters={CHAPTERS} even compact />
        <ThreadProblem />
        <ThreadOptions />
        {/* The numbers stay put at the bottom of the screen while "This is why Rang De exists" slides up over them. */}
        <div className="flex flex-col gap-2">
          <ThreadEvidence />
          <div className="relative z-10">
            <ThreadTurn />
          </div>
        </div>
        <ThreadHow />
        <ThreadMoney />
        <ThreadProof />
        <ClearStories met />
        <Testimonials refined inked evenRows heading="Why they lend." />
        <Why2Questions />
        <ThreadSources />
        <ThreadClose />
      </div>
    </div>
  );
}
