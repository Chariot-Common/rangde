"use client";

import { useEffect, useState } from "react";

/** Fired by PageLoader once the splash starts fading out. */
export const PAGE_READY_EVENT = "rangde:page-ready";

declare global {
  interface Window {
    __rangdeReady?: boolean;
  }
}

/**
 * True once the page loader has gone (or straight away if it already has, e.g. after a
 * client-side navigation). Entrance animations wait on this so they aren't spent behind
 * the splash.
 */
export function usePageReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.__rangdeReady) {
      const id = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(id);
    }
    const onReady = () => setReady(true);
    window.addEventListener(PAGE_READY_EVENT, onReady);
    return () => window.removeEventListener(PAGE_READY_EVENT, onReady);
  }, []);
  return ready;
}
