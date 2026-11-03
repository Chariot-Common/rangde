import { Hero } from "@/components/sections/hero/Hero";
import { InvestmentCalculator } from "@/components/sections/investment-calculator/InvestmentCalculator";
import { WhyRangDeStack } from "@/components/sections/why-rangde/WhyRangDeStack";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { FoundersSection } from "@/components/sections/founders/FoundersSection";
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
        <WhyRangDeStack />
        <ReelsWheel />
        <Testimonials />
        <OpportunitiesSection />
        <FoundersSection />
      </div>
      <FAQ groups={faqGroups} />
    </>
  );
}
