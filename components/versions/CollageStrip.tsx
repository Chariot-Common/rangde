"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/*
 * Version 6's hero gallery: a collage of photos filling the screen below the stats, 8px apart with 8px
 * corners and 8px from either edge of the screen, laid out like the reference: columns that are either one
 * photo or two rows, where a row is one photo or two side by side (never more than two rows). The columns
 * always fit the screen exactly.
 *
 * The frames never move. Every 4 seconds one photo, working left to right, fades out into another that is
 * already waiting behind it, so the change is a smooth dissolve inside a still frame.
 */

const GAP = 8; // px between photos, and from the edges of the screen
const INTERVAL = 4000; // ms between one photo changing and the next
const FADE = 1.2; // s for a photo to dissolve into the next

// The gallery photos (public/images/collage), used in turn.
const POOL = Array.from({ length: 18 }, (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.webp`);

/** A row: the number of photos side by side, and the left photo's share of the width. */
type Row = { cells: number; split: number };
/** A column: its natural width as a multiple of the strip's height, and one or two rows (`split` = the top row's share). */
type Shape = { w: number; rows: Row[]; split: number };

// The column shapes in the reference, in order: a wide single photo; two photos stacked; two rows of
// two side by side (a tall pair over a short strip); another wide single; a narrow portrait; a pair
// over a single.
const SHAPES: Shape[] = [
  { w: 1.32, rows: [{ cells: 1, split: 1 }], split: 1 },
  { w: 0.54, rows: [{ cells: 1, split: 1 }, { cells: 1, split: 1 }], split: 0.36 },
  { w: 1.66, rows: [{ cells: 2, split: 0.36 }, { cells: 2, split: 0.84 }], split: 0.66 },
  { w: 1.25, rows: [{ cells: 1, split: 1 }], split: 1 },
  { w: 0.42, rows: [{ cells: 1, split: 1 }], split: 1 },
  { w: 0.95, rows: [{ cells: 2, split: 0.5 }, { cells: 1, split: 1 }], split: 0.42 },
];

/** How many columns (from the start of the sequence) best fill `width` at strip height `h`. */
function columnsFor(width: number, h: number) {
  let used = 0;
  for (let n = 1; n <= 12; n++) {
    const next = used + SHAPES[(n - 1) % SHAPES.length].w * h + (n > 1 ? GAP : 0);
    // Stop at the count whose natural widths come closest to the room.
    if (next > width) return Math.abs(next - width) < Math.abs(used - width) ? n : Math.max(1, n - 1);
    used = next;
  }
  return 12;
}

export function CollageStrip() {
  const reduce = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(5);

  // Size the strip to fill the screen down to the bottom and pick how many columns fit.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const fit = () => {
      let top = 0;
      for (let el: HTMLElement | null = strip; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      const h = Math.min(560, Math.max(220, window.innerHeight - top - GAP));
      strip.style.setProperty("--h", `${h}px`);
      setCount(columnsFor(strip.clientWidth - 2 * GAP, h));
    };
    const raf = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  const columns = useMemo(() => Array.from({ length: count }, (_, i) => SHAPES[i % SHAPES.length]), [count]);
  const total = columns.reduce((n, c) => n + c.rows.reduce((m, r) => m + r.cells, 0), 0);

  // What each frame shows, in reading order. The pool is dealt out in turn, skipping any photo already on screen.
  const [photos, setPhotos] = useState<string[]>(() => Array.from({ length: 40 }, (_, i) => POOL[i % POOL.length]));
  const photosRef = useRef(photos);
  const tick = useRef(0);
  const dealt = useRef(40);

  useEffect(() => {
    if (reduce || total === 0) return;
    const id = setInterval(() => {
      const cell = tick.current++ % total;
      const shown = new Set(photosRef.current.slice(0, total));
      let src = POOL[dealt.current++ % POOL.length];
      for (let guard = 0; shown.has(src) && guard < POOL.length; guard++) src = POOL[dealt.current++ % POOL.length];
      const next = photosRef.current.slice();
      next[cell] = src;
      photosRef.current = next;
      setPhotos(next);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [reduce, total]);

  let cellIndex = 0;
  return (
    <div ref={stripRef} className="flex w-full overflow-hidden px-2 [--h:280px]" style={{ height: "var(--h)", gap: GAP }}>
      {columns.map((c, ci) => (
        <div key={ci} className="flex h-full min-w-0 flex-col" style={{ flex: `${c.w} 1 0px`, gap: GAP }}>
          {c.rows.map((row, ri) => (
            <div key={ri} className="flex min-h-0" style={{ flex: `${c.rows.length === 1 ? 1 : ri === 0 ? c.split : 1 - c.split} 1 0px`, gap: GAP }}>
              {Array.from({ length: row.cells }, (_, k) => {
                const src = photos[cellIndex++ % photos.length];
                return (
                  <div key={k} className="relative min-w-0 overflow-hidden rounded-[8px] bg-ink/8" style={{ flex: `${row.cells === 1 ? 1 : k === 0 ? row.split : 1 - row.split} 1 0px` }}>
                    <Slot src={src} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** One frame: the photo that was here stays underneath while the new one fades in over it. */
function Slot({ src }: { src: string }) {
  const [layers, setLayers] = useState<string[]>([src]);
  useEffect(() => {
    setLayers((l) => (l[l.length - 1] === src ? l : [...l, src].slice(-2)));
  }, [src]);
  return (
    <>
      {layers.map((s, i) => (
        <motion.img
          key={s}
          src={s}
          alt=""
          loading="eager"
          className="absolute inset-0 size-full object-cover"
          initial={{ opacity: layers.length > 1 && i === layers.length - 1 ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE, ease: "easeInOut" }}
          onAnimationComplete={() => setLayers((l) => (l.length > 1 && l[l.length - 1] === s ? [s] : l))}
        />
      ))}
    </>
  );
}
