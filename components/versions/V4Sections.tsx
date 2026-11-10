import Image from "next/image";
import { StoryCarousel } from "@/components/sections/hero/StoryCarousel";
import { stories } from "@/lib/content";
import { AnimatedText } from "@/components/ui/AnimatedText";

/*
 * Version 4's own sections (Figma "Home - v4", node 2982:5123).
 */

/* ───────────── Hero: one person, funded by many ───────────── */

// The investors each story names ("57 social investors funded…"), and faces to stand for them: the investor photos from
// the Figma example card (2989:48). We don't have each borrower's actual investors, so the same faces appear on every
// card, as many as the story's count, up to nine.
const COUNTS = [57, 240, 4, 13];
const FACES = Array.from({ length: 9 }, (_, i) => `/images/investors/investor-${String(i + 1).padStart(2, "0")}.png`);
// The card's own green, so each face's 1px ring cuts it out of the one beside it (Figma: border #084a2f).
const CARD_GREEN = "#084a2f";

/** Figma 2989:14126: a row of 40px round faces, each overlapping the next by 8px, under the story. */
function InvestorFaces({ count }: { count: number }) {
  const shown = FACES.slice(0, Math.min(FACES.length, count));
  return (
    <div className="flex items-center" aria-label={`${count} social investor${count === 1 ? "" : "s"}`} role="img">
      {shown.map((src, i) => (
        <span
          key={src}
          className={`relative block size-[40px] shrink-0 overflow-hidden rounded-full border border-solid shadow-[0_2px_4px_rgba(0,0,0,0.1)] ${i < shown.length - 1 ? "-mr-2" : ""}`}
          style={{ borderColor: CARD_GREEN }}
        >
          <Image src={src} alt="" fill sizes="40px" className="object-cover" />
        </span>
      ))}
    </div>
  );
}

/** The four investee cards under the hero ("240 social investors funded Sivakumar's…"), each with its investors' faces
 * set inside the card, under the story (Figma 2989:48). They run in the homepage's own story ticker, so the cards' width,
 * height, borrower photos and motion are the homepage's: a continuous scroll on tablets and up (pauses on hover, drag to
 * scrub) and a one-at-a-time swiper on phones. */
// Sharper borrower portraits for these cards (the design team's mock faces, 320px wide), in the stories' order:
// Neilhoupe, Sivakumar, Gita Devi, Sitara Devi.
const PORTRAITS = ["neilhoupe", "sivakumar", "gita-devi", "sitara-devi"].map((n) => `/images/stories/portraits/${n}.jpg`);

export function V4HeroCards() {
  const items = stories.map((s, i) => ({ ...s, avatar: PORTRAITS[i] ?? s.avatar }));
  return <StoryCarousel items={items} insetAvatar faces={stories.map((s, i) => <InvestorFaces key={s.highlight} count={COUNTS[i]} />)} />;
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
