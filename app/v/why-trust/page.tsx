import type { Metadata } from "next";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ClearStories } from "@/components/versions/WhyClear";
import { PhotoRowHero } from "@/components/versions/WhyHero";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ThreadEvidence, ThreadProblem, ThreadSources, ThreadClose } from "@/components/versions/WhyThread";
import { TRUST_QUESTIONS, TrustHow, TrustMoney, TrustProof, TrustTurn } from "@/components/versions/WhyTrust";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist, with lender feedback | Rang De",
  description: "Homepage test version (draft): /v/why with lender feedback worked into its sections.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "c-evidence", label: "The numbers" },
  { id: "c-turn", label: "Why Rang De" },
  { id: "c-how", label: "How it works" },
  { id: "c-compare", label: "Your money" },
  { id: "c-proof", label: "It’s working" },
  { id: "f-resources", label: "Sources" },
] as const;

// Version 4 (/v/why) with the 2024–26 lender feedback woven into the existing sections; see WhyTrust.tsx for where each
// point went. Same sections, same order.
export default function WhyTrustPage() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <PhotoRowHero />
      <div className="relative z-10 flex flex-col gap-2 bg-white">
        <ChapterPill chapters={CHAPTERS} even />
        <ThreadProblem />
        <div className="flex flex-col gap-2">
          <ThreadEvidence />
          <div className="relative z-10">
            <TrustTurn />
          </div>
        </div>
        <TrustHow />
        <TrustMoney />
        <TrustProof />
        <ClearStories met />
        <Testimonials refined inked evenRows heading="Why they lend." />
        <PlainQuestionCards heading="Before you lend." cards={TRUST_QUESTIONS} icons={["faq-nri", "faq-secure", "faq-warning", "faq-returns"]} flip navyLink large foundersCall />
        <ThreadSources />
        <ThreadClose />
      </div>
    </div>
  );
}
