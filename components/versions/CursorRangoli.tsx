"use client";

import { useEffect, useRef } from "react";

/*
 * An ambient touch for Version 1.1 (Figma "Radial touch (small parts of the rangoli)", 2195:1799):
 * the Rang De leaf pattern sits behind the page at 8% opacity, hidden except for a soft circle
 * under the mouse. As in the Figma demo, the circle swells with the speed of the mouse (up to about
 * 4.3x); when the mouse is still or barely moving it shrinks away to nothing, leaving plain white. It only shows through white space:
 * anything with its own background covers it. Mouse/trackpad only, and off for reduced motion.
 */

const BASE_RADIUS = 110; // px at scale 1
const MIN_SCALE = 0.8; // smallest size once the mouse is moving, as in the Figma demo
const MIN_SPEED = 0.15; // px/ms: slower than this (or still) and the circle disappears
const MAX_SCALE = 4.26; // fastest size, as in the Figma demo
const SPEED_TO_SCALE = 1.6; // extra scale per px/ms of mouse speed
const FOLLOW = 0.18; // how quickly the circle catches up with the mouse each frame
const GROW = 0.12; // how quickly it swells towards its target size
const SETTLE = 0.04; // how quickly it shrinks back once the mouse slows

export function CursorRangoli() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: -1000, y: -1000 };
    const pos = { x: -1000, y: -1000 };
    let scale = 0;
    let speed = 0;
    let last = { x: 0, y: 0, t: 0 };
    let raf = 0;
    let visible = false;

    const frame = () => {
      raf = 0;
      pos.x += (target.x - pos.x) * FOLLOW;
      pos.y += (target.y - pos.y) * FOLLOW;
      speed *= 0.9; // speed fades once the mouse stops moving
      const want = speed < MIN_SPEED ? 0 : Math.min(MAX_SCALE, MIN_SCALE + (speed - MIN_SPEED) * SPEED_TO_SCALE);
      scale += (want - scale) * (want > scale ? GROW : SETTLE);
      el.style.setProperty("--x", `${pos.x}px`);
      el.style.setProperty("--y", `${pos.y}px`);
      el.style.setProperty("--r", `${BASE_RADIUS * scale}px`);
      const moving = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5 || Math.abs(want - scale) > 0.005 || speed > 0.01;
      if (moving) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      if (last.t) {
        // At least a frame apart, so two events that arrive together don't read as a burst of speed.
        const dt = Math.max(16, now - last.t);
        const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt;
        speed = Math.max(speed, Math.min(v, 4));
      }
      last = { x: e.clientX, y: e.clientY, t: now };
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        // First move: start the circle under the mouse rather than flying in from off screen.
        pos.x = target.x;
        pos.y = target.y;
        visible = true;
        el.style.opacity = "1";
      }
      wake();
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-0 transition-opacity duration-500"
      style={{
        backgroundImage: "url(/images/hero-intro/rangoli-pattern.webp)",
        // The pattern itself at 8%, shown only inside a soft circle around the mouse.
        WebkitMaskImage: "radial-gradient(circle var(--r, 0px) at var(--x, -1000px) var(--y, -1000px), rgba(0,0,0,0.08), rgba(0,0,0,0.05) 45%, transparent)",
        maskImage: "radial-gradient(circle var(--r, 0px) at var(--x, -1000px) var(--y, -1000px), rgba(0,0,0,0.08), rgba(0,0,0,0.05) 45%, transparent)",
      }}
    />
  );
}
