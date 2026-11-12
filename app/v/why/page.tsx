import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { HowItWorksModalButton } from "@/components/versions/HowItWorksModal";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { LoopWheel } from "@/components/versions/WhyLoopWheel";
import { CostCompare, ProblemBankSaysNo, ProblemHowMany, ProblemTrap, ProblemWhereTheyGo } from "@/components/versions/WhyProblem";
import { BePartOfIt, Sources } from "@/components/versions/WhyWeExist";
import { ChapterPill, TheFix, WhyOpening } from "@/components/versions/WhyRealStory";
import { getRangDeStats } from "@/lib/stats";
import { NEW_ASSETS } from "@/lib/why-v4-assets";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told like a public-interest campaign.",
  robots: { index: false, follow: false },
};

// Version 4 (draft), reworked 12 Nov 2026 with realfood.gov as the reference. Each fact appears once:
// the opening (one headline, a real borrower's photo turning from grey to colour) → the problem (WhyProblem.tsx: 86 in
// 100; why the bank says no; where they go instead; the trap) → "Rang De exists to change that" → the loop that builds a
// credit history (WhyLoopWheel: Version 2's loop as a turning wheel, after titanintake.com; the answer to the trap) → what ₹25,000 costs her (the only place 17.77% appears)
// → your part: the live figures (once) → the founders, how it works, the questions, the sources.
// A pill under the nav names the chapter in view. Earlier drafts: commit 010843a (Rekha and Arjun's story) and on.
export default async function WhyWeExistPage() {
  const stats = await getRangDeStats();
  // The illustrations still to be made (docs/why-v4-asset-prompts.md): a dashed slot until the file is in place.
  const have = NEW_ASSETS.filter((f) => existsSync(path.join(process.cwd(), "public/images/why-v4", f)));
  return (
    <div className="flex w-full flex-col gap-2 pb-2 pt-2">
      <WhyOpening />
      <div className="relative flex flex-col gap-2">
        <ChapterPill />
        <ProblemHowMany />
        <ProblemBankSaysNo />
        <ProblemWhereTheyGo have={have} />
        <ProblemTrap />
        <TheFix />
        <LoopWheel />
        <CostCompare />
        <div id="ch-you" className="scroll-mt-[var(--navbar-bottom,0px)]">
          <BePartOfIt stats={stats} />
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
