import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/v3-updates/StoryHowItWorksUpdates";
import { StoriesTwoRowsUpdates } from "@/components/versions/v3-updates/StoriesTwoRowsUpdates";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FounderScroll } from "@/components/versions/FounderScroll";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { TrustList } from "@/components/versions/V6Sections";
import { V1UpdatesQuestions } from "@/components/versions/v1-updates/V1UpdatesQuestions";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { PressRow } from "@/components/versions/approaches";
import { HowItWorksModalButton } from "@/components/versions/HowItWorksModal";

export const metadata: Metadata = {
  title: "Version 3 updates · Less said | Rang De",
  description: "Version 3, reworked: a copy of /v/v3 to change while Version 3 stays as it was.",
  robots: { index: false, follow: false },
};

// Version 3 updates (26 Nov 2026): a copy of Version 3 (app/v/v3) to rework while Version 3 stays as it was.
// - How it works (StoryHowItWorksUpdates): on laptops the bank, the machine Rekha wants (with its ₹25,000) and the field
//   partner stand on her left, and the line's column sits in the gap between her and Arjun, so nothing runs under the
//   text or off the screen's edge.
// - "Rekha and Arjun aren't the only ones" (CrowdWallUpdates): only photos where the person is clear, framed on them,
//   each tile ringed green (people funded) or blue (investors), like the two counts under it.
// - The borrowers and investors (StoriesTwoRowsUpdates): Version 3's cards, with less room around the two rows.
// - The live opportunities with the newer cards (`fresh`), then Version 1 updates' questions ("Before you invest.").
export default function V3Updates() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CoinHero strip={<CollageStrip />} below={<PressRow big />} />
      <FounderScroll />
      <StoryHowItWorks heading={<ScrollInk as="span" text="Here’s how that works." offset={["start 0.55", "start 0.2"]} />} navyCta large crowd="fresh" after={<StoriesTwoRowsUpdates />} />
      <OpportunitiesSection roomy fresh secondaryCta={<HowItWorksModalButton />} after={<TrustList inCard />} />
      <V1UpdatesQuestions />
    </div>
  );
}
