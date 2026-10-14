"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { SourceTip } from "@/components/ui/SourceTip";

export interface CardItem {
  /** Animated icon (IconScout "hover pinch/pulse" pack, animated WebP) — exported at ~3x
   * its 32px display size for retina sharpness. Each has a `-still.webp` first-frame twin
   * (see stillOf) that's shown by default; the animation only plays while its card is
   * hovered. Now: each card's header icon loops; the list icons are still and grey. */
  icon: string;
  text: string;
  /** A phrase inside `text` to underline, with a tooltip naming where the figure comes from. */
  stat?: { phrase: string; source: string };
}

export interface Card {
  /** Colored blob shape sitting behind the header icon. */
  blob: string;
  /** Only the Problem card's header icon uses this blend mode in Figma. */
  blendColorBurn?: boolean;
  headerIcon: string;
  eyebrow: string;
  heading: string;
  items: CardItem[];
}

export const cards: Card[] = [
  {
    blob: "/images/why-rangde-v2/blob-8circle.svg",
    blendColorBurn: true,
    headerIcon: "/images/why-rangde-v2/icon-question-square.webp",
    eyebrow: "Problem",
    heading: "Rural businesses get turned away by banks",
    items: [
      {
        icon: "/images/why-rangde-v2/icon-bank.webp",
        text: "A bank account isn't a loan. Without a credit history or land, many are turned away.",
      },
      {
        icon: "/images/why-rangde-v2/icon-banknotes.webp",
        text: "So they borrow where they can: nearly half of rural households rely on informal sources.",
        stat: {
          phrase: "nearly half",
          source: "Source: NABARD Rural Economic Conditions & Sentiments Survey, July 2026, as reported by Rural Voice on 23 Jul 2026. 23.6% borrow only informally, 25.3% from both.",
        },
      },
      {
        icon: "/images/why-rangde-v2/icon-warning-circle.webp",
        text: "And it costs them: informal loans average almost 18% interest.",
        stat: { phrase: "almost 18%", source: "Source: NABARD Rural Economic Conditions & Sentiments Survey, July 2026, as reported by Rural Voice on 23 Jul 2026. Average rate on informal loans: 17.77%." },
      },
    ],
  },
  {
    blob: "/images/why-rangde-v2/blob-9point-1.svg",
    headerIcon: "/images/why-rangde-v2/icon-target-center.webp",
    eyebrow: "Solution",
    heading: "Rang De makes it a yes, and stays with them",
    items: [
      {
        icon: "/images/why-rangde-v2/icon-shield-check.webp",
        text: "A local partner meets every entrepreneur in person, looking at the business, not just paperwork.",
      },
      {
        icon: "/images/why-rangde-v2/icon-student-cap.webp",
        text: "With the loan comes training, mentoring and guidance.",
      },
      { icon: "/images/why-rangde-v2/icon-hand-check.webp", text: "Loans are fairly priced, far below what moneylenders charge." },
    ],
  },
  {
    blob: "/images/why-rangde-v2/blob-9point-2.svg",
    headerIcon: "/images/why-rangde-v2/icon-bar-chart.webp",
    eyebrow: "Impact",
    heading: "Businesses growing across India, since 2008",
    items: [
      { icon: "/images/why-rangde-v2/icon-map.webp", text: "65,000+ entrepreneurs supported across 28 states." },
      {
        icon: "/images/why-rangde-v2/icon-network.webp",
        text: "15,000+ investors, including many from abroad, earn returns.",
      },
      {
        icon: "/images/why-rangde-v2/icon-spinner.webp",
        text: "This ripple effect strengthens local economies and builds a brighter India.",
      },
    ],
  },
];

// Mobile-only sticky-stack: every card sticks at the SAME `top` offset (8px below the
// live navbar), so once a later card reaches that position it lands flush on top of the
// previous one — zero gap between stacked cards. Each gets a higher z-index than the one
// before it so it visually covers rather than tucks behind. Anchored to `--navbar-bottom`
// (tracked live by TopNav) rather than a hardcoded pixel value, so a card can never end up
// pinned underneath the navbar even if the navbar's own height changes. The 16px spacing
// between cards only exists in their normal (pre-stick) document flow, via the stack
// container's own `gap-4` — it has no effect once a card is actually stuck.
const STICKY_TOP = "calc(var(--navbar-bottom, 0px) + 8px)";

export const stillOf = (src: string) => src.replace(/\.webp$/, "-still.webp");

