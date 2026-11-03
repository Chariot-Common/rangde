"use client";

import Image from "next/image";
import Link from "next/link";
import { stories, testimonialsRow1, type Testimonial } from "@/lib/content";
import { SwipeCarousel } from "@/components/ui/SwipeCarousel";
import { FlagBadge } from "@/components/ui/FlagBadge";

interface Stat {
  value: string;
  label: string;
}

interface Pair {
  borrower: {
    name: string;
    avatar: string;
    highlight: string;
    rest: string;
    images: string[];
    stats: Stat[];
  };
  investor: {
    testimonial: Testimonial;
    /** Only where the figures are on record (Figma 2423:15933); otherwise none are shown. */
    stats?: Stat[];
  };
}

// The warm beige of Figma 2524:769, shared by the border and the investor's side so they read
// as one colour against the white borrower side.
const BEIGE = "border-[#F1E7D8] bg-[#F1E7D8]";

const byName = (name: string) => testimonialsRow1.find((t) => t.name.startsWith(name))!;
const storyStats = (i: number): Stat[] => [
  { value: stories[i].totalFunded, label: "Total Funded" },
  { value: stories[i].returns, label: "Returns Provided" },
];

// Each card pairs a borrower's success story with a social investor's words: both sides of one
// loan. The first is the Figma card as designed; the rest pair the other published success
// stories with investors from the Wall of Love.
const PAIRS: Pair[] = [
  {
    borrower: {
      name: "Neilhoupe u Koza",
      avatar: stories[0].avatar,
      highlight: "57 social investors funded Neilhoupe u Koza’s apparel business based in Assam, India",
      rest: "; which is now running well, enabling her to earn more and provide for her sibling.",
      images: ["/images/stories/pairs/neilhoupe-loom.jpg", "/images/stories/pairs/neilhoupe-fabric.jpg"],
      stats: storyStats(0),
    },
    investor: {
      testimonial: byName("Kishor"),
      stats: [
        { value: "₹ 3,00,000", label: "All-Time Invested" },
        { value: "3,000", label: "Lives Impacted" },
      ],
    },
  },
  {
    borrower: { name: "Sivakumar", avatar: stories[1].avatar, highlight: stories[1].highlight, rest: stories[1].rest, images: [stories[1].image], stats: storyStats(1) },
    investor: { testimonial: byName("Chaitanya") },
  },
  {
    borrower: { name: "Gita Devi", avatar: stories[2].avatar, highlight: stories[2].highlight, rest: stories[2].rest, images: [stories[2].image], stats: storyStats(2) },
    investor: { testimonial: byName("Ritika") },
  },
  {
    borrower: { name: "Sitara Devi", avatar: stories[3].avatar, highlight: stories[3].highlight, rest: stories[3].rest, images: [stories[3].image], stats: storyStats(3) },
    investor: { testimonial: byName("Hari") },
  },
];

