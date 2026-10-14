"use client";

import { useEffect, useState } from "react";

const SIGNUP_URL = "https://rangde.in/account/signup";

/**
 * Phones only: the navbar drops its Invest button, and this "Get started" button floats at
 * the bottom of the screen instead — but only once the hero has scrolled away, so the first
 * screen stays clean and the action is always within thumb's reach after that.
 */
export function FloatingGetStarted() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[90] px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-6 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      aria-hidden={!show}
    >
      <a
        href={SIGNUP_URL}
        tabIndex={show ? 0 : -1}
        className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-primary/72 font-display text-p2 font-bold text-white shadow-[0_8px_24px_rgba(41,45,54,0.12)] backdrop-blur-md active:bg-primary/84"
      >
        Get started
      </a>
    </div>
  );
}
