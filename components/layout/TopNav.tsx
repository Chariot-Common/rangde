"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LegacyButton as Button } from "@/components/ui/LegacyButton";
import { IconButton } from "@/components/ui/IconButton";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { MobileMenu } from "@/components/MobileMenu";
import { useCtaLabel } from "@/lib/use-cta-label";
import { useNavHidden, useNavIntro, useNavStroke, useRefreshedNav } from "@/lib/nav-intro";
import { NavShine } from "./NavShine";

const SCROLL_THRESHOLD = 24;

export function TopNav() {
  const ctaLabel = useCtaLabel();
  // A hero intro (TypedHero) can hide the nav until it has settled, then bring it back with a shine.
  const intro = useNavIntro();
  const hidden = useNavHidden();
  // v5 / v6 have the refreshed nav; every other page keeps the original look.
  const refreshed = useRefreshedNav();
  // The refreshed nav's hairline, also on pages that keep the original nav (Version 2).
  const stroke = useNavStroke();
  // The shine sweeps Get started once: on v5 as its nav fades back in ("reveal"), on v6 as the logo lands
  // in the nav ("landing"), and on Version 1.1 as the page loader goes. Latched, so it isn't cut short
  // when the intro moves on to "shown".
  const [shine, setShine] = useState(false);
  const shineNow = intro === "reveal" || intro === "landing";
  useEffect(() => {
    if (!shineNow) return;
    const id = setTimeout(() => setShine(true), 0);
    return () => clearTimeout(id);
  }, [shineNow]);
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
      className={refreshed ? "!border-nav-line" : ""}
    >
      <MenuToggleIcon open={menuOpen} {...(refreshed ? { color: "var(--color-nav-navy)" } : {})} />
    </IconButton>
  );

  return (
    <div
      ref={navRef}
      className={`relative w-full px-4 py-[16px] transition-[background-color,backdrop-filter,box-shadow,opacity] duration-300 ease-out sm:px-6 ${
        refreshed ? "" : "md:px-10 lg:px-[135px]"
      } ${stroke ? "border-b border-nav-stroke" : ""} ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      } ${
        isScrolled
          ? `bg-white/82 backdrop-blur-[16px] ${stroke ? "" : "shadow-[0_1px_0_rgba(3,21,56,0.06)]"}`
          : "bg-transparent"
      }`}
    >
      {/* Mobile/tablet (<768px): logo left-aligned, Login and the hamburger on
          the right. Desktop keeps its original single-row layout, with Get started first. */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        <div className="flex shrink-0 flex-col items-start">
          <div className={`relative h-[36px] w-[46px] ${intro === "landing" ? "opacity-0" : ""}`}>
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
          <Button variant="secondary" size="sm" className={`relative !px-[12px] whitespace-nowrap ${refreshed ? "!bg-nav-sky !text-nav-navy" : ""}`}>
            Login
            <NavShine play={shine} />
          </Button>
          {toggleButton}
        </div>
      </div>

      <div className="hidden w-full items-center justify-between gap-4 md:flex">
        <div className="flex w-[220px] shrink-0 flex-col items-start lg:w-[232px]">
          <div className={`relative h-[48px] w-[60px] ${intro === "landing" ? "opacity-0" : ""}`}>
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
            className={`relative !px-[16px] ${refreshed ? "!bg-nav-navy !text-white" : ""}`}
            onClick={() => window.location.assign("https://rangde.in/account/signup")}
          >
            {ctaLabel}
            <NavShine play={shine} />
          </Button>
          <Button variant="secondary" size="sm" className={`relative !px-[16px] ${refreshed ? "!bg-nav-sky !text-nav-navy" : ""}`}>
            Login
            <NavShine play={shine} />
          </Button>
          {toggleButton}
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </div>
  );
}
