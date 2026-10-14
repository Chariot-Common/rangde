import { Hero } from "@/components/sections/hero/Hero";
import { InvestmentCalculator } from "@/components/sections/investment-calculator/InvestmentCalculator";
import { WhyRangDeCompare } from "@/components/sections/why-rangde/WhyRangDeCompare";
import { ScrollVideoSection } from "@/components/ScrollVideoSection";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { FounderCallCta } from "@/components/sections/founder-call-cta/FounderCallCta";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { FAQ } from "@/components/FAQ";
import { faqGroups } from "@/data/faqs";

export default function Home() {
  return (
    <>
      {/* Every homepage section sits as its own inset card with a uniform gap between
          cards (see Figma node 521-11829) — this flex column supplies that gap; each
          section supplies its own matching side margin. */}
      <div className="flex w-full flex-col gap-2">
        <Hero />
        <InvestmentCalculator />
        <WhyRangDeCompare />
        {/* Rang De's own teaser (youtube.com/watch?v=rHjFcX7xfnk), 1080p, trimmed before the end card. */}
        <ScrollVideoSection
          poster="/videos/livelihoods-poster.jpg"
          // Phones get a 720p H.264 file (plays everywhere, hardware-decoded on iPhone, ~1 MB);
          // larger screens get 1080p, WebM first.
          sources={[
            { src: "/videos/livelihoods-720.mp4", type: "video/mp4", media: "(max-width: 767px)" },
            { src: "/videos/livelihoods-1080.webm", type: "video/webm" },
            { src: "/videos/livelihoods-1080.mp4", type: "video/mp4" },
          ]}
        />
        <Testimonials />
        <OpportunitiesSection />
        <ReelsWheel />
      </div>
      <div className="w-full">
        <FounderCallCta />
      </div>
      <FAQ groups={faqGroups} />
    </>
  );
}
