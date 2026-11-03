import type { Metadata } from "next";
import { FAQPills } from "@/components/FAQPills";
import { StoryHowItWorks } from "@/components/versions/StoryHowItWorks";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { ReelsTwoSides } from "@/components/sections/reels/ReelsTwoSides";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { VersionHero } from "@/components/versions/VersionHero";
import { LinkButton } from "@/components/versions/ui";
import { ideaFaqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Version B · The idea | Rang De",
  description: "Homepage test version: invest directly in rural Indian businesses.",
  robots: { index: false, follow: false },
};

// Version B: hero (with the stats) → how it works (StoryHowItWorks: a plain stage, Rekha and Arjun
// either side, the line in the middle) → stories from both sides → live opportunities → the founders
// → FAQ. The first How it works draft (CharacterHowItWorks) is archived at /v/archive/idea-first-draft.
export default function IdeaVersion() {
  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <VersionHero
          eyebrow="Peer-to-peer social investing"
          headline={[{ text: "What if you could invest directly", green: false }, { text: "in rural Indian businesses?" }]}
          lead="With Rang De, you can lend to people building businesses across rural India. Your money helps them grow and comes back to you with interest."
          leadClassName="sm:max-w-[900px]"
          actions={<LinkButton href="#opportunities">Meet businesses in need</LinkButton>}
          below={<HeroStats />}
        />
        <StoryHowItWorks />
        <ReelsTwoSides />
        <OpportunitiesSection />
        <FoundersSection />
      </div>
      <FAQPills faqs={ideaFaqs} />
    </>
  );
}
