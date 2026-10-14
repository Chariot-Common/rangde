"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface SwipeCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Used for the track's own aria-label and the pagination dots' group label. */
  ariaLabel: string;
  /**
   * Edge-to-edge track with the active item centred and its neighbours peeking in on both
   * sides — so it's obvious there's more to swipe to, even before anyone spots the dots.
   */
  peek?: boolean;
  /** Moves to the next item after this many ms (looping), pausing while it's being touched. */
  autoAdvanceMs?: number;
}

/**
 * A manual, one-item-at-a-time mobile carousel: native horizontal scroll + CSS scroll
 * snap (so it's real touch scrolling, not a simulated drag), with no continuous
 * translation. By default each item fills the track's (padded) width and it sits still
 * until swiped; `peek` and `autoAdvanceMs` turn it into the centred, self-advancing version.
 */
export function SwipeCarousel<T>({ items, renderItem, ariaLabel, peek = false, autoAdvanceMs }: SwipeCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touching, setTouching] = useState(false);

  // The item whose centre is nearest the track's centre (works for full-width and peeking items).
  const indexAtScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    [...track.children].forEach((child, i) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActiveIndex(indexAtScroll());
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [indexAtScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const item = track?.children[index] as HTMLElement | undefined;
    if (!track || !item) return;
    track.scrollTo({ left: item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
  }, []);

  // Auto-advance: the timer restarts whenever the active item changes (a swipe counts too),
  // and holds off entirely while a finger is on the track.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!autoAdvanceMs || touching || items.length < 2 || reduced) return;
    const id = setTimeout(() => scrollToIndex((activeIndex + 1) % items.length), autoAdvanceMs);
    return () => clearTimeout(id);
  }, [autoAdvanceMs, touching, activeIndex, items.length, scrollToIndex, reduced]);

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
        onTouchCancel={() => setTouching(false)}
        className={`flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          peek ? "gap-2 px-[8%]" : "gap-4"
        }`}
      >
        {items.map((item, i) => (
          <div key={i} className={`shrink-0 grow-0 ${peek ? "basis-[84%] snap-center" : "basis-[calc(100%-16px)] snap-start"}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div
          role="tablist"
          aria-label={`${ariaLabel} pagination`}
          className="mt-[10px] flex items-center justify-center gap-2"
        >
          {items.map((_, i) => {
            const active = i === activeIndex;
            // When it moves on its own, the active dot is a short track that fills up over
            // the interval — a quiet "this is moving" cue. Otherwise it's a solid pill.
            const timed = active && autoAdvanceMs && !reduced;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Go to item ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`relative shrink-0 overflow-hidden rounded-full transition-all duration-200 ${
                  active ? (timed ? "h-[6px] w-[28px] bg-primary/24" : "h-[5px] w-[16px] bg-primary") : "h-[6px] w-[6px] bg-ink/16"
                }`}
              >
                {timed && (
                  <span
                    // re-keyed when the slide changes or a touch ends, so the fill restarts with the timer
                    key={`${activeIndex}-${touching}`}
                    className="absolute inset-0 origin-left rounded-full bg-primary"
                    style={{ animation: `dot-fill ${autoAdvanceMs}ms linear forwards`, animationPlayState: touching ? "paused" : "running" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
