"use client";

import { useReducedMotion } from "motion/react";

const DIGITS = "0123456789";

/**
 * Odometer-style number: each digit is a column of 0–9 that rolls up to its value when
 * `play` turns true, the columns a beat apart from left to right. Commas, "₹", "%" etc.
 * stay put. Screen readers get the plain value.
 */
export function Ticker({ value, play, delay = 0, className = "" }: { value: string; play: boolean; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;

  let digitIndex = 0;
  return (
    <span className={`inline-flex ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {[...value].map((ch, i) => {
          const d = DIGITS.indexOf(ch);
          if (d === -1) return <span key={i}>{ch}</span>;
          const k = digitIndex++;
          return (
            <span key={i} className="inline-block h-[1lh] overflow-hidden">
              <span
                className="flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateY(${play ? -d * 10 : 0}%)`, transitionDelay: `${delay + k * 60}ms` }}
              >
                {[...DIGITS].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
