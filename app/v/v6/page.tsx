import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FounderScroll } from "@/components/versions/FounderScroll";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { PressRow, QuestionCards, StoriesBothSidesV6 } from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 6 · Less said | Rang De",
  description: "Homepage test version: one line, proof, how it works, stories from both sides.",
  robots: { index: false, follow: false },
};

// Version 6: Version 3 (Figma "Home - v3", node 2719:50454) reworked with the coin intro (CoinHero),
// the photo collage and scroll-filled text. As little text as possible, and each idea once.
// The headline with the stats, the gallery and the press → the founders' paragraph → how it works (the
// scroll story) → stories from both sides → the questions as cards. The infrastructure points, "Why
// aren't Rang De returns higher?", "Now invest in Bharat" and the longer founders section were taken
// out to keep the page short.
export default function V6() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CoinHero strip={<CollageStrip />} below={<PressRow />} />
      <FounderScroll />
      {/* Starts filling only once the founders paragraph above has finished. */}
      <StoryHowItWorks heading={<ScrollInk as="span" text="Here’s how that works." offset={["start 0.55", "start 0.2"]} />} />
      <StoriesBothSidesV6 />
      <QuestionCards heading="Questions & Answers" count={4} />
    </div>
  );
}
