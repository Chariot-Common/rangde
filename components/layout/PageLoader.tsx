"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { INSTANT_INTRO_ROUTES, INTRO_LOADER_ROUTES } from "@/lib/nav-intro";
import { PAGE_READY_EVENT } from "@/lib/use-page-ready";

/**
 * A brief full-screen splash shown until the page has fully loaded (images, fonts,
 * etc via the window "load" event), then fades out. Rendered on the server as part of
 * the initial HTML too, so it covers the page from first paint — not just after
 * hydration — avoiding a flash of an unstyled/half-loaded page on slow connections.
 */
const MAX_WAIT_MS = 800;

export function PageLoader() {
  // Always starts visible on both server and client — `document.readyState` is
  // browser-only, so basing the FIRST render on it would make the server's markup
  // disagree with the client's and trigger a hydration mismatch. The effect below only
  // runs post-hydration, so the one-time "already loaded" check is safe there.
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);
  // Pages whose hero intro is the loading screen (v3's pulsing logo) skip the splash; it still
  // signals "ready" on load so their intro starts on time.
  const pathname = usePathname();
  const bare = INTRO_LOADER_ROUTES.includes(pathname);
  const instant = INSTANT_INTRO_ROUTES.includes(pathname);

  useEffect(() => {
    const onLoad = () => setHidden(true);
    if (instant || document.readyState === "complete") {
      // Deferred a tick rather than calling setState synchronously in the effect body —
      // still effectively immediate, just async enough to satisfy the "no setState
      // directly in an effect" lint rule.
      const id = setTimeout(onLoad, 0);
      return () => clearTimeout(id);
    }
    // On slow mobile connections the "load" event can take many seconds (it waits on
    // every image), so never hold the splash longer than this.
    const maxWait = setTimeout(onLoad, MAX_WAIT_MS);
    window.addEventListener("load", onLoad);
    return () => {
      clearTimeout(maxWait);
      window.removeEventListener("load", onLoad);
    };
  }, [instant]);

  // Tells the page the splash is going away, so entrance animations (the hero) start as it
  // fades rather than playing unseen underneath it. See lib/use-page-ready.ts.
  useEffect(() => {
    if (!hidden) return;
    window.__rangdeReady = true;
    window.dispatchEvent(new Event(PAGE_READY_EVENT));
  }, [hidden]);

  useEffect(() => {
    document.body.style.overflow = hidden || bare ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hidden, bare]);

  // Unmount only after the fade-out transition finishes, matching duration-300 below.
  useEffect(() => {
    if (!hidden) return;
    const timeout = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timeout);
  }, [hidden]);

  if (!mounted || bare) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-white transition-opacity duration-300 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative size-[56px] animate-pulse">
        <Image src="/icons/rangde-logo-mark.svg" alt="" fill className="object-contain" priority />
      </div>
    </div>
  );
}
