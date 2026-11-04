import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { FounderCallCta } from "@/components/sections/founder-call-cta/FounderCallCta";
import {
  ApproachHero,
  FounderOrigin,
  INFRA_POINTS,
  PointsSection,
  PressRow,
  QuestionCards,
  StoriesBothSides,
} from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 3 · Less said | Rang De",
  description: "Homepage test version: one line, proof, the founders’ story, then stories from both sides.",
  robots: { index: false, follow: false },
};

// Version 3 (Figma "Home - v3", node 2719:50454): as little text as possible. One two-tone line,
// the stats and recent stories, press and backers, the founders came back from Oxford → "here’s
// how that works" (the scroll story from the earlier Version B) → stories from both sides,
// alternating → the infrastructure behind it → the founders' call → Questions & Answers.
export default function V3() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        title={
          <h1 className="font-display text-h2 font-bold text-ink [text-wrap:balance]">
            Invest directly in rural entrepreneurs. <span className="text-ink/64">Help them build credit, while you earn returns.</span>
          </h1>
        }
        below={<PressRow />}
      />
      <FounderOrigin />
      <StoryHowItWorks />
      <StoriesBothSides />
      <PointsSection tone="cream" heading="A new way of lending needs serious infrastructure." points={INFRA_POINTS} />
      <FounderCallCta />
      <QuestionCards heading="Questions & Answers" count={4} />
    </div>
  );
}
