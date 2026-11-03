import type { Metadata } from "next";
import { FAQPills } from "@/components/FAQPills";
import { CharacterHowItWorks } from "@/components/versions/CharacterHowItWorks";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
import { ReelsTwoSides } from "@/components/sections/reels/ReelsTwoSides";
import { HeroStats } from "@/components/sections/hero/HeroStats";
import { VersionHero } from "@/components/versions/VersionHero";
import { LinkButton } from "@/components/versions/ui";
import { ideaFaqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Archive · Version B, first story draft | Rang De",
  description: "Homepage test version: invest directly in rural Indian businesses.",
  robots: { index: false, follow: false },
};

// Archived: Version B as it was with the first How it works draft (CharacterHowItWorks, the two drawn
// worlds). /v/idea now uses the second take (StoryHowItWorks). Not linked from the versions index.
// Version B: hero (with the stats and the success stories) → how it works → stories from both sides (reels, then the
// investors' and borrowers' words) → live opportunities → the founders → FAQ.
// "One loan, more than one outcome" (OutcomeChain in components/versions/idea.tsx) has been
// taken out but kept for reference; the Other Startup India, "Why aren't returns higher?" and
// "Now invest in Bharat" sections moved to Version C.
export default function IdeaFirstDraft() {
  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <VersionHero
          headline={[{ text: "What if you could invest directly", green: false }, { text: "in rural Indian businesses?" }]}
          lead="With Rang De, you can lend to people building businesses across rural India. Your money helps them grow and comes back to you with interest."
          leadClassName="sm:max-w-[900px]"
          actions={<LinkButton href="#opportunities">Meet businesses in need</LinkButton>}
          below={<HeroStats />}
        />
        <CharacterHowItWorks />
        <ReelsTwoSides />
        <OpportunitiesSection />
        <FoundersSection photos="v2" />
      </div>
      <FAQPills faqs={ideaFaqs} />
    </>
  );
}
