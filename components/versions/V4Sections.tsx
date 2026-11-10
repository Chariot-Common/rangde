import Image from "next/image";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { stories } from "@/lib/content";
import { AnimatedText } from "@/components/ui/AnimatedText";

/*
 * Version 4's own sections (Figma "Home - v4", node 2982:5123).
 */

/* ───────────── Hero: one person, funded by many ───────────── */

// The investors each story names ("57 social investors funded…"), and generic faces to stand for them (the How it works
// pop-up's avatars: we don't have each borrower's actual investors, so these are not meant as real people).
const COUNTS = [57, 240, 4, 13];
const FACES = [1, 4, 7, 10, 13].map((n) => `/how-it-works/s1-av${n}.webp`);

function InvestorPill({ count }: { count: number }) {
  const shown = FACES.slice(0, Math.min(FACES.length, count));
  return (
    <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/92 py-1 pl-1 pr-3 shadow-[0_6px_20px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:top-4">
      <span className="flex -space-x-2">
        {shown.map((src) => (
          <span key={src} className="relative block size-[26px] overflow-hidden rounded-full border-2 border-white bg-[#cbe8f6]">
            <Image src={src} alt="" fill sizes="26px" className="object-cover" />
          </span>
        ))}
      </span>
      <span className="whitespace-nowrap font-display text-p4 font-bold text-ink">
        {count} investor{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

/** The four investee cards under the hero ("240 social investors funded Sivakumar's…"), each with the investors on it.
 * Four across on laptops, two on tablets, a sideways scroll on phones. */
export function V4HeroCards() {
  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-2 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {stories.map((s, i) => (
        <div key={s.highlight} className="relative w-[calc(100vw-48px)] shrink-0 snap-center sm:w-auto">
          <StoryCard story={s} variant="grid" stretch />
          <InvestorPill count={COUNTS[i]} />
        </div>
      ))}
    </div>
  );
}

/* ───────────── Why aren't returns higher? ───────────── */

/** Reframed from the call: not "we're not the stock market" (the two aren't comparable), but fairness on both sides of the
 * loan. Rang De could pay more only by charging the people who borrow more. */
export function FairReturns() {
  return (
    <section className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-[#cbe0b8] px-4 py-16 sm:px-8 md:py-24 lg:py-[120px]">
      <div className="flex max-w-[860px] flex-col items-center gap-5 text-center">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Why aren’t Rang De returns higher?", className: "text-ink" },
            { text: "Because both sides of the loan should be fair.", className: "text-green-dark" },
          ]}
          className="font-display text-[26px] font-bold leading-[32px] [text-wrap:balance] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />
        <p className="max-w-[680px] font-display text-p1 font-medium text-ink/80 lg:text-[20px] lg:leading-[30px]">
          Rang De could pay you more, but only by charging the people who borrow more. We’d rather the rate works for both of you.
        </p>
      </div>
      <div className="grid w-full max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-[16px] bg-white p-6 sm:p-8">
          <p className="font-display text-p3 font-bold uppercase tracking-[1.2px] text-ink/56">For you</p>
          <p className="font-display text-[28px] font-bold leading-[34px] text-ink">Up to 8.5% a year</p>
          <p className="font-display text-p2 font-medium text-ink/64">A fair return, and you can see exactly whom it comes from.</p>
        </div>
        <div className="flex flex-col gap-2 rounded-[16px] bg-white p-6 sm:p-8">
          <p className="font-display text-p3 font-bold uppercase tracking-[1.2px] text-ink/56">For them</p>
          <p className="font-display text-[28px] font-bold leading-[34px] text-ink">A rate the business can carry</p>
          <p className="font-display text-p2 font-medium text-ink/64">No hidden charges, and repayments that follow the business’s cash flow.</p>
        </div>
      </div>
    </section>
  );
}
