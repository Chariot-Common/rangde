import type { Metadata } from "next";
import { PressRow } from "@/components/versions/approaches";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { HowItWorksModalButton } from "@/components/versions/HowItWorksModal";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { WhyLoopStory } from "@/components/versions/WhyArcs";
import { WhyBlocks, WhyBuilds } from "@/components/versions/WhyCraft";
import { CostCompare } from "@/components/versions/WhyProblem";
import { BePartOfIt, Sources } from "@/components/versions/WhyWeExist";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version (draft): why Rang De exists.",
  robots: { index: false, follow: false },
};

// Version 4 (draft), reworked after the 13 Nov 2026 review. It had come to look too much like realfood.gov (near-black, giant
// tight type, a pinned chapter pill) and opened on the problem, which made it read like an information site. Now:
// Version 3's hero (photo collage, new line, no figures row) → where India stands ("1 in 8", then India, the UK and the US as blocks rising from the card's edge; WhyCraft.tsx)
// → why it happens, as a pinned scroll story, one step at a time: the loop she's in today, then the one Rang De opens (WhyArcs.tsx) → what your money does (real borrowers' photos fly in round one line; WhyCraft.tsx) → what
// ₹25,000 for a year costs her → your part (the live figures, once) → the founders, how it works, the questions, the sources.
// Tone: honest without being alarming. Earlier drafts: commit 935e1fe (the realfood.gov rework) and before.
export default async function WhyWeExistPage() {
  const stats = await getRangDeStats();
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      {/* Version 3's hero (the photo collage and the press row), with this page's line and no figures row. */}
      <CoinHero
        line1="Banks look at land. Rang De looks at people."
        line2="Lend to them, build their credit, earn returns."
        noStats
        strip={<CollageStrip />}
        below={<PressRow big />}
      />
      <WhyBlocks />
      <WhyLoopStory />
      <WhyBuilds />
      <CostCompare />
      <div id="ch-you" className="scroll-mt-[var(--navbar-bottom,0px)]">
        <BePartOfIt stats={stats} />
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
