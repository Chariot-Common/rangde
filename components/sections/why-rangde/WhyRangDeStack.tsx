"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SourceTip } from "@/components/ui/SourceTip";
import { HowItWorksTrigger } from "@/components/how-it-works/HowItWorksTrigger";
import { STATS_SNAPSHOT as LIVE, roundedPlus } from "@/lib/stats";
import { cards, stillOf, type CardItem } from "./WhyRangDeSection";

/**
 * "Why Rang De?" as two stacked cards (Figma 1736:20042): the Problem card first, then the
 * Solution card slides up over it as the page scrolls. Both pin at the same offset below
 * the navbar, so the second lands flush on top of the first. Each card is a badge, a heading
 * and three icon-led points — icons only, no photos.
 *
 * Approach 1 polish (Figma 2319:25 / 2331:889): no "Problem"/"Solution" eyebrows — a red stop
 * badge and a green tick badge say it — headings that state the whole problem and solution,
 * smaller list icons, a darker section so the white cards stand out, and "See how it works"
 * moved here from the hero, under the solution.
 */
// The "Why Rang De?" heading pins under the navbar and stays put; the cards pin just below it.
const HEAD_TOP = "calc(var(--navbar-bottom, 0px) + 8px)";
const STICKY_TOP = "var(--card-top)";
const EASE = [0.22, 1, 0.36, 1] as const;

const repaidPct = `${LIVE.principalRepaidPct.toFixed(1)}%`;
const repaidPhrase = `${repaidPct} of principal`;

/** A line of card copy: `strong` is shown bold, `stat` bold with its source on hover/tap. */
interface Copy {
  text: string;
  strong?: string;
  stat?: CardItem["stat"];
}
type StackItem = Copy & Pick<CardItem, "icon">;

// Copy per Figma 2368:24396 (mobile). The Solution card answers the Problem card point for
// point: no bank loan → fair credit; informal lenders → on-ground vetting with training; debt
// traps → livelihoods that last, with Rang De's own numbers as the closing proof.
const solutionItems: StackItem[] = [
  {
    icon: cards[1].items[0].icon,
    text: "Businesses are given access to credit, with fair interest rates from people who genuinely want to help.",
    strong: "given access to credit, with fair interest rates",
  },
  {
    icon: cards[1].items[1].icon,
    text: "They go through a multi-step, thorough and considerate vetting process, done on-ground alongside financial training.",
    strong: "multi-step, thorough and considerate vetting process",
  },
  {
    icon: cards[2].items[0].icon,
    text: "Through Rang De’s model, they’re able to sustain their livelihoods, strengthen the local economy, and also repay investors.",
    strong: "sustain their livelihoods, strengthen the local economy, and also repay investors",
  },
];

const problemItems: StackItem[] = [
  {
    icon: cards[0].items[0].icon,
    text: "They can’t avail loans from banks for business purposes if they don’t have credit history or land collateral.",
    strong: "can’t avail loans from banks for business purposes",
  },
  {
    icon: cards[0].items[1].icon,
    text: "Nearly half of rural households in India rely on informal sources such as unregulated moneylenders.",
    stat: { phrase: "Nearly half", source: cards[0].items[1].stat!.source },
  },
  {
    icon: cards[0].items[2].icon,
    text: "Informal debt enslaves rural citizens, destroying livelihoods and to a large extent, also pushes many to suicide.",
    strong: "pushes many to suicide",
  },
];

interface StackCard {
  key: string;
  heading: string;
  items: StackItem[];
  /** Closing line under the points. */
  result: Copy;
}

const STACK: StackCard[] = [
  {
    key: "problem",
    heading: "Rural businesses face problems",
    items: problemItems,
    result: { text: "It’s hard for good businesses operating in rural areas to grow." },
  },
  {
    key: "solution",
    heading: "Rang De is their solution",
    items: solutionItems,
    result: {
      text: `${roundedPlus(LIVE.entrepreneurs)} businesses have been supported across ${LIVE.states} states, with ${repaidPhrase} repaid.`,
      stat: {
        phrase: repaidPhrase,
        source:
          "Source: Rang De platform data (rangde.in/stats), as of 14 Oct 2026. Principal repaid = 100% minus principal written off.",
      },
    },
  },
];

/** The original header badge: a coloured blob with the card's icon on top (Problem / Solution). */
function Badge({ kind }: { kind: string }) {
  const card = kind === "problem" ? cards[0] : cards[1];
  return (
    <div className="relative size-[56px] shrink-0 md:size-[64px]">
      <Image src={card.blob} alt="" fill />
      <div className={`absolute inset-[25%] ${card.blendColorBurn ? "mix-blend-color-burn" : ""}`}>
        <Image src={card.headerIcon} alt="" fill unoptimized />
      </div>
    </div>
  );
}

