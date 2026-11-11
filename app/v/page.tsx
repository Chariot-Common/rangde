import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeHeader } from "@/components/prototypes/shared";
import { Eyebrow } from "@/components/versions/ui";

export const metadata: Metadata = {
  title: "Homepage versions | Rang De",
  description: "The homepage versions we are testing, side by side.",
  robots: { index: false, follow: false },
};

const VERSIONS = [
  {
    key: "1",
    name: "The other Startup India",
    href: "/v/v1",
    audience: "Everyone (rangde-v1)",
    idea: "Why it matters first: the problem and Rang De’s answer as before → after rows, reels, investors, the founders, then How it works with the calculator, the top questions, the live opportunities.",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "1.2",
    name: "The other Startup India, reshuffled",
    href: "/v/v1-2",
    audience: "Everyone (rangde-v1-2)",
    idea: "The calculator inside the Rang De card, “not just a loan” with the credit chain, How it works with the infrastructure behind it, five question cards.",
    measure: "Calculator use, sign-ups",
  },
  {
    key: "2",
    name: "Lend to a person",
    href: "/v/v2",
    audience: "Everyone (rangde-v1)",
    idea: "Ram’s draft rebuilt from the Figma (Home - v4): investee cards in the hero ticker, How it works left and right, the loan as a scroll-played loop from your investment to more opportunity, the Other Startup India in reels, you decide who you back, fair returns (until now Version 2.1).",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "2 B",
    name: "Lend to a person, on a timeline",
    href: "/v/v2-b",
    audience: "Everyone (rangde-v1)",
    idea: "Version 2 with Why it matters as a timeline that slides past as you scroll, in Version 1’s voice: investors lend to them, businesses funded, interest stays fair, repaying builds credit, the next loan doesn’t start from zero (instead of the loop).",
    measure: "Sign-ups vs. Version 2",
  },
  {
    key: "2 C",
    name: "Lend to a person, the loop as cards",
    href: "/v/v2-c",
    audience: "Everyone (rangde-v1)",
    idea: "Version 2 with Why it matters as the loop drawn with cards: your social investment in the middle, feeding four cards round a square (businesses funded, interest stays fair, repaying builds credit, the next loan doesn’t start from zero) that fill green in turn and close back into the first.",
    measure: "Sign-ups vs. Version 2",
  },
  {
    key: "4",
    name: "Why we exist (draft)",
    href: "/v/why",
    audience: "First-time visitors discovering the category",
    idea: "From the 11 Nov review call: the 86% acted out with seven real borrowers, then why Rang De exists as Rekha and Arjun’s story (the bank says no, government schemes reach few, Rang De connects them, escrow, repaid with interest, a credit history), the bigger picture, the founders, a featured entrepreneur and investor. Yellow chips are figures still to be sourced.",
    measure: "Scroll depth, sign-ups vs. Version 1",
  },
  {
    key: "3",
    name: "Less said",
    href: "/v/v3",
    audience: "Everyone (rangde-v1)",
    idea: "The story of Rekha and Arjun, turning into a wall of real people, then the borrowers and investors in their own words, ending on the live opportunities (until now Version 6).",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "3 (archived)",
    name: "Less said",
    href: "/v/archive/v3",
    audience: "Everyone (rangde-v2)",
    idea: "One line, the people and the press, the scroll story of how it works, stories from both sides, why returns aren’t higher, questions as cards.",
    measure: "Scroll depth, sign-ups",
  },
  {
    key: "A",
    name: "Current",
    // On the versions-only site "/" redirects here, so link to where the current homepage lives.
    href: process.env.VERSIONS_SITE === "1" ? "https://rangde-kohl.vercel.app" : "/",
    audience: "Everyone (default)",
    idea: "Numbers and stories first: hero stats, success stories, returns calculator, Why Rang De, testimonials, live opportunities.",
    measure: "Baseline for every test",
  },
  {
    key: "B",
    name: "The idea",
    href: "/v/idea",
    audience: "Gen Z and Millennials, Instagram traffic",
    idea: "“Lend directly to another person”: one loan’s chain of outcomes, live borrowers as the Other Startup India, an honest take on returns.",
    measure: "Sign-ups from Instagram",
  },
  {
    key: "C",
    name: "Proof first",
    href: "/v/proof",
    audience: "Older residents, cautious first-timers, WhatsApp traffic",
    idea: "Track record in the headline, a playable repayment journey, how money is protected, an honest answer on defaults, Rang De beside an FD.",
    measure: "First investment within 7 days, founders’ Q&A sign-ups",
  },
  {
    key: "D",
    name: "Invest back home",
    href: "/v/nri",
    audience: "NRIs and OCI card holders",
    idea: "Pick your home state and see who is raising a loan there now, how NRIs pay, the Q&A in your time zone.",
    measure: "Sign-ups from NRI traffic, state picker use",
  },
];

export default function VersionsIndex() {
  return (
    <div className="mx-2 my-2 flex flex-col gap-10 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 lg:px-[80px] lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10">
        <PrototypeHeader eyebrow="Homepage tests" title="Versions of the homepage" lead="Same design system, different first impressions. Each one is built for a different audience and traffic source." />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {VERSIONS.map((v) => (
            <Link key={v.key} href={v.href} className="flex flex-col gap-4 rounded-[8px] bg-white p-6 transition-shadow hover:shadow-[0_4px_16px_rgba(41,45,54,0.08)] lg:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-[36px] items-center justify-center rounded-full bg-primary font-display text-p2 font-bold text-white">{v.key}</span>
                <h2 className="font-display text-p1 font-bold text-ink">{v.name}</h2>
              </div>
              <p className="font-display text-p3 font-medium text-ink/72">{v.idea}</p>
              <div className="mt-auto flex flex-col gap-1 border-t border-ink/8 pt-4">
                <Eyebrow>For</Eyebrow>
                <p className="font-display text-p3 font-bold text-ink">{v.audience}</p>
                <Eyebrow className="mt-2 text-ink/56">Measure</Eyebrow>
                <p className="font-display text-p3 font-medium text-ink/72">{v.measure}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
