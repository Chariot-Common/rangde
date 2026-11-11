"use client";

import { useEffect, useState } from "react";
import { usePageReady } from "@/lib/use-page-ready";
import { useCtaLabel } from "@/lib/use-cta-label";
import { useCtaHidesOnScrollUp, useNavHidden } from "@/lib/nav-intro";

const SIGNUP_URL = "https://rangde.in/account/signup";
// How far the page has to move in one direction before the button reacts, so a finger's small wobble doesn't flicker it.
const SCROLL_SLACK = 8;

/**
 * Phones only: the navbar drops its Invest button, and this "Get started" button floats at
 * the bottom of the screen instead — there from the start, rising in as the page loader
 * clears, so the action is always within thumb's reach. On some versions (Version 2) it steps
 * aside while the page is scrolled up, fading out as it drops, and comes back as it's scrolled down.
 */
export function FloatingGetStarted() {
  // Held back, like the nav, while a hero intro (TypedHero) is playing.
  const ready = usePageReady();
  const hidden = useNavHidden();
  const hidesOnScrollUp = useCtaHidesOnScrollUp();
  const [scrollingUp, setScrollingUp] = useState(false);
  const label = useCtaLabel();

  useEffect(() => {
    if (!hidesOnScrollUp) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < SCROLL_SLACK) return;
      setScrollingUp(y < last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidesOnScrollUp]);

  const show = ready && !hidden && !(hidesOnScrollUp && scrollingUp);

  return (
    <div
      className={`pointer-events-none fixed inset-x-2 bottom-[calc(8px+env(safe-area-inset-bottom))] z-[90] transition-[opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
        // a gentle rise and fade in (a short 20px lift over 0.7s) once the loader clears, or as the page is scrolled down
        // again; dropping and fading out together when it steps aside
        show ? "translate-y-0 opacity-100 duration-700" : "translate-y-5 opacity-0 duration-300"
      }`}
      aria-hidden={!show}
    >
      <a
        href={SIGNUP_URL}
        tabIndex={show ? 0 : -1}
        className={`flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary font-display text-p2 font-bold text-white shadow-[0_8px_24px_rgba(41,45,54,0.18)] active:brightness-95 ${show ? "pointer-events-auto" : ""}`}
      >
        {label}
      </a>
    </div>
  );
}
