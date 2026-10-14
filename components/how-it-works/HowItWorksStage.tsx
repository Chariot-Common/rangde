"use client";

import { useEffect, useRef } from "react";
import { ASSETS, STAGE_H, STAGE_W, mountFigmaStep } from "./figma-motion";
import "./figma-motion.css";

let preloaded = false;

/**
 * The animated illustration for one How it works step: Figma's own motion (figma-motion.js),
 * a fixed 374x342 frame that's scaled to fit whatever space the modal gives it — full width
 * on phones, the left panel on desktop — so it stays pixel-faithful at every size.
 * Changing step fades the old stage out before the new one plays.
 */
export function HowItWorksStage({ stepIndex, label }: { stepIndex: number; label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  // Fit the frame: as large as the box allows, never cropped, centred.
  useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;
    const fit = () => {
      const s = Math.min(box.clientWidth / STAGE_W, box.clientHeight / STAGE_H);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // Warm the cache for every step's images once, so later steps don't pop in.
  useEffect(() => {
    if (preloaded) return;
    preloaded = true;
    ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const mount = () => {
      cleanup = mountFigmaStep(stage, stepIndex, reduced);
      stage.classList.remove("leaving");
    };
    if (!hasMounted.current || reduced) {
      hasMounted.current = true;
      mount();
    } else {
      stage.classList.add("leaving");
      timer = setTimeout(mount, 200);
    }
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [stepIndex]);

  return (
    <div ref={boxRef} role="img" aria-label={label} className="relative size-full overflow-hidden bg-white">
      <div
        ref={stageRef}
        aria-hidden="true"
        className="hfm absolute left-1/2 top-1/2 origin-center transition-[opacity,filter] duration-200"
        style={{ width: STAGE_W, height: STAGE_H }}
      />
    </div>
  );
}
