import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { HowItWorksModalButton } from "@/components/versions/HowItWorksModal";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { BePartOfIt, Sources, TheProblem, WhyHero } from "@/components/versions/WhyWeExist";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told as Rekha and Arjun's story.",
  robots: { index: false, follow: false },
};

// Version 4 (draft, review call 11 Nov 2026): for someone discovering the category. The 86% acted out with real
// borrowers → why Rang De exists, as Version 3's Rekha and Arjun story with its own script (the bank says no, the
// government schemes reach few, the other ways cost too much, Rang De connects them, escrow, repaid with interest, a credit
// history), turning into the wall of real people → the bigger picture (where India stands) → the founders → be part of it
// (a featured entrepreneur and investor) → How it works and the questions, last. Figures still to be sourced show as
// yellow dashed chips.
export default async function WhyWeExistPage() {
  const stats = await getRangDeStats();
  return (
    <div className="flex w-full flex-col gap-2 pb-2 pt-2">
      <WhyHero />
      <StoryHowItWorks script="why" heading="Why Rang De exists, in one story." navyCta large crowd="fresh" />
      <TheProblem />
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
      <BePartOfIt stats={stats} />
      <section className="mx-2 flex flex-col items-center gap-4 rounded-[16px] bg-bg-grey px-4 py-16 text-center sm:px-8">
        <h2 className="font-display text-[28px] font-bold leading-[34px] text-ink md:text-[36px] md:leading-[44px]">Want to see exactly how it works?</h2>
        <HowItWorksModalButton />
      </section>
      <PlainQuestionCards count={4} flip navyLink large foundersCall />
      <Sources />
    </div>
  );
}
