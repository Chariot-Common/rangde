import type { Metadata } from "next";
import { PressRow } from "@/components/versions/approaches";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { HowItWorksModalButton } from "@/components/versions/HowItWorksModal";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { WhyLoopStory } from "@/components/versions/WhyArcs";
import { WhyBlocks, WhyBuilds, WhyProof } from "@/components/versions/WhyCraft";
import { WhyZoom } from "@/components/versions/WhyZoom";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { Sources } from "@/components/versions/WhyWeExist";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version (draft): why Rang De exists.",
  robots: { index: false, follow: false },
};

// Version 4 (draft), after the 16 Nov 2026 review. Version 3's hero with a direct line (invest, build credit, earn returns; no
// figures row) → who can get a bank loan ("1 in 8" and the country blocks, worded as access, not need; WhyCraft.tsx) → why it
// happens: credit is a loop, for her it's shut at the first step, Rang De completes it, with the moneylender's and Rang De's
// rates beside it (WhyArcs.tsx) → where your money goes (photos fly in round one line; WhyCraft.tsx) → the success stories and
// the investors, as on Version 1 → the founders, how it works, the questions, the sources.
export default function WhyWeExistPage() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* Version 3's hero (the photo collage and the press row), with this page's line and no figures row. */}
      <CoinHero
        line1="Invest in rural entrepreneurs without access to credit."
        line2="Help them build a credit history, and earn returns."
        noStats
        strip={<CollageStrip />}
        below={<PressRow big />}
      />
      {/* The chapter pill sticks under the nav and names the section in view (after realfood.gov's). */}
      <div className="relative flex flex-col gap-2">
        <ChapterPill />
        <WhyBlocks />
        <WhyLoopStory />
        {/* Rang De's own live figures (the figures row of Versions 1 to 3), as proof straight after the loop. */}
        <WhyProof />
        {/* Up close: India at scale → one entrepreneur → the threads she weaves (after genomines.com). */}
        <WhyZoom />
        <WhyBuilds />
        {/* The success stories and the investors, as on Version 1. */}
        <div id="ch-stories" className="scroll-mt-[var(--navbar-bottom,0px)]">
          <ReelsWheel tight heading={<ScrollInk as="span" tone="plain" text="The money may be small. What it makes possible isn’t." />} />
        </div>
        <div id="ch-investors" className="scroll-mt-[var(--navbar-bottom,0px)]">
          <Testimonials refined inked evenRows />
        </div>
      </div>
      <FoundersCollage
        thinFrame
        roomy
        eyebrow="Who we are"
        story={
          <>
            Ram and Smita started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow. Every
            week they still answer investors’ questions live.
          </>
        }
      />
      <section className="mx-2 flex flex-col items-center gap-4 rounded-[16px] bg-bg-grey px-4 py-16 text-center sm:px-8">
        <h2 className="font-display text-[28px] font-bold leading-[34px] text-ink md:text-[36px] md:leading-[44px]">Want to see exactly how it works?</h2>
        <HowItWorksModalButton />
      </section>
      <PlainQuestionCards count={4} flip navyLink large foundersCall />
      <Sources />
    </div>
  );
}
