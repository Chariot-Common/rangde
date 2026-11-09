import type { Metadata } from "next";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { CoinHero } from "@/components/versions/CoinHero";
import { CollageStrip } from "@/components/versions/CollageStrip";
import { FounderScroll } from "@/components/versions/FounderScroll";
import { ScrollInk } from "@/components/versions/ScrollInk";
import { PlainQuestionCards } from "@/components/versions/PlainQuestionCards";
import { StoriesTwoRows } from "@/components/versions/StoriesTwoRows";
import { ExploreCta, TrustList } from "@/components/versions/V6Sections";
import { PressRow } from "@/components/versions/approaches";

export const metadata: Metadata = {
  title: "Version 6 · Less said | Rang De",
  description: "Homepage test version: one line, proof, how it works, stories from both sides.",
  robots: { index: false, follow: false },
};

// Version 6: Version 3 (Figma "Home - v3", node 2719:50454) reworked with the hero in CoinHero (headline fill and rolling figures),
// the photo collage and scroll-filled text. As little text as possible, and each idea once.
// The headline with the stats, the gallery and the press → the founders' paragraph → how it works (the
// scroll story), running straight on into "Rekha and Arjun aren't the only ones": borrowers, then investors → the
// four infrastructure points, side by side → the questions as cards → a closing card into the listings.
export default function V6() {
  return (
    <div className="flex w-full flex-col gap-2 pb-2">
      <CoinHero strip={<CollageStrip />} below={<PressRow />} />
      <FounderScroll />
      {/* Starts filling only once the founders paragraph above has finished. */}
      {/* The borrowers' and investors' stories follow straight on from Rekha and Arjun's, inside the same card. */}
      <StoryHowItWorks heading={<ScrollInk as="span" text="Here’s how that works." offset={["start 0.55", "start 0.2"]} />} navyCta large crowd after={<StoriesTwoRows />} />
      <TrustList />
      <PlainQuestionCards count={4} flip navyLink large />
      <ExploreCta />
    </div>
  );
}
