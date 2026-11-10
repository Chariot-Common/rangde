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
    idea: "Why it matters first: the problem and Rang De’s answer as before → after rows, reels, How it works with the calculator, investors, the founders, the top questions, the live opportunities.",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "1.1",
    name: "The other Startup India, refined",
    href: "/v/v1-1",
    audience: "Everyone (rangde-v1)",
    idea: "Version 1 with the review-call changes: the hero lead in three lines, and How it works moved after the testimonials and founders.",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "1.1 D",
    name: "The other Startup India, six cards",
    href: "/v/v1-d",
    audience: "Everyone (rangde-v1)",
    idea: "Version 1.1 with the problem section as six cards: the three problems stay along the top, each struck through on scroll and answered by a card that rises in under it.",
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
    idea: "Ram’s Claude Design draft, section for section, in the site’s design (until now Version 4).",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "2.1",
    name: "Lend to a person, reworked",
    href: "/v/v2-1",
    audience: "Everyone (rangde-v1)",
    idea: "Version 2 rebuilt from the Figma (Home - v4): investee cards in the hero, How it works left and right, the loan as a loop from your investment to more opportunity, the Other Startup India in reels, you decide who you back, fair returns.",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "3",
    name: "Less said",
    href: "/v/v3",
    audience: "Everyone (rangde-v1)",
    idea: "The story of Rekha and Arjun, turning into a wall of real people, then the borrowers and investors in their own words (until now Version 6).",
    measure: "Sign-ups vs. the current homepage",
  },
  {
    key: "3.1",
    name: "Less said, refined",
    href: "/v/v3-1",
    audience: "Everyone (rangde-v1)",
    idea: "Version 3 with the review-call changes: field-trip photos and better crops on the wall, bigger press logos, the live opportunities at the end.",
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
