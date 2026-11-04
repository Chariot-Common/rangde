"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type gsap from "gsap";
import { stories as defaultStories, type Story } from "@/lib/content";
import { StoryCard, type StoryCardLayout } from "./StoryCard";
import { SwipeCarousel } from "@/components/ui/SwipeCarousel";

// Single source of truth for auto-scroll speed, in pixels per second.
const AUTO_SCROLL_SPEED = 40;
// How long after a touch interaction ends before auto-scroll resumes.
const TOUCH_RESUME_DELAY_MS = 800;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// Below this, the one-card-at-a-time SwipeCarousel takes over (swipe, or every 3s). At
// and above it (tablet AND desktop), the continuous auto-scroll marquee runs — desktop
// used to fall back to a static grid here, which is what silently killed its auto-scroll;
// mobile is the only tier that gets the non-scrolling manual interaction.
const MOBILE_QUERY = "(max-width: 767px)";
const WIDE_QUERY = "(min-width: 768px)";

function subscribeToMediaQuery(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function getMediaQuerySnapshot(query: string) {
  return () => window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/** `items`/`layout`: the approach versions (app/v/v1, v1-2, v3) pass recent stories in the "recent" card layout. */
export function StoryCarousel({ items: stories = defaultStories, layout = "default" }: { items?: Story[]; layout?: StoryCardLayout } = {}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToMediaQuery(REDUCED_MOTION_QUERY),
    getMediaQuerySnapshot(REDUCED_MOTION_QUERY),
    getServerSnapshot,
  );
  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery(MOBILE_QUERY),
    getMediaQuerySnapshot(MOBILE_QUERY),
    getServerSnapshot,
  );
  // The md+ layouts below are display:none on phones, but eager images inside them would
  // still be downloaded (and preloaded in <head>) there. So they render lazy — which
  // skips display:none images — until we know the viewport is wide, then switch to eager
  // (the marquee needs eager: its cards move by transform, not scroll). False on the
  // server and during hydration, so phones never request them.
  const isWide = useSyncExternalStore(
    subscribeToMediaQuery(WIDE_QUERY),
    getMediaQuerySnapshot(WIDE_QUERY),
    getServerSnapshot,
  );
  const wideLoading = isWide ? "eager" : "lazy";

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    // isMobile is still the server's `false` on the hydration pass — check the real
    // viewport too, so phones never fetch GSAP for a marquee they don't show.
    if (window.matchMedia(MOBILE_QUERY).matches) return;
    const track = trackRef.current;
    if (!track) return;

    // GSAP is only needed for this md+ marquee, so it's loaded on demand here rather
    // than shipped in the initial bundle that phones download and parse too.
    let cancelled = false;
    let tween: gsap.core.Tween | null = null;
    import("gsap").then(({ default: gsapLib }) => {
      if (cancelled) return;
      // The track renders two identical sets back to back, so exactly half its scroll
      // width is one full set — animating xPercent from 0 to -50 and repeating
      // infinitely with a linear ease loops seamlessly with no visible reset.
      const setWidth = track.scrollWidth / 2;
      const duration = setWidth / AUTO_SCROLL_SPEED;

      tween = gsapLib.to(track, {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
      });
      tweenRef.current = tween;
    });

    return () => {
      cancelled = true;
      tween?.kill();
      tweenRef.current = null;
    };
  }, [reducedMotion, isMobile]);

  const pause = () => tweenRef.current?.pause();
  const resume = () => {
    if (!dragRef.current) tweenRef.current?.play();
  };

  // Drag to scrub: grabbing the strip pauses the loop and moves it with the pointer (the
  // tween's own progress, so it wraps seamlessly either way); letting go hands it back to
  // the auto-scroll from wherever it was left. Vertical swipes still scroll the page.
  const dragRef = useRef<{ x: number; progress: number; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const tween = tweenRef.current;
    if (!tween || (e.pointerType === "mouse" && e.button !== 0)) return;
    tween.pause();
    dragRef.current = { x: e.clientX, progress: tween.progress(), id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const tween = tweenRef.current;
    const track = trackRef.current;
    if (!drag || !tween || !track || e.pointerId !== drag.id) return;
    // One full loop of the tween moves the track by half its width.
    const p = drag.progress - (e.clientX - drag.x) / (track.scrollWidth / 2);
    tween.progress(((p % 1) + 1) % 1);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || e.pointerId !== dragRef.current.id) return;
    dragRef.current = null;
    setDragging(false);
    // A mouse is still over the strip (which holds it still); a finger has gone.
    if (e.pointerType !== "mouse") handleTouchEnd();
  };

  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const handleTouchStart = () => {
    clearResumeTimeout();
    pause();
  };

  const handleTouchEnd = () => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(resume, TOUCH_RESUME_DELAY_MS);
  };

  useEffect(() => clearResumeTimeout, []);

  // Only used as the reduced-motion fallback at desktop (see the early return below) —
  // prefers-reduced-motion should never get the continuous marquee, so it gets this
  // static, fluid grid instead (variant="grid" cards shrink together to fit, instead of
  // fixed-width marquee cards that would just sit cropped with nothing moving them).
  const desktopGrid = (
    <div className="hidden lg:grid lg:grid-cols-4 lg:gap-[8px]">
      {stories.map((story, i) => (
        <StoryCard layout={layout} key={i} story={story} variant="grid" loading={wideLoading} />
      ))}
    </div>
  );

  // Mobile (<768px): a swiper that runs edge to edge, the current story centred with the
  // ones either side peeking in (so swiping is obvious without the dots), moving on by
  // itself every 3 seconds.
  const mobileSwiper = (
    <div className="md:hidden">
      <SwipeCarousel
        items={stories}
        peek
        accent="green"
        autoAdvanceMs={3000}
        ariaLabel="Rural entrepreneur stories"
        // Only the first card is visible on load, so only it is fetched up front; the
        // rest switch to eager once hydrated on a phone, well before anyone can swipe
        // to them (and never on md+, where this swiper is display:none).
        renderItem={(story, i) => (
          <StoryCard layout={layout} key={i} story={story} variant="grid" loading={i === 0 || isMobile ? "eager" : "lazy"} />
        )}
      />
    </div>
  );

  if (reducedMotion) {
    return (
      <div className="w-full pb-[8px]">
        {mobileSwiper}
        <div className="hidden md:flex md:w-full md:snap-x md:snap-mandatory md:gap-[8px] md:overflow-x-auto md:scroll-smooth md:px-[80px] md:[scrollbar-width:none] lg:hidden md:[&::-webkit-scrollbar]:hidden">
          {stories.map((story, i) => (
            <StoryCard layout={layout} key={i} story={story} loading={wideLoading} />
          ))}
        </div>
        {desktopGrid}
      </div>
    );
  }

  return (
    <div className="w-full pb-[8px]">
      {mobileSwiper}
      {/* Tablet AND desktop (md+, 768px and up): the continuous auto-scroll marquee —
          restored to also cover desktop, which had been silently switched to a static
          grid (removing its auto-scroll) by an earlier overflow fix. Overflow is fully
          visible here — nothing clips the row itself. The loop still reads as seamless
          because Hero's own wrapper clips at the actual section/viewport edge, which is
          where the duplicated second set is meant to disappear anyway; that clip is also
          what stops this from ever causing page-level horizontal overflow. */}
      <div
        className={`hidden w-full touch-pan-y select-none overflow-x-visible overflow-y-visible md:block [&_img]:pointer-events-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={handleTouchStart}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="flex w-max gap-[8px]">
          {stories.map((story, i) => (
            <StoryCard layout={layout} key={`a-${i}`} story={story} loading={wideLoading} />
          ))}
          {/* Repeats: the loop shifts by half the track (xPercent -50), so half must stay wider
              than the screen — seven extra sets keep very wide / zoomed-out screens (~25%) filled. */}
          {[1, 2, 3, 4, 5, 6, 7].flatMap((n) =>
            stories.map((story, i) => <StoryCard layout={layout} key={`r${n}-${i}`} story={story} hiddenFromAT loading={wideLoading} />),
          )}
        </div>
      </div>
    </div>
  );
}
