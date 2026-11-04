"use client";

import { useEffect, useRef } from "react";
import { FRAME_H, FRAME_W, mountJourney } from "./journey";
import "./journey.css";

export type JourneyScene = "vet" | "choose" | "understand" | "lend" | "follow" | "earn";

/** Boxes at least this wide put the caption beside the window instead of under it. */
const WIDE = 760;

/**
 * One scene of Durga's journey (journey.js): rangde.in's own UI in a browser window, scaled to fit,
 * with a caption that says what each beat shows, on the prototype's soft green and blue glow.
 * Changing scene blurs the old one out before the new one plays. With `loopMs`, the scene blurs
 * out and plays again from the start every `loopMs` until the scene changes.
 */
export function JourneyStage({ scene, label, loopMs }: { scene: JourneyScene; label: string; loopMs?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const box = boxRef.current;
    const area = areaRef.current;
    const frame = frameRef.current;
    if (!box || !area || !frame) return;
    const fit = () => {
      const wide = box.clientWidth >= WIDE;
      box.toggleAttribute("data-wide", wide);
      const pad = wide ? 32 : 12;
      const s = Math.min(1.1, (area.clientWidth - pad * 2) / FRAME_W, (area.clientHeight - pad * 2) / FRAME_H);
      frame.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    const frame = frameRef.current;
    const capEl = capRef.current;
    if (!box || !frame || !capEl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const mount = () => {
      box.classList.remove("leaving");
      capEl.innerHTML = "";
      cleanup = mountJourney(frame, scene, reduced, capEl);
      if (loopMs && !reduced) {
        timer = setTimeout(() => {
          box.classList.add("leaving");
          timer = setTimeout(() => {
            cleanup();
            mount();
          }, 220);
        }, loopMs);
      }
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
  }, [scene, loopMs]);

  return (
    <div ref={boxRef} role="img" aria-label={label} className="hj size-full">
      <div className="hj-lay">
        <div ref={areaRef} className="hj-area">
          <div ref={frameRef} aria-hidden="true" className="absolute left-1/2 top-1/2 origin-center" style={{ width: FRAME_W, height: FRAME_H }} />
        </div>
        <div ref={capRef} aria-hidden="true" className="hj-cap" />
      </div>
    </div>
  );
}
