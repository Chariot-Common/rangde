"use client";

import { usePageReady } from "@/lib/use-page-ready";

const SIGNUP_URL = "https://rangde.in/account/signup";

/**
 * Phones only: the navbar drops its Invest button, and this "Get started" button floats at
 * the bottom of the screen instead — there from the start, rising in as the page loader
 * clears, so the action is always within thumb's reach.
 */
export function FloatingGetStarted() {
  const show = usePageReady();

  return (
    <div
      className={`pointer-events-none fixed inset-x-2 bottom-[calc(8px+env(safe-area-inset-bottom))] z-[90] transition-[opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
        // a gentle rise and fade in (a short 20px lift over 0.7s) once the loader clears
        show ? "translate-y-0 opacity-100 duration-700" : "translate-y-5 opacity-0 duration-300"
      }`}
      aria-hidden={!show}
    >
      <a
        href={SIGNUP_URL}
        tabIndex={show ? 0 : -1}
        className={`flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary/72 font-display text-p2 font-bold text-white shadow-[0_8px_24px_rgba(41,45,54,0.12)] backdrop-blur-md active:bg-primary/84 ${show ? "pointer-events-auto" : ""}`}
      >
        Get started
      </a>
    </div>
  );
}