/**
 * Mobile badges (Figma 2345:24314): a red stop sign for the problem and a green scalloped tick
 * for the solution. The stop sign and the tick's star both turn once every 20s, as in Figma.
 */
function MobileBadge({ kind }: { kind: string }) {
  const reduce = useReducedMotion();
  const spin = reduce
    ? {}
    : { animate: { rotate: 360 }, transition: { duration: 20, ease: "linear" as const, repeat: Infinity } };
  if (kind === "problem") {
    return (
      <motion.div className="relative size-[58px] shrink-0" {...spin}>
        <Image src="/images/why-rangde-mobile/stop-symbol.svg" alt="" fill unoptimized className="scale-[1.2]" />
      </motion.div>
    );
  }
  return (
    <div className="relative size-[58px] shrink-0">
      <motion.div className="absolute inset-0" {...spin}>
        <Image src="/images/why-rangde-mobile/star.svg" alt="" fill unoptimized />
      </motion.div>
      <div className="absolute left-1/2 top-1/2 size-[37px] -translate-x-1/2 -translate-y-1/2">
        <Image src="/images/why-rangde-mobile/check.svg" alt="" fill unoptimized />
      </div>
    </div>
  );
}

/** A short vertical rule that fades out at both ends; `n` puts a numbered dot at its foot. */
function Connector({ n, long }: { n?: number; long?: boolean }) {
  return (
    <div aria-hidden className={`relative flex justify-center ${long ? "h-[80px]" : "h-[64px]"}`}>
      <div className="h-full w-[2px] bg-[linear-gradient(to_bottom,transparent,rgb(41_45_54/0.24),transparent)]" />
      {n !== undefined && (
        <span className="absolute bottom-0 left-1/2 flex size-[24px] -translate-x-1/2 items-center justify-center rounded-full bg-[#A9ABAF] font-display text-[14px] font-black leading-[20px] text-white">
          {n}
        </span>
      )}
    </div>
  );
}

/**
 * Phones get a lighter version (Figma 2345:24314): no cards and no list icons, just a centred
 * column where each group reads as a short numbered timeline ending in its closing line.
 */
