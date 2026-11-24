import type { Metadata } from "next";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero2";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ThreadOptions3 } from "@/components/versions/WhyOptions3";
import { ThreadHow, ThreadTurn, ThreadMoney, ThreadProblem, ThreadProof, ThreadClose, Why2Questions, Why2Testimonials } from "@/components/versions/WhyThread2";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist (copy 3) | Rang De",
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

// /v/why3 (25 Nov 2026): a copy of /v/why2 for reworking it section by section. So far only "What are their options?"
// is new (ThreadOptions3: the four options rise past a pinned heading); everything else is /v/why2's.
export default function WhyPage() {
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
