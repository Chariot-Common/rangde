"use client";

import { useEffect, useState } from "react";

const SIGNUP_URL = "https://rangde.in/account/signup";

/**
 * Phones only: the navbar drops its Invest button, and this "Get started" button floats at
 * the bottom of the screen instead — from the first scroll on, so the very first view stays
 * clean and the action is within thumb's reach as soon as someone starts reading.
 */
export function FloatingGetStarted() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Shows as soon as the page has been scrolled at all (one flick), hides again at the very top.
    const onScroll = () => setShow(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-2 bottom-[calc(8px+env(safe-area-inset-bottom))] z-[90] transition-[opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
        // a gentle rise and fade in (a short 20px lift over 0.7s), and a quicker fade away
        show ? "translate-y-0 opacity-100 duration-700" : "translate-y-5 opacity-0 duration-300"
      }`}
      aria-hidden={!show}
    >
      <a
        href={SIGNUP_URL}
        tabIndex={show ? 0 : -1}
        className={`flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary font-display text-p2 font-bold text-white shadow-[0_6px_20px_rgba(41,45,54,0.16)] active:brightness-95 ${show ? "pointer-events-auto" : ""}`}
      >
        Get started
      </a>
    </div>
  );
}
