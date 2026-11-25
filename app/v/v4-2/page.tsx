import type { Metadata } from "next";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/v4-2/WhyHero2";
import { ChapterPill } from "@/components/versions/v4-2/WhyRealStory";
import { ThreadOptions3 } from "@/components/versions/v4-2/WhyOptions3";
import { ThreadHow, ThreadTurn, ThreadMoney, ThreadProblem, ThreadProof, ThreadClose, Why2Questions, Why2Testimonials } from "@/components/versions/v4-2/WhyThread2";

export const metadata: Metadata = {
  title: "Version 4.2 · Why we exist | Rang De",
  description: "Homepage test version: why Rang De exists, as /v/why3 stood on 25 Nov 2026.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-turn", label: "Why Rang De" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
] as const;

// Version 4.2 (25 Nov 2026): /v/why3 exactly as it was pushed in a72e7f1, before /v/why3 became Version 4 (/v/v4) and
// the Version 4 reviews changed the shared sections. To keep it that way, its sections come from frozen copies of that
// day's files in components/versions/v4-2/ (WhyThread2, WhyOptions3, FaqAnimations, CreditGrowsScene,
// PlainQuestionCards, WhyHero2, WhyRealStory), not the shared ones. Hero → the problem, with the people-at-work video
// behind it → "What are their options?" with the four options rising past it → "This is why Rang De exists" with the
// four photos in its corners → How it works → one loan, three good things → it's already working → stories →
// testimonials → questions → the close.
export default function V4Point2() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <PhotoRowHero />
      {/* The sections slide up over the hero, which stays put behind them. */}
      <div className="relative z-10 flex flex-col gap-2 bg-white">
        <ChapterPill chapters={CHAPTERS} even compact />
        <ThreadProblem video="/videos/why3/problem.webm" />
        <ThreadOptions3 />
        <ThreadTurn photos />
        <ThreadHow />
        <ThreadMoney />
        <ThreadProof />
        <ClearStories met revisedType />
        <Why2Testimonials />
        <Why2Questions />
        <ThreadClose />
      </div>
    </div>
  );
}
