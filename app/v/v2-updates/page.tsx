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

// Copy from the 2024–26 lender feedback (26 Nov 2026), one point per step, said to the reader: how borrowers are chosen
// and the loan sized, KYC, where the money waits (never with Rang De), late payments, the credit record. Facts from
// rangde.in (see WhyTrust.tsx). TO CONFIRM with the team: that the partner sets the loan from what the business can repay.
const STEP_BODIES = [
  "Every borrower comes through a local partner who knows their community. The partner checks the business and sets a loan it can repay.",
  "See who they are, what the loan is for and how they’ll repay. You both complete KYC first, as the RBI requires.",
  "Your money waits in an escrow account held by a bank’s trustee, never with Rang De. On the 1st or 15th, it goes straight to their bank.",
  "Repayments land in your Rang De balance every month. If one runs late, the local partner follows up in person.",
  "Every repayment goes to the credit bureaus that banks check. On time or late, it builds their real record.",
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
      {/* Lender feedback (May 2026): fewer profiles show for a day or two after each disbursal day, so say why up front. */}
      <OpportunitiesSection inked fresh note="Loans go out on the 1st and 15th. Just after, fewer people are listed for a day or two." />
      <V1UpdatesQuestions />
    </div>
  );
}