function WhyRangDeMobile() {
  const reduce = useReducedMotion();
  const reveal = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.5, delay: i * 0.05, ease: EASE },
  });
  return (
    <section className="bg-white px-[15px] py-[80px] sm:hidden">
      <h2 className="sr-only">Why Rang De?</h2>
      <div className="flex flex-col items-center gap-2">
        {STACK.map((card, i) => (
          <div key={card.key} className="contents">
            {i > 0 && <Connector long />}
            <div className="flex w-full flex-col items-center gap-2 text-center">
              <motion.div className="flex flex-col items-center gap-4 px-6" {...reveal(0)}>
                <MobileBadge kind={card.key} />
                <h3 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">
                  {card.heading}
                </h3>
              </motion.div>
              {card.items.map((item, j) => (
                <div key={item.text} className="contents">
                  <Connector n={j + 1} />
                  <motion.p
                    className="px-6 font-display text-p1 font-medium text-ink/80"
                    {...reveal(1)}
                  >
                    <ItemText item={item} />
                  </motion.p>
                </div>
              ))}
              <Connector />
              <motion.p
                className="w-full max-w-[315px] rounded-[8px] border-[3px] border-dashed border-ink/16 px-6 py-3 font-display text-p1 font-medium text-ink/80"
                {...reveal(1)}
              >
                <ItemText item={card.result} />
              </motion.p>
              {card.key === "solution" && (
                <HowItWorksTrigger className="shine-button mt-6 inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-[8px] bg-primary px-8 py-4 font-display text-p2 font-bold text-white transition-[filter,transform] hover:brightness-105 active:scale-[0.98]">
                  See how it works
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </HowItWorksTrigger>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ItemText({ item }: { item: Copy }) {
  const phrase = item.stat?.phrase ?? item.strong;
  if (!phrase) return item.text;
  const [before, after] = item.text.split(phrase);
  return (
    <>
      {before}
      {item.stat ? (
        <SourceTip source={item.stat.source} placement="bottom">
          <strong className="font-bold text-ink">{phrase}</strong>
        </SourceTip>
      ) : (
        <strong className="font-bold text-ink">{phrase}</strong>
      )}
      {after}
    </>
  );
}

export function WhyRangDeStack() {
  const reduce = useReducedMotion();
  const headRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // The heading stays pinned while the cards stack. Once the last card has settled and the
  // section starts to scroll away, it travels up at the same rate as the cards, so the heading
  // and the cards leave together instead of the cards sliding under a heading that stays put.
  useEffect(() => {
    const head = headRef.current;
    const stack = stackRef.current;
    if (!head || !stack) return;
    const update = () => {
      if (!window.matchMedia("(min-width: 768px)").matches) {
        head.style.transform = "";
        return;
      }
      const all = stack.querySelectorAll<HTMLElement>("[data-stack-card]");
      const last = all[all.length - 1];
      if (!last) return;
      const pin = parseFloat(getComputedStyle(head).top) + head.offsetHeight;
      const y = Math.min(
        0,
        stack.getBoundingClientRect().bottom - (pin + last.offsetHeight),
      );
      head.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  // A card taller than the space under the navbar (the problem card on phones) would pin with its
  // bottom off-screen and be covered before its closing line is read. Pin such a card higher
  // instead (a negative top), so it only sticks once its bottom edge has scrolled into view.
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const all = [...stack.querySelectorAll<HTMLElement>("[data-stack-card]")];
    const fit = () => {
      for (const card of all) {
        card.style.top = `min(${STICKY_TOP}, calc(100svh - ${card.offsetHeight}px - 16px))`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    all.forEach((c) => ro.observe(c));
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <>
    <WhyRangDeMobile />
    <section className="mx-2 rounded-[16px] max-sm:hidden bg-[#DEDFE1] [--wg:32px] [--card-top:calc(var(--navbar-bottom,0px)+8px)] md:[--card-top:calc(var(--navbar-bottom,0px)+8px+56px+var(--wg))] lg:[--wg:48px] px-4 py-12 sm:px-8 sm:py-16 lg:p-[80px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center">
        <div
          ref={headRef}
          className="z-30 mb-8 flex h-[56px] w-full items-start justify-center bg-[#DEDFE1] md:sticky md:mb-0 md:h-[calc(56px+var(--wg))]"
          style={{ top: HEAD_TOP }}
        >
          <h2 className="flex h-[56px] items-center text-center font-display text-h3 font-bold text-ink">
            Why Rang De?
          </h2>
        </div>

        <div
          ref={stackRef}
          className="relative flex w-full flex-col gap-4 lg:gap-12"
        >
          {STACK.map((card, i) => (
            <div
              key={card.key}
              data-stack-card
              className="sticky flex md:min-h-[min(640px,calc(100svh-var(--navbar-bottom,74px)-120px))] w-full flex-col items-center justify-center gap-8 rounded-[8px] bg-white px-6 py-16 sm:gap-10 sm:px-10 sm:py-12 lg:gap-[clamp(24px,4svh,48px)] lg:px-[120px] lg:py-[clamp(40px,8svh,120px)]"
              style={{ top: STICKY_TOP, zIndex: i + 1 }}
            >
              <div className="flex max-w-[760px] flex-col items-center gap-4 text-center">
                <Badge kind={card.key} />
                <h3 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">
                  {card.heading}
                </h3>
              </div>

              <div className="relative grid w-full max-w-[1006px] grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
                <div
                  aria-hidden
                  className="absolute left-[16.67%] right-[16.67%] top-[22px] hidden border-t-2 border-dotted border-ink/24 sm:block md:top-[24px]"
                />
                {card.items.map((item, j) => (
                  <motion.div
                    key={item.text}
                    className="flex flex-row items-start gap-4 text-left max-sm:[&:nth-child(n+3)]:border-t-2 max-sm:[&:nth-child(n+3)]:border-dotted max-sm:[&:nth-child(n+3)]:border-ink/16 max-sm:[&:nth-child(n+3)]:pt-6 sm:flex-col sm:items-center sm:gap-3 sm:text-center"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.55,
                      delay: j * 0.1,
                      ease: EASE,
                    }}
                  >
                    <div className="relative z-10 shrink-0 bg-white sm:px-4">
                      <div className="relative size-[28px] shrink-0 sm:size-[44px] md:size-[48px]">
                        <Image
                          src={stillOf(item.icon)}
                          alt=""
                          fill
                          unoptimized
                          className="grayscale brightness-[0.62]"
                        />
                      </div>
                    </div>
                    <p className="font-display text-p2 font-medium text-ink/80">
                      <ItemText item={item} />
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="w-full max-w-[560px] rounded-[12px] bg-bg-grey px-5 py-4 text-center font-display text-p2 font-bold text-ink sm:w-auto sm:rounded-full sm:px-4 sm:py-2 sm:text-p3">
                <ItemText item={card.result} />
              </p>

              {/* Now that the problem and Rang De's answer are clear, the mechanics: opens the How
                  it works overlay, which grows out of this button. It lives inside the solution
                  card so the pinned, stacking cards can never cover it. */}
              {card.key === "solution" && (
                <HowItWorksTrigger className="shine-button inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-[8px] bg-primary px-8 py-4 font-display text-p2 font-bold text-white transition-[filter,transform] hover:brightness-105 active:scale-[0.98]">
                  See how it works
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </HowItWorksTrigger>
              )}
            </div>
          ))}
          {/* Room for the last card to settle at the pin line and hold there before the section scrolls on. */}
          <div aria-hidden className="h-[40px] lg:h-[96px]" />
        </div>
      </div>
    </section>
    </>
  );
}
