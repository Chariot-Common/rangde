import type { Metadata } from "next";
import { FoundersCollage } from "@/components/versions/FoundersCollage";
import { OpportunitiesSection } from "@/components/sections/opportunities/OpportunitiesSection";
import { ScrollInkLines } from "@/components/versions/ScrollInk";
import { ReelsWheel } from "@/components/sections/reels/ReelsWheel";
import { ApproachHero, InfrastructureRow, SeeWhereMoneyGoes } from "@/components/versions/approaches";
import { V4HeroCards } from "@/components/versions/V4Sections";
import { V4HowItWorks } from "@/components/versions/V4HowItWorks";
import { V1UpdatesQuestions } from "@/components/versions/v1-updates/V1UpdatesQuestions";
import { V2Cycle } from "@/components/versions/v2-updates/V2Cycle";
import { V2Returns } from "@/components/versions/v2-updates/V2Returns";
import { getRangDeStats } from "@/lib/stats";
// Phones: one spacing system for every section (after cruise.money); see the file (renumbered for this page's order).
import "./v2-mobile.css";

export const metadata: Metadata = {
  title: "Version 2 updates · Lend to a person | Rang De",
  description: "Version 2, reworked: a copy of /v/v2 to change while Version 2 stays as it was.",
  robots: { index: false, follow: false },
};

// Version 2 updates (26 Nov 2026): a copy of Version 2 (app/v/v2) to rework while Version 2 stays as it was.
// - How it works: shorter step titles, each one line.
// - Why it matters: Version 2's loop as it was (V2Cycle, a copy of V4Cycle; 26 Nov: the redrawn circle was tried and
//   dropped), with a plainer Opportunities line.
// - "You decide who you back" is out: it told How it works' steps again (choose, understand, lend, get repaid).
// - Why returns aren't higher (V2Returns): the answer said plainly, your return and theirs side by side, and why the rate
//   can't just go up (informal credit at 17.77%).
// - Founders: "Why Rang De exists" (no question mark).
// - The live opportunities with the newer cards (`fresh`); the questions as Version 1 updates has them ("Before you
//   invest."), which also drops the returns question the section above already answers.
const MOBILE_LEAD = (
  <>
    <p className="font-display text-p1 font-medium text-ink/64">
      <strong className="font-bold text-ink/80">With Rang De, you can.</strong> Lend to people building businesses and livelihoods across rural India.
    </p>
    <hr className="w-full border-0 border-t border-ink/8" />
    <p className="font-display text-p1 font-medium text-ink/64">
      Your money helps them <strong className="font-bold text-ink/80">access credit and build a formal credit history, while you earn returns.</strong>
    </p>
  </>
);

// Copy review (26 Nov 2026): step 1 in plain words; step 2 without "Select from a pool of individuals…", which added nothing.
const STEP_BODIES = [
  "Before a profile goes live, we and our partners on the ground visit, check and verify every borrower.",
  "Every profile shares who they are, why they need the loan, and info on how they plan to repay it.",
];

const STEP_TITLES = ["We find and vet every borrower", "You choose who to back", "Your money reaches them", "Track every rupee", "Their credit history grows"];

export default async function V2Updates() {
  const stats = await getRangDeStats();
  return (
    <div className="v2-page flex w-full flex-col gap-2 pb-2">
      <ApproachHero
        tone="ink"
        eyebrow="Peer-to-peer social investing"
        title={"What if you could lend\ndirectly to another person?"}
        lead="With Rang De, you can. Lend to people building businesses across rural India. Your money helps them access credit and build a formal credit history, while you earn returns."
        compact
        bigTitle
        mobileLead={MOBILE_LEAD}
        strip={<V4HeroCards />}
        glow={false}
      />
      <V4HowItWorks swipe titles={STEP_TITLES} bodies={STEP_BODIES} />
      <V2Cycle />
      <ReelsWheel
        tight
        heading={
          <ScrollInkLines
            lines={[
              { text: "Meet the Other Startup India.", tone: "grey" },
              { text: "No pitch decks. No valuations. Just people building Bharat.", tone: "green" },
            ]}
          />
        }
      />
      <SeeWhereMoneyGoes stats={stats} inked after={<InfrastructureRow badge="#fff" onDark inked />} />
      <V2Returns />
      <FoundersCollage
        thinFrame
        roomy
        phoneLayout
        eyebrow="Why Rang De exists"
        // As Version 3 says it ("left Oxford" could read as dropping out).
        heading="Ram and Smita came back from Oxford to build Rang De."
        story={
          <>
            They started Rang De in 2008 with a simple belief: where you live or how much you earn shouldn’t decide your opportunities to grow. The idea was to let
            anyone lend a little to the people banks overlook, and see exactly where every rupee goes.
          </>
        }
      />
      <OpportunitiesSection inked fresh />
      <V1UpdatesQuestions />
    </div>
  );
}
