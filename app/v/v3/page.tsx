import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FounderScroll } from "@/components/versions/FounderScroll";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { StoriesTwoRows } from "@/components/versions/StoriesTwoRows";
import { TrustList } from "@/components/versions/V6Sections";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { PressRow } from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 3 · Less said | Rang De",
  description: "Homepage test version: one line, proof, how it works, stories from both sides.",
  robots: { index: false, follow: false },
};

// Version 3 (was "Version 6"; 10 Nov 2026: Version 3.1 became Version 3), with the review-call changes: field-trip photos and better crops
// on the wall, bigger press logos, the live opportunities at the end. Built on the old Version 3 (Figma "Home - v3", node 2719:50454) reworked with the hero in CoinHero (headline fill and rolling figures),
// the photo collage and scroll-filled text. As little text as possible, and each idea once.
// The headline with the stats, the gallery and the press → the founders' paragraph → how it works (the
// scroll story), running straight on into "Rekha and Arjun aren't the only ones": borrowers, then investors → the
// four infrastructure points, side by side → the questions as cards → the live investment opportunities.
export default function V3() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CoinHero strip={<CollageStrip />} below={<PressRow big />} />
      <FounderScroll />
      {/* Starts filling only once the founders paragraph above has finished. */}
      {/* The borrowers' and investors' stories follow straight on from Rekha and Arjun's, inside the same card. */}
      <StoryHowItWorks heading={<ScrollInk as="span" text="Here’s how that works." offset={["start 0.55", "start 0.2"]} />} navyCta large crowd="fresh" after={<StoriesTwoRows />} />
      <TrustList />
      <PlainQuestionCards count={4} flip navyLink large />
      {/* The way in, as on Version 1.1: the live listings, by individuals, states and funds. */}
      <OpportunitiesSection />
    </div>
  );
}
