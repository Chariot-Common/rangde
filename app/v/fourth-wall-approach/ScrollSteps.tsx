"use client";
import { useEffect } from "react";
import { centreScrollFor, pinScrollAt } from "./pin";

/*
 * Scroll steps for the sections above "Investing through Rang De is the solution" (laptops and desktops with a mouse or
 * trackpad). One flick of the wheel, or one arrow / Page / Space key, glides to the next stop instead of scrolling freely:
 *   the hero at the top · Problem pinned in the middle, then with its note open · Why's copy in the middle · the Contrast
 *   heading and table in the middle (the objects land on the way) · the catch sequence's three states.
 * Past the last stop the page scrolls normally; scrolling back up into the stops picks them up again.
 * Stops come from the markup: [data-fw-snap="center"] centres that element; [data-fw-pin="0,0.45,0.8"] stops a pinned
 * section at those points of its pinned stretch (see pin.ts).
 */

const DESKTOP = "(min-width: 1024px) and (pointer: fine)";
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function stops() {
  const out = [0];
  document.querySelectorAll<HTMLElement>("[data-fw-snap='center']").forEach((el) => out.push(centreScrollFor(el)));
  document.querySelectorAll<HTMLElement>("[data-fw-pin]").forEach((pin) => {
    if (!pin.offsetParent) return; // hidden (phones get the catch sequence unpinned)
    pin.dataset.fwPin!.split(",").forEach((p) => out.push(pinScrollAt(pin, Number(p))));
  });
  return out.map((y) => Math.max(0, Math.round(y))).sort((a, b) => a - b);
}

export function ScrollSteps() {
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    let raf = 0;
    let busyUntil = 0;
    let lastWheel = 0;
    let gestureUsed = false;

    const glide = (to: number) => {
      const from = window.scrollY;
      const dist = Math.abs(to - from);
      if (dist < 2) return;
      const ms = Math.min(1200, Math.max(650, dist * 0.9));
      const t0 = performance.now();
      busyUntil = t0 + ms + 150;
      cancelAnimationFrame(raf);
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    /** Returns true when it took the step (the native scroll should be cancelled). */
    const step = (dir: 1 | -1) => {
      const list = stops();
      const last = list[list.length - 1];
      const y = window.scrollY;
      if (y > last + 4) return false; // below the stops: scroll freely
      if (dir > 0) {
        const next = list.find((v) => v > y + 4);
        if (next === undefined) return false; // at the last stop: let the page carry on
        glide(next);
      } else {
        const prev = [...list].reverse().find((v) => v < y - 4);
        if (prev === undefined) return false;
        glide(prev);
      }
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      const y = window.scrollY;
      const list = stops();
      const inside = y <= list[list.length - 1] + 4;
      if (!inside && e.deltaY > 0) return;
      // One gesture, one step: a trackpad's inertia keeps sending wheel events, so a gesture only ends after a pause.
      if (gap > 180) gestureUsed = false;
      if (now < busyUntil || gestureUsed) {
        if (inside) e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 2) return;
      if (step(e.deltaY > 0 ? 1 : -1)) {
        gestureUsed = true;
        e.preventDefault();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (!mq.matches || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey);
      const up = e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (performance.now() < busyUntil) {
        e.preventDefault();
        return;
      }
      if (step(down ? 1 : -1)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
