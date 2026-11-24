import type { Metadata } from "next";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero2";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { V4Close, V4ProblemOptions } from "@/components/versions/WhyV4";
import { ThreadHow, ThreadTurn, ThreadMoney, ThreadProof, Why2Questions, Why2Testimonials } from "@/components/versions/WhyThread2";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version: why Rang De exists, how it works, and the people already lending.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-turn", label: "Why Rang De" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
] as const;

// Version 4 (24 Nov 2026: /v/why3 became Version 4; the old /v/why3 link redirects here). From the review that day:
// - the hero's photos as Version 3's free-form collage, not two even rows;
// - the problem and the options in one pinned section (WhyV4.tsx): "find it difficult to fund their business's growth",
//   then five option cards rising over it (government schemes added), each leading with its point, the numbers folded in;
// - How it works with just that heading, text and animation half and half, the steps bigger;
// - One loan, three good things as three cards in one row;
// - It's working with the founders ("left Oxford for India") in place of the list of facts;
// - a simpler close (the line, then the Invest button), then the businesses raising a loan right now.
export default function V4() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <PhotoRowHero collage />
      {/* The sections slide up over the hero, which stays put behind them. */}
      <div className="relative z-10 flex flex-col gap-2 bg-white">
        <ChapterPill chapters={CHAPTERS} even compact />
        <V4ProblemOptions video="/videos/why3/problem.webm" />
        <ThreadTurn photos />
        <ThreadHow plain />
        <ThreadMoney row />
        <ThreadProof founders />
        <ClearStories met revisedType />
        <Why2Testimonials />
        <Why2Questions />
        <V4Close />
        <OpportunitiesSection roomy />
      </div>
    </div>
  );
}
