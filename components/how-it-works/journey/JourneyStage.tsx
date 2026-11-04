"use client";

import { useEffect, useRef } from "react";
import { FRAME_H, FRAME_W, mountJourney } from "./journey";
import "./journey.css";

export type JourneyScene = "vet" | "choose" | "understand" | "lend" | "follow" | "earn";

/**
 * One scene of the "How it works v3" prototype (Durga's journey, journey.js) in a fixed app-sized
 * frame, scaled to fit its box and centred on the prototype's soft green and blue glow, which fills
 * the whole box. Changing scene blurs the old one out before the new one plays.
 */
export function JourneyStage({ scene, label }: { scene: JourneyScene; label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const box = boxRef.current;
    const frame = frameRef.current;
    if (!box || !frame) return;
    const fit = () => {
      const s = Math.min(1.15, box.clientWidth / FRAME_W, box.clientHeight / FRAME_H);
      frame.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    const frame = frameRef.current;
    if (!box || !frame) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const mount = () => {
      box.classList.remove("leaving");
      cleanup = mountJourney(frame, scene, reduced);
    };
    if (!mounted.current || reduced) {
      mounted.current = true;
      mount();
    } else {
      box.classList.add("leaving");
      timer = setTimeout(mount, 220);
    }
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [scene]);

  return (
    <div ref={boxRef} role="img" aria-label={label} className="hj size-full">
      <div ref={frameRef} aria-hidden="true" className="absolute left-1/2 top-1/2 origin-center" style={{ width: FRAME_W, height: FRAME_H }} />
    </div>
  );
}
