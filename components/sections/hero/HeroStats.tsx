"use client";

import Image from "next/image";
import { useInView } from "motion/react";
import { useRef } from "react";
import { heroStats } from "@/lib/content";
import { useAnimatedNumber } from "@/lib/use-animated-number";

const COUNT_UP_DURATION = 1800;
const STAGGER_MS = 100;

function StatNumber({ target, format, index, inView }: { target: number; format: (n: number) => string; index: number; inView: boolean }) {
  const value = useAnimatedNumber(inView ? target : 0, {
    duration: COUNT_UP_DURATION,
    delay: index * STAGGER_MS,
    enabled: inView,
  });

  return (
    <p
      className="font-display text-[24px] font-bold leading-[28px] text-ink lg:text-h4 lg:leading-[40px]"
      // Tabular digits only while counting (stops the width jittering); once settled, back to
      // Inter's normal digits — its tabular "1" is extra-wide and reads oddly at rest.
      style={{ fontVariantNumeric: value === target ? "normal" : "tabular-nums" }}
    >
      {format(value)}
    </p>
  );
}

// Mobile-only visual order: the RBI seal (source index 2) leads, centered above a 2x2
// grid of the four numeric stats in their original left-to-right sequence. `sm:order-none`
// below cancels this back to plain DOM order — i.e. the original, untouched desktop
// sequence (entrepreneurs, total invested, RBI, investors, principal repaid) — once the
// layout switches from this grid to the desktop flex row. Tailwind classes (not inline
// `style`) are required here so `sm:order-none` can actually win at that breakpoint —
// an inline style would always beat it regardless of viewport width.
const MOBILE_ORDER_CLASS = ["order-[2]", "order-[3]", "order-[1]", "order-[4]", "order-[5]"];

/** `start`: when given, the numbers wait for it too — the hero's intro turns it on right
 * after its body copy has come in. Either way they only count once the row is on screen. */
export function HeroStats({ start }: { start?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  // Triggers once, the first time the stats row enters the viewport.
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const inView = seen && start !== false;
  const rbiIndex = heroStats.findIndex((stat) => stat.kind === "icon");

  return (
    <div
      ref={ref}
      className="grid w-full grid-cols-2 gap-x-6 gap-y-12 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-[16px] sm:gap-y-8 lg:flex-nowrap"
    >
      {heroStats.map((stat, index) => {
        const isRbi = index === rbiIndex;
        return (
          <div
            key={stat.label}
            className={`flex flex-col items-center gap-[8px] sm:order-none sm:flex-1 ${MOBILE_ORDER_CLASS[index]} ${
              isRbi ? "col-span-2 justify-self-center" : ""
            }`}
          >
            {stat.kind === "number" ? (
              <StatNumber target={stat.target} format={stat.format} index={index} inView={inView} />
            ) : (
              <div className="relative h-[48px] w-[48px] sm:h-[64px] sm:w-[64px]">
                <Image src={stat.icon} alt="" fill sizes="64px" className="object-cover" />
              </div>
            )}
            <p className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[1.2px] text-ink/80 sm:font-eyebrow sm:text-h5 sm:tracking-[1.44px]">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
