"use client";

import { useEffect, useRef } from "react";
import type { Testimonial } from "@/lib/content";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialMarqueeProps {
  items: Testimonial[];
  align: "left" | "right";
  direction: "forward" | "reverse";
  /** Version 1.1: the row can also be grabbed and dragged left or right (mouse or touch). */
  draggable?: boolean;
}

// Direction/speed aren't specified by the static Figma frame — alternating directions
// per row is a reasonable default for a two-row marquee, noted as an assumption.
export function TestimonialMarquee({ items, align, direction, draggable = false }: TestimonialMarqueeProps) {
  // Eight copies (not two): the loop moves -50%, so half the track must still be wider than
  // the screen. With only two, very wide or zoomed-out screens (down to ~25%) ran out of
  // cards and the row sat left-aligned with a gap on the right.
  const looped = Array.from({ length: 8 }, () => items).flat();

  if (draggable) return <DragMarquee items={looped} align={align} direction={direction} />;

  return (
    <div className="group w-full overflow-hidden">
      {/* Default `items-stretch` so every card in the row matches the tallest card's
          height — TestimonialCard's own `justify-between` (see that file) is what
          keeps this looking intentional: the extra space goes between the quote and
          the footer instead of stacking up as dead space below the footer. */}
      <div
        className={`flex w-max gap-sp3 ${
          direction === "reverse" ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover:[animation-play-state:paused]`}
      >
        {looped.map((testimonial, i) => (
          <TestimonialCard key={i} testimonial={testimonial} align={align} />
        ))}
      </div>
    </div>
  );
}

// The CSS marquee's pace: half the eight-copy track every 240s (see animate-marquee in globals.css).
const LOOP_SECONDS = 240;

/** The same ticker, driven from script so it can stop on hover and be dragged either way. */
function DragMarquee({ items, align, direction }: { items: Testimonial[]; align: "left" | "right"; direction: "forward" | "reverse" }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, hover: false, drag: false, startX: 0, startOffset: 0, moved: false, id: -1 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sign = direction === "reverse" ? 1 : -1;
    let raf = 0;
    let last = performance.now();
    const half = () => track.scrollWidth / 2;
    // Starts mid-loop for the reverse row, so it has cards on its left from the first frame.
    if (direction === "reverse") st.current.x = -half();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const s = st.current;
      const h = half();
      if (!s.hover && !s.drag && !reduce && h > 0) s.x += (sign * h * dt) / LOOP_SECONDS;
      // Keep x within one loop (-half..0), so the row never runs out of cards either way.
      if (h > 0) s.x = ((s.x % h) - h) % h;
      track.style.transform = `translate3d(${s.x}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  return (
    <div
      ref={wrapRef}
      className="w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      onPointerEnter={(e) => e.pointerType === "mouse" && (st.current.hover = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (st.current.hover = false)}
      onPointerDown={(e) => {
        st.current.drag = true;
        st.current.moved = false;
        st.current.id = e.pointerId;
        st.current.startX = e.clientX;
        st.current.startOffset = st.current.x;
      }}
      onPointerMove={(e) => {
        if (!st.current.drag || e.pointerId !== st.current.id) return;
        const dx = e.clientX - st.current.startX;
        if (!st.current.moved && Math.abs(dx) > 4) {
          st.current.moved = true;
          wrapRef.current?.setPointerCapture(e.pointerId);
        }
        if (st.current.moved) st.current.x = st.current.startOffset + dx;
      }}
      onPointerUp={() => (st.current.drag = false)}
      onPointerCancel={() => (st.current.drag = false)}
      // A drag that moved shouldn't also count as a click on a card's link.
      onClickCapture={(e) => st.current.moved && (e.preventDefault(), e.stopPropagation())}
      onDragStart={(e) => e.preventDefault()}
    >
      <div ref={trackRef} className="flex w-max gap-sp3 will-change-transform">
        {items.map((testimonial, i) => (
          <TestimonialCard key={i} testimonial={testimonial} align={align} />
        ))}
      </div>
    </div>
  );
}
