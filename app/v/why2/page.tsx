import type { Metadata } from "next";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero2";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ThreadHow, ThreadTurn, ThreadMoney, ThreadOptions, ThreadProblem, ThreadProof, ThreadClose, Why2Questions, Why2Testimonials } from "@/components/versions/WhyThread2";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist (copy 2) | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told in headings.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-turn", label: "Why Rang De" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
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
        {/* 24 Nov 2026: the numbers now sit inside the options section above, so "This is why Rang De exists" follows it. */}
        <ThreadTurn />
        <ThreadHow />
        <ThreadMoney />
        <ThreadProof />
        <ClearStories met revisedType />
        <Why2Testimonials />
        <Why2Questions />
        {/* 25 Nov 2026: "Read the numbers yourself" (ThreadSources) is off the page, and its chapter with it; the close
            takes its place, on its cream. */}
        <ThreadClose />
      </div>
    </div>
  );
}