function Identity({ name, role, avatar, flag, avatarSide = "left" }: { name: string; role: string; avatar: string; flag?: string; avatarSide?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-4 ${avatarSide === "right" ? "md:flex-row-reverse" : ""}`}>
      <div className="relative shrink-0">
        <div className="relative size-[44px] overflow-hidden rounded-[8px] shadow-[0_3px_10px_rgba(0,0,0,0.14)] md:size-[96px] md:border-4 md:border-white md:shadow-[0_4px_12px_rgba(0,0,0,0.14)]">
          <Image src={avatar} alt="" fill sizes="96px" className="object-cover" />
        </div>
        {/* Where the social investor invests from (Figma 2478:803), on the photo's bottom-left corner. */}
        {flag && <FlagBadge flag={flag} className="absolute -bottom-1 -left-2 h-[18px] w-[24px] md:h-[24px] md:w-[32px]" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-[3px]">
        <p className="font-display text-p3 font-bold uppercase text-ink [overflow-wrap:anywhere]">{name}</p>
        <p className="font-display text-[11px] font-bold uppercase leading-[16px] tracking-[0.88px] text-ink/64">{role}</p>
      </div>
    </div>
  );
}

/** Phones: small pills. Desktop: a row of figures split by a hairline. */
function Stats({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <>
      <div className={`flex flex-wrap gap-x-[6px] gap-y-2 md:hidden ${className}`}>
        {stats.map((s) => (
          <p key={s.label} className="flex items-center gap-[5px] whitespace-nowrap rounded-full border border-ink/8 bg-white/70 px-2 py-[6px] uppercase">
            <span className="font-display text-[11px] font-bold leading-[16px] tracking-[0.88px] text-ink">{s.value}</span>
            <span className="font-display text-[10px] font-medium leading-[12px] tracking-[0.5px] text-ink/60">{s.label}</span>
          </p>
        ))}
      </div>
      <div className={`hidden gap-4 border-t border-ink/16 pt-6 md:flex ${className}`}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden className="h-[40px] w-px bg-ink/12" />}
            <div className="flex flex-col gap-1">
              <p className="whitespace-nowrap font-body text-[18px] font-bold leading-[24px] text-ink">{s.value}</p>
              <p className="whitespace-nowrap font-body text-[14px] font-medium leading-[20px] text-ink/64">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PairCard({ pair }: { pair: Pair }) {
  const { borrower, investor } = pair;
  const t = investor.testimonial;
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-[8px] border-8 md:flex-row ${BEIGE}`}>
      {/* The borrower */}
      <div className="flex flex-col gap-[14px] bg-white px-4 py-5 md:min-w-0 md:flex-1 md:gap-6 md:px-10 md:py-6">
        <Identity name={borrower.name} role="Entrepreneur" avatar={borrower.avatar} />
        <Stats stats={borrower.stats} className="md:hidden" />
        <p className="line-clamp-4 font-display text-p3 font-medium text-ink/64">
          <strong className="font-bold text-ink/80">{borrower.highlight}</strong>
          {borrower.rest}
        </p>
        <div className="flex h-[82px] gap-2 md:h-auto md:min-h-[120px] md:flex-1">
          {borrower.images.map((src) => (
            <div key={src} className="relative flex-1 overflow-hidden rounded-[8px]">
              <Image src={src} alt="" fill sizes="(min-width: 768px) 200px, 45vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <Stats stats={borrower.stats} />
        </div>
      </div>


      {/* The investor */}
      <div className="flex flex-col gap-[14px] px-4 py-5 md:min-w-0 md:flex-1 md:gap-6 md:px-10 md:py-6">
        <Identity name={t.name} role="Social Investor" avatar={t.avatar} flag={t.flag} avatarSide="right" />
        {/* Set in from the name, as in Figma (no bar). As many lines as fit in 180px: seven at 24px. */}
        <blockquote className="line-clamp-7 max-h-[180px] min-w-0 pl-4 font-display text-p3 font-bold text-ink/64 md:flex-1 md:pl-6">
          “{t.quote.map((q) => q.text).join("").trim()}”
        </blockquote>
        {investor.stats && <Stats stats={investor.stats} className="md:mt-auto" />}
      </div>
    </article>
  );
}

function PairRow({ pairs, direction }: { pairs: Pair[]; direction: "forward" | "reverse" }) {
  // The loop moves -50%, so half the track must still be wider than the widest screen (7680px:
  // a 1920px screen zoomed out to 25%). These cards are 844px + gap, so with four pairs that's six
  // copies, not the eight the narrower testimonial cards need; each card is a few hundred elements.
  const copies = 2 * Math.ceil(7680 / (pairs.length * 868));
  const looped = Array.from({ length: copies }, () => pairs).flat();
  return (
    <div className="group w-full overflow-hidden">
      <div
        className={`flex w-max items-stretch gap-sp3 ${direction === "reverse" ? "animate-marquee-reverse" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
        // The cards are much wider than testimonial cards, so the loop runs longer to keep a calm,
        // readable pace.
        style={{ animationDuration: "480s" }}
      >
        {looped.map((pair, i) => (
          // A fixed 844px (Figma), so the card scales with the text when the page is zoomed.
          <div key={i} aria-hidden={i >= pairs.length || undefined} className="w-[844px] shrink-0">
            <PairCard pair={pair} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Borrowers' success stories beside social investors' words (Figma 2423:15933 desktop,
 * 2423:19579 mobile), shown under the reels in "From both sides of the same coin".
 * Desktop: two rows of cards running edge to edge in opposite directions. Phones: one card at
 * a time, its neighbours peeking in, moving on every few seconds.
 */
export function StoryRows() {
  return (
    <div className="flex w-full flex-col items-center gap-8 sm:gap-sp9">
      {/* Phones: one card at a time, its neighbours peeking in. */}
      <div className="w-full md:hidden">
        <SwipeCarousel
          items={PAIRS}
          peek
          autoAdvanceMs={6000}
          ariaLabel="Borrower stories and investor testimonials"
          renderItem={(pair) => <PairCard key={pair.borrower.name} pair={pair} />}
        />
      </div>

      {/* Desktop: two rows running edge to edge, the top ticking left and the bottom ticking
          right; hovering a row holds it still. */}
      <div className="hidden w-full flex-col gap-sp3 md:flex">
        <PairRow pairs={PAIRS} direction="forward" />
        <PairRow pairs={[...PAIRS.slice(2), ...PAIRS.slice(0, 2)]} direction="reverse" />
      </div>

      <Link
        href="/investors"
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[4px] bg-primary/16 px-[16px] font-display text-p3 font-bold text-primary transition-[filter,background-color] duration-150 hover:bg-primary/24"
      >
        Explore more investors
      </Link>
    </div>
  );
}
