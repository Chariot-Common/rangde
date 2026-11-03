import type { Metadata } from "next";
import Link from "next/link";
import { GiftFlow } from "@/components/prototypes/GiftFlow";
import { PrototypeHeader } from "@/components/prototypes/shared";
import { getIndividualOpportunities, uniqueBorrowers } from "@/lib/opportunities";

export const metadata: Metadata = {
  title: "Gift an investment | Rang De",
  description: "Concept prototype: gift someone an investment in a rural entrepreneur.",
  robots: { index: false, follow: false },
};

export default async function GiftPage() {
  const entrepreneurs = uniqueBorrowers(await getIndividualOpportunities()).slice(0, 6);

  return (
    <div className="mx-2 my-2 flex flex-col gap-8 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 lg:px-[80px] lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10">
        <Link href="/" className="self-start font-display text-p3 font-bold text-primary transition-opacity hover:opacity-70">
          ← Back to home
        </Link>
        <PrototypeHeader
          eyebrow="Concept prototype · Gifting"
          title="Gift someone the investment"
          lead="Fund a rural entrepreneur in someone else’s name, so the gift is a real livelihood."
        />
        <GiftFlow entrepreneurs={entrepreneurs} />
      </div>
    </div>
  );
}
