import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { HowItWorksTabs } from "@/components/versions/approaches";
import { CatchSequence } from "./CatchSequence";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { InkLines } from "./ink";
import { Problem } from "./Problem";
import { ProofJourney } from "./ProofJourney";
import { ScrollSteps } from "./ScrollSteps";
import s from "./page.module.css";
// Page-only rules (no announcement band, white page), scoped to this page's marker: see the file.
import "./fourth-wall.css";

export const metadata: Metadata = {
  title: "Fourth wall approach | Rang De",
  description: "Homepage test version: break the fourth wall and show why rural entrepreneurs are unrecorded, not unreliable.",
  robots: { index: false, follow: false },
};

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className={s.card}>
      <div className={s.iconSlot}>icon</div>
      <h3>{title}</h3>
      <p className={s.p2}>{body}</p>
    </div>
  );
}

// Figma "Rang De Master Design III", frame v/fourth-wall-approach (node 3132:2), sections 01–07; then, from Version 2
// (app/v/v2), the reels, the founders, "You decide who you back", the live opportunities and the questions, with their
// headings at this page's size.
export default function FourthWallApproach() {
  return (
    <>
      <main className={s.page} data-fw-page="">
        <ScrollSteps />
        <Hero />
        <Problem />
        <ProofJourney />
        <CatchSequence />

        {/* 06 Solution: Version 2's How it works (a private copy, ./HowItWorks), under this page's heading. */}
        <HowItWorks
          swipe
          className={s.solution}
          heading={
            <div className={s.solutionCopy}>
              <p className={`${s.p1} ${s.muted}`}>Rural Entrepreneurs aren’t unreliable. They’re unrecorded.</p>
              <InkLines lines={["Investing through", "Rang De is the solution"]} className={s.displayXl} />
            </div>
          }
        />

        <hr className={s.divider} />

        {/* 07 Miscellaneous */}
        <section className={`${s.section} ${s.misc}`}>
          <div className={s.copy}>
            <InkLines lines={["What makes a", "Rang De loan different"]} className={s.display} />
          </div>
          <div className={s.grid}>
            <div className={s.row}>
              <FeatureCard title="Backed by people who know them" body="Every borrower is identified and supported by an Impact Partner working in their community." />
              <FeatureCard title="Support beyond the loan" body="Impact Partners offer training, capacity building and access to markets." />
            </div>
            <div className={s.row}>
              <FeatureCard title="Credit on their terms" body="Borrowers choose when and how much they borrow." />
              <FeatureCard title="Straight to their bank account" body="Once a loan is fully funded, the money goes directly to the borrower." />
            </div>
          </div>
        </section>
      </main>

      {/* From Version 2, as it is there (they bring their own 8px side margins), headings at this page's size. */}
      <div className={s.fromV2}>
        <ReelsWheel tight heading={<ScrollInk as="span" tone="grey" text="Real Rang De Stories" className="block" />} />
        <FoundersCollage
          thinFrame
          roomy
          phoneLayout
          eyebrow="Why Rang De exists?"
          story={
            <>
              They started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow. The idea was to let
              anyone lend a little to the people banks overlook, and see exactly where every rupee goes.
            </>
          }
        />
        <HowItWorksTabs refined inked bare visual="journey" eyebrow={null} heading="You decide who you back." />
        <OpportunitiesSection inked />
        <PlainQuestionCards count={4} flip large phoneHeading="Questions we get often" autoHighlight fadeIn />
      </div>
    </>
  );
}
