"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { MobileMenu } from "@/components/MobileMenu";
import { useCtaLabel } from "@/lib/use-cta-label";

const SCROLL_THRESHOLD = 24;

export function TopNav() {
  const ctaLabel = useCtaLabel();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Published as a CSS var so the mobile menu can anchor itself exactly to the
  // navbar's bottom edge without duplicating a hardcoded offset in a second place.
  // This tracks the navbar's live distance from the viewport top rather than just its
  // own height: at the hero state the (non-sticky) announcement bar still sits above
  // it, so the navbar's bottom edge starts further down and rises to `navbar height`
  // once the announcement bar has scrolled past and the header engages `sticky`.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // Setting a variable on <html> makes the browser recheck styles across the whole page, so it
    // is only written when the value actually changes (in practice, only while the announcement
    // bar scrolls away), and measured at most once a frame.
    let last = "";
    let raf = 0;
    const write = () => {
      raf = 0;
      const value = `${nav.getBoundingClientRect().bottom}px`;
      if (value === last) return;
      last = value;
      document.documentElement.style.setProperty("--navbar-bottom", value);
    };
    const updateBottomVar = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", updateBottomVar, { passive: true });
    window.addEventListener("resize", updateBottomVar);
    const observer = new ResizeObserver(updateBottomVar);
    observer.observe(nav);
    return () => {
      window.removeEventListener("scroll", updateBottomVar);
      window.removeEventListener("resize", updateBottomVar);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  };

  const toggleButton = (
    <IconButton
      ref={toggleRef}
      aria-expanded={menuOpen}
      aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
      onClick={() => setMenuOpen((open) => !open)}
    >
      <MenuToggleIcon open={menuOpen} />
    </IconButton>
  );

  return (
    <div
      ref={navRef}
      className={`relative w-full px-4 py-[16px] transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-out sm:px-6 md:px-10 lg:px-[135px] ${
        isScrolled
          ? "bg-white/82 shadow-[0_1px_0_rgba(3,21,56,0.06)] backdrop-blur-[16px]"
          : "bg-transparent"
      }`}
    >
      {/* Mobile/tablet (<768px): logo left-aligned, Sign up / Login and the hamburger on
          the right. Desktop keeps its original single-row layout, with Get started first. */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        <div className="flex shrink-0 flex-col items-start">
          <div className="relative h-[36px] w-[46px]">
            <Image src="/icons/rangde-logo-mark.svg" alt="Rang De" fill className="object-contain" priority />
          </div>
          {/* Same as the live rangde.in mobile header (4px / 8px, 0.32px tracking). */}
          <p className="mt-0.5 whitespace-nowrap font-display text-[4px] font-medium uppercase leading-[8px] tracking-[0.32px] text-ink/48">
            Rang De P2P Financial Services Ltd.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-[6px]">
          {/* No Invest button on phones: a "Get started" button floats at the bottom once the
              hero has scrolled away (FloatingGetStarted). */}
          <Button variant="secondary" size="sm" className="!px-[12px] whitespace-nowrap">
            Sign up / Login
          </Button>
          {toggleButton}
        </div>
      </div>

      <div className="hidden w-full items-center justify-between gap-4 md:flex">
        <div className="flex w-[220px] shrink-0 flex-col items-start lg:w-[232px]">
          <div className="relative h-[48px] w-[60px]">
            <Image src="/icons/rangde-logo-mark.svg" alt="Rang De" fill className="object-contain" priority />
          </div>
          {/* Same size as the live rangde.in header (6px / 8px, 0.48px tracking). */}
          <p className="mt-0.5 whitespace-nowrap font-display text-[6px] font-medium uppercase leading-[8px] tracking-[0.48px] text-ink/48">
            Rang De P2P Financial Services Ltd.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-[8px]">
          <Button
            variant="primary"
            size="sm"
            className="!px-[16px]"
            onClick={() => window.location.assign("https://rangde.in/account/signup")}
          >
            {ctaLabel}
          </Button>
          <Button variant="secondary" size="sm" className="!px-[16px]">
            Sign up / Login
          </Button>
          {toggleButton}
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </div>
  );
}