/** List icons: still first frame, in grey. The card's header icon (below) stays animated. */
function Icon({ src, muted = false }: { src: string; muted?: boolean }) {
  return muted ? (
    <Image src={stillOf(src)} alt="" fill unoptimized className="grayscale brightness-[0.62]" />
  ) : (
    <Image src={src} alt="" fill unoptimized />
  );
}

function ItemText({ item }: { item: CardItem }) {
  if (!item.stat) return item.text;
  const [before, after] = item.text.split(item.stat.phrase);
  return (
    <>
      {before}
      <SourceTip source={item.stat.source}>{item.stat.phrase}</SourceTip>
      {after}
    </>
  );
}

function CardContent({ card }: { card: Card }) {
  return (
    <>
      <div className="relative size-[52px] shrink-0 md:size-[64px]">
        <Image src={card.blob} alt="" fill />
        <div
          className={`absolute inset-[25%] ${card.blendColorBurn ? "mix-blend-color-burn" : ""}`}
        >
          <Icon src={card.headerIcon} />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4 md:gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.88px] text-ink/64">{card.eyebrow}</p>
          <p className="font-display text-p1 font-bold text-ink">{card.heading}</p>
        </div>

        <div className="h-px w-full bg-ink/16" />

        <div className="flex w-full flex-col items-center gap-3 md:gap-6">
          {card.items.map((item, i) => (
            <div key={item.text} className="flex w-full flex-col items-center gap-2">
              {/* 2px round dots, same weight as the hero "See how it works" underline, spaced
                  well apart so it reads as dots rather than a grey line. */}
              {i > 0 && <div className="dot-rule mb-3 w-full text-ink/32 md:mb-4" />}
              <div className="relative size-[28px] shrink-0 md:size-[32px]">
                <Icon src={item.icon} muted />
              </div>
              <p className="font-display text-p2 font-medium text-center text-ink/80">
                <ItemText item={item} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Every card in the phone stack gets the tallest card's height: when a shorter card lands
 * on a taller one, the taller one's bottom would otherwise poke out underneath it. */
function useEqualStackHeight() {
  const stackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    // Set straight on the elements (not via state) so a re-measure can clear the old value
    // first and find each card's natural height again — e.g. after a rotate to landscape.
    const measure = () => {
      const kids = [...stack.children] as HTMLElement[];
      kids.forEach((k) => (k.style.minHeight = ""));
      const tallest = Math.max(0, ...kids.map((k) => k.offsetHeight));
      kids.forEach((k) => (k.style.minHeight = `${tallest}px`));
    };
    measure();
    let lastWidth = stack.offsetWidth;
    const ro = new ResizeObserver(() => {
      // Only width changes can change a card's natural height; ignore our own height changes.
      if (stack.offsetWidth === lastWidth) return;
      lastWidth = stack.offsetWidth;
      measure();
    });
    ro.observe(stack);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);
  return stackRef;
}

export function WhyRangDeSection() {
  const stackRef = useEqualStackHeight();
  return (
    <section className="mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 sm:gap-10 lg:gap-12">
        <h2 className="text-center font-display text-h3 font-bold text-ink">Why Rang De?</h2>

        {/* Mobile/tablet (<768px): a sticky scroll-stack — Problem pins in place at
            STICKY_TOP first; Solution, then Impact, scroll up and land at that exact
            same offset, landing flush on top of it (zero gap) rather than a step below.
            Cards keep their natural content height (no forced min-height: 100vh) so
            proportions match the existing design; that height is exactly what gives
            each card its own "hold" period on screen before the next one catches up.
            No shadow (removed in design review); a hairline border keeps each stacked
            card's edge readable. Icons stay still here (no hover on touch). */}
        <div ref={stackRef} className="relative flex w-full flex-col gap-4 md:hidden">
          {cards.map((card, i) => (
            <div
              key={card.eyebrow}
              className="sticky flex flex-col items-center gap-4 rounded-[8px] border border-ink/8 bg-white px-5 pb-8 pt-5"
              style={{ top: STICKY_TOP, zIndex: i + 1 }}
            >
              <CardContent card={card} />
            </div>
          ))}
        </div>

        {/* Desktop (>=768px): side-by-side row. */}
        <div className="hidden w-full gap-[8px] md:flex">
          {cards.map((card) => (
            <div
              key={card.eyebrow}
              className="flex flex-1 flex-col items-center gap-8 rounded-[8px] bg-white p-8 lg:p-[64px]"
            >
              <CardContent card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
