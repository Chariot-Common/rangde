import type { Metadata } from "next";
import Link from "next/link";
import { InvestorsMasonry } from "@/components/sections/testimonials/InvestorsMasonry";
import { testimonialsRow1, testimonialsRow2 } from "@/lib/content";

export const metadata: Metadata = {
  title: "Social Investors | Rang De",
  description: "Meet the social investors funding rural entrepreneurs through Rang De.",
};

const allInvestors = [...testimonialsRow1, ...testimonialsRow2];

export default function InvestorsPage() {
  return (
    // The shared root layout itself caps at 1560px now, so this page's own content just
    // fills that — no need to break out of an ancestor here.
    <div className="w-full px-4 py-16 sm:px-8 lg:px-[80px]">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="font-display text-p3 font-bold text-primary transition-opacity hover:opacity-70">
            ← Back to home
          </Link>
          <h1 className="font-display text-h2 font-bold text-ink">
            11,596 social investors and counting
          </h1>
          <p className="max-w-[640px] font-display text-p2 font-medium text-ink/64">
            Everyday people backing rural entrepreneurs, one loan at a time.
          </p>
        </div>

        {/* Staggered masonry: each column is its own independent vertical flow (round-
            robin item distribution), with a deliberate per-column vertical offset so the
            stagger reads clearly even though the quotes are similar enough in length that
            natural content-height variance alone wouldn't stagger much. 1/2/3 columns
            responsive to viewport width. */}
        <InvestorsMasonry testimonials={allInvestors} />
      </div>
    </div>
  );
}
