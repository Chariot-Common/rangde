import type { Metadata } from "next";
import { PressRow } from "@/components/versions/approaches";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { ClearCompare, ClearProblem, ClearProofHeading, ClearResources, ClearSteps, ClearStories, ClearTry, ClearTurn } from "@/components/versions/WhyClear";
import { ClearHero, ClearReach } from "@/components/versions/WhyHero";
import { ChapterPill } from "@/components/versions/WhyRealStory";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";

export const metadata: Metadata = {
  title: "Version 4 · Why we exist | Rang De",
  description: "Homepage test version (draft): why Rang De exists, told in headings.",
  robots: { index: false, follow: false },
};

const CHAPTERS = [
  { id: "c-problem", label: "The problem" },
  { id: "f-rangde", label: "Rang De" },
  { id: "c-how", label: "Where your money goes" },
  { id: "c-compare", label: "Rang De vs a moneylender" },
  { id: "c-try", label: "Try it" },
  { id: "c-proof", label: "It’s working" },
  { id: "f-resources", label: "Sources" },
] as const;

// Version 4, second pass after the 16 Nov review. Hero (photos of the businesses, then a dotted map of India with the live
// figures, after citadelgroup.org) → the problem (a bar chart) → the hand-over ("So they borrow from moneylenders" opening
// into "Rang De gives them their first loan") → where your money goes (three steps beside the real app screens) → two rate
// cards → the calculator → proof → questions → sources (report cards, after realfood.gov). Every section opens with a
// small label and a centred heading. The 17 Nov take is at /v/why-ribbon.
export default function WhyPage() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <ClearHero />
      <div className="px-2 py-6 md:py-8">
        <PressRow big />
      </div>
      <ClearReach />
      <div className="relative flex flex-col gap-2">
        <ChapterPill chapters={CHAPTERS} />
        <ClearProblem />
        <ClearTurn />
        <ClearSteps />
        <ClearStories />
        <ClearCompare />
        <ClearTry />
        <div id="c-proof" className="scroll-mt-[var(--navbar-bottom,0px)]">
          <ReelsWheel tight heading={<ClearProofHeading />} />
          <Testimonials refined inked evenRows />
        </div>
        <PlainQuestionCards count={4} flip navyLink large foundersCall />
        <ClearResources />
      </div>
    </div>
  );
}
