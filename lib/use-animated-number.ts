"use client";

import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface UseAnimatedNumberOptions {
  /** Tween duration in ms. */
  duration?: number;
  /** Delay before the tween starts, in ms. */
  delay?: number;
  easing?: (t: number) => number;
  /** When false, the value tracks target directly instead of animating (e.g. before entering view). */
  enabled?: boolean;
}

/**
 * Tweens a numeric value toward `target`. Re-triggering with a new target mid-animation
 * interrupts cleanly and continues from the current interpolated value — safe to call on
 * every slider `onChange` during a rapid, continuous drag.
 */
export function useAnimatedNumber(
  target: number,
  { duration = 200, delay = 0, easing = easeOutCubic, enabled = true }: UseAnimatedNumberOptions = {},
) {
  const [animated, setAnimated] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    if (!enabled) {
      currentRef.current = target;
      return;
    }

    const from = currentRef.current;
    const to = target;
    if (from === to) return;

    let cancelled = false;
    let rafId: number | null = null;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (cancelled) return;
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const current = from + (to - from) * easing(t);
      currentRef.current = current;
      setAnimated(current);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const timeoutId = window.setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [target, enabled, duration, delay, easing]);

  if (!enabled) {
    return target;
  }
  return animated;
}
