import type { Metadata } from "next";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero2";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { V4FoundersCard, V4ProblemOptions } from "@/components/versions/WhyV4";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
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
// - It's working: just the heading, the button and the figures; Version 1's founders section before the close;
// - a simpler close (the line, then the Invest button); the live opportunities taken off (25 Nov 2026).
export default function V4() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <PhotoRowHero collage />
      {/* The sections slide up over the hero, which stays put behind them. */}
      {/* 25 Nov 2026 (second review): 8px corners (radius token 4) on every section from "This is why Rang De exists"
          to the founders' card (the testimonials are the section right after the stories), set here so the shared
          sections keep their own corners on the other versions. The founders' card and the FAQ cards set theirs. */}
      <div className="relative z-10 flex flex-col gap-2 bg-white [&>#c-compare]:rounded-4 [&>#c-how]:rounded-4 [&>#c-proof]:rounded-4 [&>#c-stories]:rounded-4 [&>#c-stories+section]:rounded-4 [&>#c-turn]:rounded-4">
        {/* 25 Nov 2026: the pill on laptops and up only; on phones and tablets it sat on the sections' headings. */}
        <ChapterPill chapters={CHAPTERS} even compact desktopOnly />
        <V4ProblemOptions video="/videos/why3/problem.webm" />
        <ThreadTurn photos />
        <ThreadHow plain />
        <ThreadMoney row />
        <ThreadProof bare tabletStack navyButton />
        <ClearStories met revisedType />
        <Why2Testimonials />
        {/* 25 Nov 2026: the founders as one navy card (in place of the close, "The businesses are ready…"), then
            Version 1's live opportunities (without its "serious infrastructure" list) in the nav's colours, then the
            questions. tone="grey" is the card's first version. */}
        <V4FoundersCard tone="navy" />
        <OpportunitiesSection roomy navy />
        <Why2Questions compact />
      </div>
    </div>
  );
}
