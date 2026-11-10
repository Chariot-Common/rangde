"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

/**
 * The top nav's part in a page's intro. A hero that runs its own entrance (TypedHero on /v/v5,
 * CoinHero on /v/v6) sets "hidden" before first paint, then "reveal" (fade back in with a shine on
 * Get started) or "shown" once it has settled ("landing": shown, but with the nav's own logo invisible
 * while the intro's flying logo sits over it). "idle" is the state before any intro has said
 * anything: the nav shows, except on the pages below.
 */
export type NavIntro = "idle" | "shown" | "hidden" | "reveal" | "landing";

/** Pages whose hero intro is itself the loading screen: no page loader, and the nav starts hidden
 * from the server-rendered first paint rather than only once the hero has hydrated. */
export const INTRO_LOADER_ROUTES = ["/v/v5"];

/** Of those, the pages whose intro starts at once rather than waiting for the window "load" event
 * (v5 opens straight on its typed headline; nothing on screen depends on the images having loaded). */
export const INSTANT_INTRO_ROUTES = ["/v/v5"];

/** Versions with the refreshed nav (navy Get started, "Login", a hairline under it, 24px sides) and no
 * announcement bar above it. Every other page keeps the original nav. */
export const REFRESHED_NAV_ROUTES = ["/v/v5", "/v/v3", "/v/v3-1"]; // v3 and v3.1 were "Version 6"
export function useRefreshedNav() {
  return REFRESHED_NAV_ROUTES.includes(usePathname());
}

let state: NavIntro = "idle";
const listeners = new Set<() => void>();

export function setNavIntro(next: NavIntro) {
  if (next === state) return;
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNavIntro(): NavIntro {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => "idle",
  );
}

/** Whether the nav (and the phone's floating Get started) should be hidden right now. */
export function useNavHidden() {
  const intro = useNavIntro();
  const pathname = usePathname();
  return intro === "hidden" || (intro === "idle" && INTRO_LOADER_ROUTES.includes(pathname));
}
